import fs from "fs";
import util from "util";
import buffer from "buffer";
import os from "os";

const stat = util.promisify(fs.stat);

const is64Bit = ["x64", "arm64", "ppc64", "s390x"].includes(os.arch());
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const readFileSizeLimit = is64Bit ? Math.pow(2, 31) - 1 : Math.pow(2, 30) - 1;

const nativeReadFile = util.promisify(fs.readFile);

/**
 * Reads file using streams into buffer
 * @param path
 */
const readFile = async (path: string) => {
    const fileSize = await stat(path).then(stats => stats.size);

    if (fileSize > buffer.constants.MAX_LENGTH) {
        throw new Error(
            `File ${path} is too big to process, `
            + `${fileSize} bytes read but max ${buffer.constants.MAX_LENGTH} bytes allowed`,
        );
    }

    if (fileSize < readFileSizeLimit) {
        return nativeReadFile(path);
    }

    // TODO benchmark if it's worth to keep doing Buffer.concat instead of first pushing into the array and then
    //  concatenating on resolve. Currently it's probably less memory efficient but faster [? - wild guess]
    return new Promise<Buffer>((resolve, reject) => {
        const stream = fs.createReadStream(path);
        const chunks: Buffer[] = [];
        stream.on("data", chunk => {
            chunks.push(Buffer.from(chunk));
        });
        stream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        stream.on("error", reject);
    });
};
const writeFile = util.promisify(fs.writeFile);

export {
    readFile,
    writeFile,
};
