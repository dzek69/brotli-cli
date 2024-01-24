import zlib from "zlib";
import util from "util";

import { compress as libCompress } from "brotli";

import type { Mode, ModeNumeric, Quality, WindowSize } from "./types";

import { modes } from "./const.js";

const zlibCompress = "brotliCompress" in zlib ? util.promisify(zlib.brotliCompress) : undefined;

type Options = {
    mode: Mode;
    quality: Quality;
    windowSize: WindowSize;
};

const anyCompress = (data: Buffer, engine: "library" | "native", options: Options): Promise<Uint8Array> => {
    if (engine === "native" && zlibCompress) {
        return zlibCompress(data, {
            params: {
                [zlib.constants.BROTLI_PARAM_MODE]: modes.indexOf(options.mode) as ModeNumeric,
                [zlib.constants.BROTLI_PARAM_QUALITY]: options.quality,
                [zlib.constants.BROTLI_PARAM_LGWIN]: options.windowSize,
            },
        });
    }

    return Promise.resolve(libCompress(data, {
        mode: modes.indexOf(options.mode) as ModeNumeric,
        quality: options.quality,
        lgwin: options.windowSize,
    }));
};

export {
    anyCompress,
};
