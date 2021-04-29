import fs from "fs-extra";

(async () => {
    console.info("[CJS compile post-processing started]");
    await fs.writeFile("./dist/package.json", JSON.stringify({ type: "commonjs" }))
    console.info("[CJS compile post-processing ended]");
})();
