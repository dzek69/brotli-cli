type Mode = "generic" | "text" | "font";
type ModeNumeric = 0 | 1 | 2;
type Quality = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
type WindowSize = 0 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;

type CompressionErrorInfo = {
    file: string;
    error: unknown;
};

type WorkerData = {
    filePath: string;
    mode: Mode;
    quality: Quality;
    windowSize: WindowSize;
    engine: "library" | "native";
    writeTo: "file";
    br: boolean;
};

type WorkerReturnMessage = {
    status: "ok";
} | {
    status: "error";
    message: string;
};

type CompressSingleFileOptions = {
    filePath: string;
    mode: Mode;
    quality: Quality;
    windowSize: WindowSize;
    engine: "library" | "native";
    writeTo: "stdout" | "file";
    br: boolean;
};

export type {
    Mode,
    ModeNumeric,
    Quality,
    WindowSize,
    CompressionErrorInfo,
    WorkerData,
    WorkerReturnMessage,
    CompressSingleFileOptions,
};
