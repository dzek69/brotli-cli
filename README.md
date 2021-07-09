# brotli-cli

Brotli files compressor.
Decompression feature will come.

Based on `brotli` npm module.

## Usage

### Global install

1. `npm i -g brotli-cli`
1. `brotli-cli compress file1.txt file2.svg file3.js`
1. (see Detailed Usage for glob support)

### Local install / no install
> You need npm 5.2+ for this

1. `npm i brotli-cli`
1. `npx brotli-cli compress file1.txt file2.svg file3.js`
1. (see Detailed Usage for glob support)

Files will be created in the same directory, but with `.br` extension appended. Overwriting will occur without asking.

## Detailed usage

```
Commands:
  brotli-cli compress  Compresses specified files

Options:
      --help                               Show help                                      [boolean]
      --version                            Show version number                            [boolean]
  -m, --mode                               Brotli compression mode            [generic, text, font] [default: "generic"]
  -q, --quality                            Brotli compression quality                        [0-11] [default: 11]
  -l, --lgwin                              Brotli compression window size                [0, 10-24] [default: 0]
  -b, --bail                               Stop execution on first error                  [boolean] [default: true]
      --add-extension, --br                Add .br extension to compressed files          [boolean] [default: true]
  -g, --glob                               Use glob pattern when matching files           [boolean] [default: false]
      --glob-skip-br-extension, --skip-br  Always skip .br extension when matching files  [boolean] [default: true]
  -v, --verbose                            Run with verbose logging                       [boolean] [default: false]

Examples:
  brotli-cli compress -q 5 image.jpg                       Compress `image.jpg` file with generic compression level 5 and save to image.jpg.br
  brotli-cli compress -q 5 -br false image.jpg             Compress `image.jpg` file and overwrite it
  brotli-cli compress -mode text index.html -              Compress `index.html` file with text mode max compression (level 11) and print to stdout
  brotli-cli compress --glob "images/*.jpg                 Compress all jpg files from `images` directory, stop on first error.
  brotli-cli compress --glob --bail false "images/*.jpg"   Compress all jpg files from `images` directory, do not stop on first error (will still print errors to std err and exit with error code).
```

## License

MIT
