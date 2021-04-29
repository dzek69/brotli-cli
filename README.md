# brotli-cli

Brotli files compressor.
Decompression feature will come.

Based on `brotli` npm module.

## Usage

### Global install

1. `npm i -g brotli-cli`
1. `brotli-cli compress file1.txt file2.svg file3.js`

Files will be created in the same directory, but with `.br` extension appended. Overwriting will occur without asking.

Run
1. `brotli-cli help` for help and more examples.

### Local install

You need npm 5.2+ for this:

1. `npm i brotli-cli`
1. `npx brotli-cli file1.txt file2.svg file3.js`

### Run without installing

You need npm 5.2+ for this:

1. `npx brotli-cli file1.txt file2.svg file3.js`

## License

MIT
