import Clipboard from "clipboard";
import { decrypt } from "./crypto";

export enum CLIPBOARD_STRING_TYPE {
    SLIDE = "TYPE:SLIDE;",
    ELEMENT = "TYPE:ELEMENT;",
    IMAGE = "data:image"
}

// 复制内容到剪切板
export const copyText = (text: string) => {
    return new Promise((resolve, reject) => {
        const fakeElement = document.createElement("button");
        const clipboard = new Clipboard(fakeElement, {
            text: () => text,
            action: () => "copy",
            container: document.body
        });
        clipboard.on("success", (e) => {
            clipboard.destroy();
            resolve(e);
        });
        clipboard.on("error", (e) => {
            clipboard.destroy();
            reject(e);
        });
        document.body.appendChild(fakeElement);
        fakeElement.click();
        document.body.removeChild(fakeElement);
    });
};

const blobToURL = (blob: Blob): Promise<string> => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target ? e.target.result as string : "");
        };
        reader.readAsDataURL(blob);
    });
};

// 读取剪贴板
export const readClipboard = async () => {
    let image = "";
    if (navigator.clipboard?.read) {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                const blob = await clipboardItem.getType(type);
                if (type.indexOf("image") > -1) {
                    image = await blobToURL(blob);
                    break;
                }
            }
            if (image) break;
        }
    }

    if (image) return image;

    if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (!text) console.error(new Error("剪贴板为空或者不包含文本"));
        return decrypt(text);
    }

    return "";
};

// 解析加密后的剪贴板内容
export const pasteCustomClipboardString = (text: string) => {
    let clipboardData;
    try {
        clipboardData = JSON.parse(text);
    } catch {
        clipboardData = text;
    }

    return clipboardData;
};
