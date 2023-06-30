console.log(
    `%c
     ____  ____  ______   ______   ______  __    ___ __  ______      __       ______
    /    \\/    \\/  __  \\ /  __  \\ /  __  \\/  \\  /  /|__|/  __  \\ ___|  |___  /  __  \\
    |  |\\  /|  |  |  |  |  |  |  |  |__|  |\\  \\/  /  __   |  |  |\\__    ___\\|  |  |  |
    |  | \\/ |  |  |  |  |  |  |  |  _____/  \\_   /  |  |  |  |  |   |  |    |  |  |  |
    |  |    |  |  |__|  |  |  |  |  |_____  _/  /   |  |  |  |  |   |  |___ |  |__|  |
    |__|    |__|\\______/|__|  |__|\\______/ |___/    |__|__|  |__|    \\____/  \\______/
    `, "color: blue;"
);
console.log(`%c ${window.__APP_MPPTX__ ? window.__APP_MPPTX__.name : "mpptx在线文档"}`, "color: blue;font-size: 30px;font-weight: bold;");
const content = `
版 本 号：${window.__APP_MPPTX__ ? window.__APP_MPPTX__.version : "1.0.0"}
更新日期：2023-06-05

Github:  https://github.com/moneyinto/canvas-ppt
`;
console.log(`%c ${content}`, `color: blue;`);
