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
    return newAngle / Math.PI * 180;
};

export const checkIsMac = () => {
    return /macintosh|mac os x/i.test(navigator.userAgent);
};
