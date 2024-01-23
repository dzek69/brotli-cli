import fs from "fs-extra";
import { run } from "./utils.mjs";

const contents = `{"type": "commonjs"}`;

(async () => {
    console.info("[CJS compile post-processing started]");
    await fs.writeFile("./dist/package.json", contents);
    console.info("Written dist/package.json with commonjs type fix");
    await run("resolve-tspaths", ["--project", "tsconfig.cjs.json"]);
    console.info("Resolved TypeScript import paths");
    console.info("[CJS compile post-processing ended]");
})();
