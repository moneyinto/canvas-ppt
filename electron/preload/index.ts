import fs from "fs";

window.electron = {
    exit: () => {
        console.log("xxxx exit");
    },
    readFile: (path: string) => {
        const content = fs.readFileSync(path, {
            encoding: "utf-8"
        });
        return content;
    }
}
