export const initMathJax = (config = {}, callback?: () => void) => {
    if (window.MathJax) return callback && callback();
    const script = document.createElement("script");
    script.src = "/mathjax/3.2.2/tex-svg-full.js";
    script.async = true;
    document.head.appendChild(script);
    // 没有找到好的配置解决办法，这里直接在localstorage里存入配置值
    // localStorage.setItem("MathJax-Menu-Settings", '{"renderer":"svg"}');
    const defaultConfig = {
        loader: { load: ["[tex]/unicode", "[tex]/mhchem"] },
        tex: { packages: { "[+]": ["unicode", "mhchem"] } },
        options: {
            enableMenu: false,
            menuOptions: {
                settings: {
                    renderer: "svg"
                }
            }
        },
        startup: {
            pageReady: () => {
                callback && callback();
            }
        }
    };

    const mergeConfig = Object.assign({}, defaultConfig, config);
    window.MathJax = mergeConfig;
};
