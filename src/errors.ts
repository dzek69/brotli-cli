/* eslint-disable @typescript-eslint/no-redeclare, import/group-exports */
import { createError } from "@ezez/errors";

import type { CompressionErrorInfo } from "./types";

export const NoFilesError = createError("NoFilesError");
export type NoFilesError = ReturnType<typeof NoFilesError>;

export const CompressionProcessError = createError<{ list: CompressionErrorInfo[] }>("CompressionProcessError");
export type CompressionProcessError = ReturnType<typeof CompressionProcessError>;

