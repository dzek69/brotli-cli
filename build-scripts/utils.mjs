import { spawn } from "child_process";

const run = (command, args) => {
    return new Promise((resolve, reject) => {
        const cmd = spawn(command, args, {
            stdio: ["ignore", "inherit", "inherit"],
        });

        cmd.on("close", (code) => {
            if (!code) {
                resolve();
                return;
            }

            reject(new Error(`Program exited with code ${code}`));
        });

        cmd.on("error", () => {
            reject(new Error(`Can't start program`));
        });
    });
};

export {
    run
}
