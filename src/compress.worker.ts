import { isMainThread, parentPort, workerData } from "worker_threads";

import type { WorkerData, WorkerReturnMessage } from "./types";

import { compress } from "./compress.js";

if (isMainThread) {
    throw new Error("This file should not be imported from the main thread");
}

const { filePath, mode, quality, windowSize, engine, writeTo, br } = workerData as WorkerData;

const now = Date.now();
compress({
    filePath,
    mode,
    quality,
    windowSize,
    engine,
    writeTo,
    br,
}).then(() => {
    console.warn(`WORKER: File ${filePath} compressed in ${Date.now() - now}ms`);
    parentPort!.postMessage({
        status: "ok",
    } satisfies WorkerReturnMessage);
}).catch((error: unknown) => {
    const message = error && error instanceof Error ? error.message : String(error);
    parentPort!.postMessage({
        status: "error",
        message: message,
    } satisfies WorkerReturnMessage);
});
