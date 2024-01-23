import zlib from "zlib";
import util from "util";

import type { Mode, ModeNumeric, Quality, WindowSize } from "./types";

import { modes } from "./const.js";

const zlibCompress = util.promisify(zlib.brotliCompress);

type Options = {
    mode: Mode;
    quality: Quality;
    windowSize: WindowSize;
};

const anyCompress = (data: Buffer, options: Options): Promise<Uint8Array> => {
    return zlibCompress(data, {
        params: {
            [zlib.constants.BROTLI_PARAM_MODE]: modes.indexOf(options.mode) as ModeNumeric,
            [zlib.constants.BROTLI_PARAM_QUALITY]: options.quality,
            [zlib.constants.BROTLI_PARAM_LGWIN]: options.windowSize,
        },
    });
};

export {
    anyCompress,
};
