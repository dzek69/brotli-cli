# brotli-cli

Brotli files compressor, now from 10 times faster! ⚡

## Usage

1. Install globally `npm i -g brotli-cli`
1. No install: `npx brotli-cli ... (other params)`

### Compressing given files:
1. `brotli-cli compress file1.txt file2.svg file3.js`

> Files will be created in the same directory, but with `.br` extension appended. Overwriting will occur without asking.

### Compressing by glob pattern:
1. `brotli-cli compress --glob "public/*.html"`

> Files will be created in the same directory, but with `.br` extension appended. Overwriting will occur without asking.

### Printing to stdout:
> To do this, you can only specify one file to compress, and you have to add `-` at the end of the command.
1. `brotli-cli compress index.html -`
1. `brotli-cli compress index.html - > compressed.html`

## Detailed usage

```
Commands:
  brotli-cli compress  Compresses specified files

Options:
      --help                               Show help                                      [boolean]
      --version                            Show version number                            [boolean]
  -m, --mode                               Brotli compression mode            [generic, text, font] [default: "generic"]
  -q, --quality                            Brotli compression quality                        [0-11] [default: 11]
  -t, --threads                            Use this many concurrent jobs [number of threads or `true` for threads=CPUs
                                           amount]                                                  [default: true]
  -l, --lgwin                              Brotli compression window size                [0, 10-24] [default: 24]
  -b, --bail                               Stop execution on first error                  [boolean] [default: true]
      --add-extension, --br                Add .br extension to compressed files          [boolean] [default: true]
  -g, --glob                               Use glob pattern when matching files           [boolean] [default: false]
      --glob-skip-br-extension, --skip-br  Always skip .br extension when matching files  [boolean] [default: true]
  -v, --verbose                            Run with verbose logging                       [boolean] [default: false]

Examples:
  brotli-cli compress -q 5 image.jpg                       Compress `image.jpg` file with generic compression level 5 and save to image.jpg.br
  brotli-cli compress -q 5 -br false image.jpg             Compress `image.jpg` file and overwrite it
  brotli-cli compress -mode text index.html -              Compress `index.html` file with text mode max compression (level 11) and print to stdout
  brotli-cli compress --glob "images/*.jpg"                Compress all jpg files from `images` directory, stop on first error.
  brotli-cli compress --glob --bail false "images/*.jpg"   Compress all jpg files from `images` directory, do not stop on first error (will still print errors to stderr and exit with error code).
```

## Limitations and warnings

Because node's `zlib` can't work with streams (nor the previously used `brotli` npm module) -
all the file contents to be compressed must be loaded into memory.
Usually this does not matter, but keep few things in mind:
- if you're low on memory and you're compressing large files you might want to decrease threads amount
- compressing files over 1GB on 32-bit systems and 2GB on 64-bit systems is even less memory efficient
- absolute max file size limit is 4GB (actually it's determined by `buffer.constants.MAX_LENGTH` so this may vary)

## License

MIT
