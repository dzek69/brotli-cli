# brotli-cli

A basic Brotli CLI files compressor. W.I.P. CLI api will change.

Based on `brotli` npm module.

## Usage

### Global install

1. `npm i -g brotli-cli`
1. `brotli-cli file1.txt file2.svg file3.js`

Files will be created in the same directory, but with `.br` extension appended. Overwriting will occur without asking.

### Local install

You need npm 5.2+ for this:

1. `npm i brotli-cli`
1. `npx brotli-cli file1.txt file2.svg file3.js`

## License

MIT