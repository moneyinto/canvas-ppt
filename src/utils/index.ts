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

export const debounce = <T extends unknown[]>(fn: (...args: T) => void, delay: number) => {
    let timerId: number | null = null; // 使用闭包的特性，存储timerId
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
    const ctx = canvas.getContext("2d");

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
