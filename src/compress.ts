import type { Mode, Quality, WindowSize } from "./types";

import { readFile, writeFile } from "./utils.js";
import { anyCompress } from "./anyCompress.js";

type Options = {
    filePath: string;
    mode: Mode;
    quality: Quality;
    windowSize: WindowSize;
    engine: "library" | "native";
    writeTo: "stdout" | "file";
    br: boolean;
};

type CompressResult = {
    sourceLength: number;
    compressed: Uint8Array | null;
};

const compress = async (options: Options): Promise<CompressResult> => {
    const buffer = await readFile(options.filePath);
    if (buffer.length === 0) {
        return {
            sourceLength: 0,
            compressed: null,
        };
    }

    const result: CompressResult = {
        sourceLength: buffer.length,
        compressed: await anyCompress(buffer, options.engine, {
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

    return result;
};

export {
    compress,
};
