import type { Mode, Quality, WindowSize } from "./types";

const modes: readonly Mode[] = ["generic", "text", "font"];
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const quality: readonly Quality[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const windowSize: readonly WindowSize[] = [0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

export {
    modes,
    quality,
    windowSize,
};
