#!/usr/bin/env node
/* eslint-disable max-lines */
import yargs from "yargs";
import fastGlob from "fast-glob";

import type { Mode, Quality, WindowSize } from "./types";
import type { CompressQueueOptions } from "./compressQueue";

import { CompressionProcessError, NoFilesError } from "./errors.js";
import { ALL_CPUS } from "./config.js";
import { modes, quality, windowSize } from "./const.js";
import { compressQueue } from "./compressQueue.js";

const noop = () => undefined;

// eslint-disable-next-line @typescript-eslint/no-unused-expressions,@typescript-eslint/no-magic-numbers,@typescript-eslint/no-floating-promises
yargs(process.argv.slice(2))
    .scriptName("brotli-cli")
    .usage("This tool allows you to compress given files with Brotli compression.")
    .example(
        "$0 compress -q 5 image.jpg",
        "Compress `image.jpg` file with generic compression level 5 and save to image.jpg.br",
    )
    .example(
        "$0 compress -q 5 -br false image.jpg",
        "Compress `image.jpg` file and overwrite it",
    )
    .example(
        "$0 compress -mode text index.html -",
        "Compress `index.html` file with text mode max compression (level 11) and print to stdout",
    )
    .example(
        `$0 compress --glob "images/*.jpg"`,
        "Compress all jpg files from `images` directory, stop on first error.",
    )
    .example(
        `$0 compress --glob --bail false "images/*.jpg"`,
        "Compress all jpg files from `images` directory, do not stop on first error "
        + "(will still print errors to std err and exit with error code).",
    )
    .option("mode", {
        alias: "m",
        choices: modes,
        default: modes[0],
        description: "Brotli compression mode",
    })
    .option("quality", {
        alias: "q",
        choices: quality,
        default: 11,
        description: "Brotli compression quality",
    })
    .option("threads", {
        alias: "t",
        description: "Use this many concurrent jobs [number of threads or `true` for threads=CPUs amount]",
        default: true,
        coerce: (value: unknown) => {
            if (value === true) {
                return ALL_CPUS;
            }
            if (value === false) {
                return 1;
            }
            const isInt = Number.isInteger(Number(value));
            const num = Number(value);
            if (isInt) {
                if (num === 0) {
                    // zero = all cpus
                    return ALL_CPUS;
                }
                if (num < 0) {
                    throw new TypeError("Threads amount must be positive");
                }
                return Number(value);
            }

            // not boolean and not valid integer
            return ALL_CPUS;
        },
    })
    .option("lgwin", {
        alias: "l",
        choices: windowSize,
        default: 24,
        description: "Brotli compression window size",
    })
    .option("bail", {
        alias: "b",
        type: "boolean",
        default: true,
        description: "Stop execution on first error",
    })
    .option("add-extension", {
        alias: "br",
        type: "boolean",
        default: true,
        description: "Add .br extension to compressed files",
    })
    .option("glob", {
        alias: "g",
        type: "boolean",
        default: false,
        description: "Use glob pattern when matching files",
    })
    .option("glob-skip-br-extension", {
        alias: "skip-br",
        type: "boolean",
        default: true,
        description: "Always skip .br extension when matching files",
    })
    .option("verbose", {
        alias: "v",
        type: "boolean",
        default: false,
        description: "Run with verbose logging",
    })
    // eslint-disable-next-line max-statements,max-lines-per-function
    .command("compress", "Compresses specified files", noop, async (argv) => {
        try {
            const list = argv._.slice(1).map(String);
            if (process.argv[2] === "compress" && process.argv[2] === list[0]) {
                // command will get into _ list, so we need to get rid of that if command is specified
                list.shift();
            }

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const printToStdOut = !argv.glob && list.length === 2 && list[1] === "-";
            if (printToStdOut) {
                list.pop();
            }

            if (argv.v && argv.glob) {
                console.warn("Glob enabled, will match these patterns");
                list.forEach(pattern => {
                    console.warn("  -", pattern);
                });
            }
            let files: string[];
            if (argv.glob) {
                files = await fastGlob(list, { dot: true });

                if (argv.skipBr) {
                    const filteredOut: typeof files = [];
                    files = files.filter(file => {
                        const isBr = file.endsWith(".br");
                        if (isBr) {
                            filteredOut.push(file);
                        }
                        return !isBr;
                    });

                    if (filteredOut.length && argv.v) {
                        console.warn("Filtered out", filteredOut.length, "matched .br files");
                        filteredOut.forEach(file => {
                            console.warn("  -", file);
                        });
                    }
                }
            }
            else {
                files = list;
            }

            if (!files.length) {
                if (argv.glob) {
                    throw new NoFilesError("No files matched the pattern(s)");
                }
                throw new NoFilesError("No files to compress");
            }

            if (argv.v) {
                if (argv.glob) {
                    console.warn(`Matched those files (${files.length})`);
                }
                else {
                    console.warn("Glob disabled, will try to compress these");
                }
                files.forEach(file => {
                    console.warn("  -", file);
                });

                console.warn("");
                console.warn(`Starting compression with ${argv.threads} threads`);
            }
            else {
                console.warn(`Starting compression of ${files.length} files with ${argv.threads} threads if possible`);
            }

            const options: CompressQueueOptions = {
                mode: argv.mode as Mode,
                quality: argv.quality as Quality,
                windowSize: argv.lgwin as WindowSize,
                concurrency: argv.threads,
                bail: argv.bail,
                br: Boolean(argv.br),
                printToStdOut: printToStdOut,
                files: files,
            };

            await compressQueue(options, Boolean(argv.v));
            console.warn("OK");
        }
        catch (error: unknown) {
            // manual error handling will also prevent printing help before the error
            if (error instanceof CompressionProcessError) {
                if (argv.bail) {
                    console.error("Error happened during compression process, the process is stopped.");
                }
                else {
                    const errorsCount = error.details?.list.length;
                    console.error(
                        `Some errors (${String(errorsCount)}) happened during compression process.`
                        + ` All other files finished successfully.`,
                    );
                }

                (error.details?.list)?.forEach((e) => {
                    console.error("File:", e.file);
                    console.error(e.error);
                });
            }
            else {
                console.error(error);
            }
            // eslint-disable-next-line no-process-exit
            process.exit(1);
        }
    })
    .command("*", false, noop, () => {
        yargs.showHelp();

        console.error();
        if (!process.argv[2]) {
            console.error("No command given, did you miss `compress` keyword?");
            return;
        }
        console.error("Unknown command, did you miss `compress` keyword?");
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    })
    .strictOptions(true)
    .argv; // yargs needs that unused expression

