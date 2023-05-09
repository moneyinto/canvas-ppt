import { IRectParameter } from "@/types";
import SparkMD5 from "spark-md5";

// throttle callback to execute once per animation frame
export const throttleRAF = <T extends unknown[]>(fn: (...args: T) => void) => {
    let handle: number | null = null;
    let lastArgs: T | null = null;
    let callback: ((...args: T) => void) | null = null;
    const ret = (...args: T) => {
        lastArgs = args;
        callback = fn;
        if (handle === null) {
            handle = window.requestAnimationFrame(() => {
                handle = null;
                lastArgs = null;
                callback = null;
                fn(...args);
            });
        }
    };
    ret.flush = () => {
        if (handle !== null) {
            cancelAnimationFrame(handle);
            handle = null;
        }
        if (lastArgs) {
            const _lastArgs = lastArgs;
            const _callback = callback;
            lastArgs = null;
            callback = null;
            if (_callback !== null) {
                _callback(..._lastArgs);
            }
        }
    };
    ret.cancel = () => {
        lastArgs = null;
        callback = null;
        if (handle !== null) {
            cancelAnimationFrame(handle);
            handle = null;
        }
    };
    return ret;
};

export const deepClone = (obj: any) => {
    if (!obj) return obj;
    return JSON.parse(JSON.stringify(obj));
};

/**
 * 角度计算（将角度转换成0-360）
 * @param angle
 * @returns
 */
export const normalizeAngle = (angle: number): number => {
    let newAngle = angle;
    if (angle >= 2 * Math.PI) {
        newAngle = angle - 2 * Math.PI;
    }
    if (angle < 0) {
        newAngle = angle + 2 * Math.PI;
    }
    return (newAngle / Math.PI) * 180;
};

export const checkIsMac = () => {
    return /macintosh|mac os x/i.test(navigator.userAgent);
};

export const debounce = <T extends unknown[]>(
    fn: (...args: T) => void,
    delay: number
) => {
    let timerId: NodeJS.Timeout | number | null = null; // 使用闭包的特性，存储timerId
    return function(...args: T) {
        // 当timerId有值时，说明有正在准备执行的函数，需要将它清除
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        // 设置新的延时执行
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    };
};

/**
 * 判断操作系统是否存在某字体
 * @param fontName 字体名
 */
export const isSupportFont = (fontName: string) => {
    if (typeof fontName !== "string") return false;

    const arial = "Arial";
    if (fontName.toLowerCase() === arial.toLowerCase()) return true;

    const size = 100;
    const width = 100;
    const height = 100;
    const str = "a";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) return false;

    canvas.width = width;
    canvas.height = height;
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";

    const getDotArray = (_fontFamily: string) => {
        ctx.clearRect(0, 0, width, height);
        ctx.font = `${size}px ${_fontFamily}, ${arial}`;
        ctx.fillText(str, width / 2, height / 2);
        const imageData = ctx.getImageData(0, 0, width, height).data;
        return [].slice.call(imageData).filter((item) => item !== 0);
    };

    return getDotArray(arial).join("") !== getDotArray(fontName).join("");
};

export const sleep = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

export const fomatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time - h * 3600) / 60);
    const s = Math.floor(time - h * 3600 - m * 60);
    const hStr = `${h.toString().padStart(2, "0")}`;
    return `${hStr === "00" ? "" : hStr + ":"}${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const enterFullScreen = () => {
    const docElm: any = document.documentElement;
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullscreen) {
        docElm.webkitRequestFullScreen();
    } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
    }
};

export const exitFullScreen = () => {
    const dom: any = document;
    if (dom.exitFullscreen) dom.exitFullscreen();
    else if (dom.mozCancelFullScreen) dom.mozCancelFullScreen();
    else if (dom.webkitCancelFullScreen) dom.webkitCancelFullScreen();
    else if (dom.msExitFullscreen) dom.msExitFullscreen();
};

export const isFullScreen = () => {
    const dom: any = document;
    return !!(
        dom.mozFullScreen ||
        dom.webkitIsFullScreen ||
        dom.webkitFullScreen ||
        dom.msFullScreen
    );
};

/**
 * 文件md5
 * @param file
 * @returns
 */
export const fileMd5 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const blobSlice = File.prototype.slice;
        const chunkSize = 2097152; // 2MB
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();

        fileReader.onload = () => {
            spark.append(fileReader.result as ArrayBuffer); // Append array buffer
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                const md5 = spark.end(); // 得到md5
                spark.destroy(); // 释放缓存
                resolve(md5);
            }
        };

        fileReader.onerror = () => {
            console.error("文件md5失败");
        };

        const loadNext = () => {
            const start = currentChunk * chunkSize;
            const end =
                start + chunkSize >= file.size ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        };

        loadNext();
    });
};

export const dataURLtoFile = (
    dataurl: string,
    filename: string,
    type: string
) => {
    // 获取到base64编码
    const arr = dataurl.split(",");
    // 将base64编码转为字符串
    const bstr = window.atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n); // 创建初始化为0的，包含length个元素的无符号整型数组
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type });
};

export const getVideoElementControlPoints = (
    x: number,
    y: number,
    elementWidth: number,
    elementHeight: number
) => {
    // 增加模糊值，来扩大选中区域
    const PLAY_PAUSE_BTN: IRectParameter = [
        x + 20 - 1,
        y + elementHeight - 30 - 1,
        11 + 2,
        12 + 2
    ];

    const PROGRESS_LINE: IRectParameter = [
        x + 15 - 1,
        y + elementHeight - 45 - 1,
        elementWidth - 30 + 2,
        4 + 2
    ];

    const FULLSCREEN_BTN: IRectParameter = [
        x + elementWidth - 32 - 1,
        y + elementHeight - 30 - 1,
        12 + 2,
        12 + 2
    ];

    return {
        PLAY_PAUSE_BTN,
        PROGRESS_LINE,
        FULLSCREEN_BTN
    };
};
