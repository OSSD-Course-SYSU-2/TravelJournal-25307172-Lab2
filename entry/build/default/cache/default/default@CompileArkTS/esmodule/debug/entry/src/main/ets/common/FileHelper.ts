import fs from "@ohos:file.fs";
import type common from "@ohos:app.ability.common";
export class FileHelper {
    private static instance: FileHelper;
    private context: common.UIAbilityContext | null = null;
    private constructor() { }
    /** 获取单例实例 */
    static getInstance(): FileHelper {
        if (!FileHelper.instance) {
            FileHelper.instance = new FileHelper();
        }
        return FileHelper.instance;
    }
    /** 设置上下文（在 Ability onCreate 中调用） */
    setContext(context: common.UIAbilityContext): void {
        this.context = context;
    }
    /**
     * 获取应用私有文件目录路径
     * 用于存储手账图片
     */
    getFilesDir(): string {
        if (!this.context) {
            console.error('[FileHelper] context is null, please call setContext first');
            return '';
        }
        return this.context.filesDir;
    }
    /**
     * 将相册中选择的图片复制到应用私有目录
     * @param sourceUri 相册图片的 URI（PhotoViewPicker 返回的 URI）
     * @returns 复制后的本地文件路径，失败返回空字符串
     */
    copyImageToPrivateDir(sourceUri: string): string {
        if (!this.context) {
            console.error('[FileHelper] context is null');
            return '';
        }
        try {
            const filesDir = this.context.filesDir;
            // 生成唯一文件名
            const fileName = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + '.jpg';
            const destPath = filesDir + '/' + fileName;
            // 打开源文件
            const srcFile = fs.openSync(sourceUri, fs.OpenMode.READ_ONLY);
            // 创建目标文件
            const destFile = fs.openSync(destPath, fs.OpenMode.CREATE | fs.OpenMode.WRITE_ONLY);
            // 复制数据（缓冲区大小 4096）
            const bufferSize = 4096;
            let readLen = -1;
            while (readLen !== 0) {
                const buf = new ArrayBuffer(bufferSize);
                readLen = fs.readSync(srcFile.fd, buf);
                if (readLen > 0) {
                    fs.writeSync(destFile.fd, buf, { length: readLen });
                }
            }
            // 关闭文件
            fs.closeSync(srcFile);
            fs.closeSync(destFile);
            console.info(`[FileHelper] Image copied to: ${destPath}`);
            return destPath;
        }
        catch (error) {
            console.error(`[FileHelper] copyImageToPrivateDir failed: ${JSON.stringify(error)}`);
            return '';
        }
    }
    /**
     * 批量复制图片到应用私有目录
     * @param sourceUris 相册图片 URI 列表
     * @returns 复制后的本地文件路径列表
     */
    copyImagesToPrivateDir(sourceUris: string[]): string[] {
        const result: string[] = [];
        for (const uri of sourceUris) {
            const destPath = this.copyImageToPrivateDir(uri);
            if (destPath) {
                result.push(destPath);
            }
        }
        return result;
    }
    /**
     * 删除应用私有目录中的图片文件
     * @param filePath 文件路径
     * @returns 是否删除成功
     */
    deleteImage(filePath: string): boolean {
        try {
            if (fs.accessSync(filePath)) {
                fs.unlinkSync(filePath);
                console.info(`[FileHelper] Image deleted: ${filePath}`);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error(`[FileHelper] deleteImage failed: ${JSON.stringify(error)}`);
            return false;
        }
    }
    /**
     * 批量删除图片文件
     * @param filePaths 文件路径列表
     */
    deleteImages(filePaths: string[]): void {
        for (const path of filePaths) {
            this.deleteImage(path);
        }
    }
    /**
     * 检查文件是否存在
     * @param filePath 文件路径
     */
    fileExists(filePath: string): boolean {
        try {
            return fs.accessSync(filePath);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * 将内部存储路径转换为可被 Image 组件加载的 URI
     * HarmonyOS 中 Image 组件可直接使用 file:// 协议加载本地文件
     * @param filePath 内部文件路径
     * @returns 可用于 Image 组件的 URI
     */
    toImageUri(filePath: string): string {
        if (filePath.startsWith('file://')) {
            return filePath;
        }
        return 'file://' + filePath;
    }
}
