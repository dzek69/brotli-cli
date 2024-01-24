import os from "os";

const nodeV = process.versions.node;
const nodeVNum = Number(nodeV.split(".")[0]);
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const WORKERS_SUPPORTED = nodeVNum >= 12;

const ALL_CPUS = os.cpus().length;

export {
    WORKERS_SUPPORTED,
    ALL_CPUS,
};
