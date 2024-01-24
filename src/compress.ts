import { compress as libCompress } from "brotli";

import type { Mode, ModeNumeric, Quality, WindowSize } from "./types";

import { readFile } from "./utils.js";
import { modes } from "./const.js";

type Options = {
    filePath: string;
    mode: Mode;
    quality: Quality;
    windowSize: WindowSize;
    engine: "library" | "native";
};

type CompressResult = {
    sourceLength: number;
    compressed: Uint8Array | null;
};

const compress = async (options: Options): Promise<CompressResult> => {
    if (options.engine === "native") {
        throw new Error("Not implemented");
    }

    const buffer = await readFile(options.filePath);
    if (buffer.length === 0) {
        return {
            sourceLength: 0,
            compressed: null,
        };
    }

    return {
        sourceLength: buffer.length,
        compressed: libCompress(buffer, {
            mode: modes.indexOf(options.mode) as ModeNumeric,
            quality: options.quality,
            lgwin: options.windowSize,
        }),
    };
};

export {
    compress,
};
