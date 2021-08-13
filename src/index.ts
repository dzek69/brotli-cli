#!/usr/bin/env node
/* eslint-disable max-lines */
import fs from "fs";
import util from "util";
import yargs from "yargs";
import fg from "fast-glob";
import { compress } from "brotli";

import { CompressionProcessError, NoFilesError } from "./errors.js";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const noop = () => undefined;

type Mode = "generic" | "text" | "font";
const modes: readonly Mode[] = ["generic", "text", "font"];

type Quality = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const quality: readonly Quality[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

type WindowSize = 0 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const windowSize: readonly WindowSize[] = [0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

interface CompressionError {
    file: string;
    error: unknown;
}

// yargs needs that unused expression
// eslint-disable-next-line @typescript-eslint/no-unused-expressions,@typescript-eslint/no-magic-numbers
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
    .option("lgwin", {
        alias: "l",
        choices: windowSize,
        default: 0,
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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises,max-statements,max-lines-per-function
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
            let files;
            if (argv.glob) {
                files = await fg(list, { dot: true });

                if (argv.noBr) {
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
                    console.warn("Matched those files");
                }
                else {
                    console.warn("Glob disabled, will try to compress these");
                }
                files.forEach(file => {
                    console.warn("  -", file);
                });
            }

            const errors: CompressionError[] = [];

            await Promise.all(files.map(file => {
                let p = readFile(file)
                    .then(buffer => {
                        if (!buffer.length) {
                            return {
                                sourceLength: 0,
                                compressed: null,
                            };
                        }

                        return {
                            sourceLength: buffer.length,
                            compressed: compress(buffer, {
                                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                                mode: modes.indexOf(argv.mode) as 0 | 1 | 2,
                                quality: argv.quality as Quality,
                                lgwin: argv.lgwin,
                            }),
                        };
                    })
                    .then(async ({ sourceLength, compressed }) => {
                        if (printToStdOut) {
                            process.stdout.write(compressed ?? "");
                            return;
                        }
                        if (sourceLength && compressed == null) {
                            throw new TypeError("Empty response returned from brotli");
                        }
                        return writeFile(argv.br ? file + ".br" : file, compressed ?? "");
                    });

                if (!argv.bail) {
                    p = p.catch((error: unknown) => {
                        errors.push({
                            file, error,
                        });
                    });
                }
                else {
                    p = p.catch((error: unknown) => {
                        throw new CompressionProcessError(`Error happened during compression process`, {
                            list: [{
                                file,
                                error,
                            }],
                        });
                    });
                }
                return p;
            }));

            if (errors.length) {
                throw new CompressionProcessError(`${errors.length} errors happened during compression process`, {
                    list: errors,
                });
            }
            if (!printToStdOut) {
                console.warn("OK");
            }
        }
        catch (error: unknown) {
            // manual error handling will also prevent printing help before the error
            if (error instanceof CompressionProcessError) {
                if (argv.bail) {
                    console.error("Error happened during compression process, the process is stopped.");
                }
                else {
                    console.error(
                        "Some errors happened during compression process. All other files finished successfully.",
                    );
                }
                // @ts-expect-error better-custom-error needs improvement
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (error.details.list as CompressionError[]).forEach((e) => {
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

export {};
