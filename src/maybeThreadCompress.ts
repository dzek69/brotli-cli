/* eslint-disable @typescript-eslint/no-shadow */
import path from "path";
import { Worker } from "worker_threads";

import type { CompressSingleFileOptions, WorkerData, WorkerReturnMessage } from "./types";

import { __filename } from "./file/file.cjs";
import { compress } from "./compress";
import { WORKERS_SUPPORTED } from "./config";

/**
 * Base path where all the files are.
 */
const basePath = path.dirname(path.dirname(__filename as string));
const workerPath = path.join(basePath, "compress.worker.js");

type WorkerOptions = {
    worker: boolean;
};

let warningShown = false;

const maybeThreadCompress = (options: CompressSingleFileOptions & WorkerOptions) => {
    const useWorker = options.worker && WORKERS_SUPPORTED && options.writeTo === "file" && options.engine === "library";
    if (options.worker && !WORKERS_SUPPORTED && !warningShown) {
        console.warn("Worker threads are not supported on this platform, will compress in main thread");
        warningShown = true;
    }

    if (useWorker) {
        return new Promise<void>((resolve, reject) => {
            const worker = new Worker(workerPath, {
                workerData: {
                    mode: options.mode,
                    quality: options.quality,
                    windowSize: options.windowSize,
                    engine: options.engine,
                    writeTo: "file",
                    br: options.br,
                    filePath: options.filePath,
                } satisfies WorkerData,
            });
            worker.on("message", (message: WorkerReturnMessage) => {
                if (message.status === "ok") {
                    resolve();
                    return;
                }
                reject(new Error(message.message));
            });
            worker.on("error", (error) => {
                reject(error);
            });
        });
    }

    return compress(options);
};

export {
    maybeThreadCompress,
};
