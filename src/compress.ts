import type { CompressSingleFileOptions } from "./types";

import { readFile, writeFile } from "./utils.js";
import { anyCompress } from "./anyCompress.js";

type CompressResult = {
    sourceLength: number;
    compressed: Uint8Array | null;
};

const compress = async (options: CompressSingleFileOptions) => {
    const buffer = await readFile(options.filePath);
    if (buffer.length === 0) {
        return;
    }

    const result: CompressResult = {
        sourceLength: buffer.length,
        compressed: await anyCompress(buffer, {
            mode: options.mode,
            quality: options.quality,
            windowSize: options.windowSize,
        }),
    };

    if (result.sourceLength && result.compressed == null) {
        throw new TypeError("Empty response returned from brotli");
    }

    if (options.writeTo === "stdout") {
        process.stdout.write(result.compressed ?? "");
    }
    else {
        await writeFile(options.filePath + ".br", result.compressed ?? "");
    }
};

export {
    compress,
};
