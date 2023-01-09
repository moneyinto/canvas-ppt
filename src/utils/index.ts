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
