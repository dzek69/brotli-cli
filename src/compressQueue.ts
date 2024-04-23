import { EVENTS, Queue } from "queue-system";

import type { EventsTypes } from "queue-system/esm/const";
import type { CompressionErrorInfo, Mode, Quality, WindowSize } from "./types";

import { CompressionProcessError } from "./errors.js";
import { compress } from "./compress.js";

type Options = {
    files: string[];
    concurrency: number;
    printToStdOut: boolean;
    br: boolean;
    bail: boolean;
    mode: Mode;
    quality: Quality;
    windowSize: WindowSize;
};

const noop = () => undefined;

// eslint-disable-next-line max-lines-per-function
const compressQueue = (options: Options, verbose: boolean) => {
    // eslint-disable-next-line max-lines-per-function
    return new Promise<void>((resolve, reject) => {
        let fulfilled = false;

        const errors: CompressionErrorInfo[] = [];

        const q = new Queue({ paused: true, concurrency: options.concurrency });
        options.files.forEach(file => {
            let taskStart = 0;
            const task = q.add(() => {
                taskStart = Date.now();
                if (verbose) {
                    console.warn(`Processing file ${file}`);
                }
                return compress({
                    filePath: file,
                    mode: options.mode,
                    quality: options.quality,
                    windowSize: options.windowSize,
                    writeTo: options.printToStdOut ? "stdout" : "file",
                    br: options.br,
                }).finally(() => {
                    if (verbose) {
                        console.warn(`File ${file} processed in ${Date.now() - taskStart}ms`);
                    }
                });
            });
            task.promise.catch(noop);
            task.data = { file };
        });

        q.unpause();

        const taskErrorHandler: EventsTypes["task-error"] = (task, error) => {
            const errorData = {
                file: String(task.data!.file),
                error: error,
            };

            if (options.bail) {
                fulfilled = true;
                const err = new CompressionProcessError(`Error happened during compression process`, {
                    list: [errorData],
                });
                reject(err);
                q.destroy();
                return;
            }
            errors.push(errorData);
        };

        q.on(EVENTS.TASK_ERROR, taskErrorHandler);

        q.on(EVENTS.QUEUE_SIZE, size => {
            if (fulfilled) {
                return;
            }
            if (size === 0) {
                fulfilled = true;
                if (errors.length) {
                    const err = new CompressionProcessError(
                        `${errors.length} errors happened during compression process`, {
                            list: errors,
                        },
                    );
                    reject(err);
                }
                else {
                    resolve();
                }
                q.destroy();
            }
        });
    });
};

export {
    compressQueue,
};

export type {
    Options as CompressQueueOptions,
};
