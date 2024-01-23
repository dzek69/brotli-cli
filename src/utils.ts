import fs from "fs";
import util from "util";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export {
    readFile,
    writeFile,
};
