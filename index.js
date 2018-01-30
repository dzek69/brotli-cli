#!/usr/bin/env node
const fs = require("fs-extra");
const compress = require("brotli/compress");
const [nodePath, scriptPath, ...files] = process.argv;

const errored = [];
const promises = [];
files.forEach(file => {
    const p = fs.readFile(file)
        .then(buffer => compress(buffer, {
            mode: 0,
            quality: 11,
        }))
        .then((compressed) => fs.writeFile(file + ".br", compressed))
        .catch(error => {
            errored.push({
                file, error,
            });
        });
    promises.push(p);
});

Promise.all(promises).then(() => {
    console.log(`Processed ${files.length} files`);
    errored.length && console.log(`These files failed: `, errored.map(e => e.file));
});