import { createError } from "better-custom-error";

const NoFilesError = createError("NoFilesError");
const CompressionProcessError = createError("CompressionProcessError");

export {
    NoFilesError,
    CompressionProcessError,
};
