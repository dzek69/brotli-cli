import { EVENTS, Queue } from "queue-system";

import type { EventsTypes } from "queue-system/esm/const";
import type { CompressionErrorInfo, Mode, Quality, WindowSize } from "./types";

import { compress } from "./compress.js";
import { writeFile } from "./utils.js";
import { CompressionProcessError } from "./errors.js";

type Options = {
    files: string[];
    concurrency: number;
    printToStdOut: boolean;
    br: boolean;
    bail: boolean;
    mode: Mode;
    quality: Quality;
    windowSize: WindowSize;
    engine: "library" | "native";
};

const noop = () => undefined;

// eslint-disable-next-line max-lines-per-function
const compressQueue = (options: Options) => {
    // eslint-disable-next-line max-lines-per-function
    return new Promise<void>((resolve, reject) => {
        let fulfilled = false;

        const errors: CompressionErrorInfo[] = [];

        const q = new Queue({ paused: true, concurrency: options.concurrency });
        options.files.forEach(file => {
            const task = q.add(() => compress({
                filePath: file,
                mode: options.mode,
                quality: options.quality,
                windowSize: options.windowSize,
                engine: options.engine,
            }).then(({ sourceLength, compressed }) => {
                if (options.printToStdOut) {
                    process.stdout.write(compressed ?? "");
                    return;
                }
                if (sourceLength && compressed == null) {
                    throw new TypeError("Empty response returned from brotli");
                }
                return writeFile(options.br ? file + ".br" : file, compressed ?? "");
            }));
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
