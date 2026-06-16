import continuationManager from "@ohos:continuation.continuationManager";
import type { BusinessError } from "@ohos:base";
/** 接续数据结构 */
export interface ContinuationData {
    provinceId: string; // 当前查看的省份 ID
    timestamp: number; // 时间戳
}
/**
 * ContinuationHelper 单例
 * 管理自由流转的注册、注销和数据传递
 */
export class ContinuationHelper {
    private static instance: ContinuationHelper;
    private token: number = -1;
    private isRegistered: boolean = false;
    private onContinueCallback: (() => ContinuationData) | null = null;
    private onRestoreCallback: ((data: ContinuationData) => void) | null = null;
    private constructor() { }
    /** 获取单例实例 */
    static getInstance(): ContinuationHelper {
        if (!ContinuationHelper.instance) {
            ContinuationHelper.instance = new ContinuationHelper();
        }
        return ContinuationHelper.instance;
    }
    /**
     * 注册自由流转
     * @param onContinue 获取接续数据的回调（源设备侧）
     * @param onRestore 恢复接续数据的回调（目标设备侧）
     */
    async register(onContinue: () => ContinuationData, onRestore: (data: ContinuationData) => void): Promise<void> {
        this.onContinueCallback = onContinue;
        this.onRestoreCallback = onRestore;
        if (this.isRegistered) {
            console.info('[ContinuationHelper] Already registered, callbacks updated');
            return;
        }
        try {
            const extraParams: continuationManager.ContinuationExtraParams = {
                deviceType: ['00E'],
                continuationMode: continuationManager.ContinuationMode.COLLABORATION_SINGLE
            };
            this.token = await continuationManager.register(extraParams);
            continuationManager.on('deviceSelected', this.token, (data: continuationManager.ContinuationResult[]) => {
                console.info(`[ContinuationHelper] deviceSelected: count=${data.length}`);
                for (const item of data) {
                    console.info(`[ContinuationHelper] device: id=${item.id}, type=${item.type}`);
                }
                if (data.length > 0) {
                    continuationManager.updateConnectStatus(this.token, data[0].id, continuationManager.DeviceConnectState.CONNECTED).catch((err: BusinessError) => {
                        console.error(`[ContinuationHelper] updateConnectStatus failed: code=${err.code}`);
                    });
                }
            });
            continuationManager.on('deviceUnselected', this.token, (data: continuationManager.ContinuationResult[]) => {
                console.info(`[ContinuationHelper] deviceUnselected: count=${data.length}`);
            });
            this.isRegistered = true;
            console.info(`[ContinuationHelper] Registered, token: ${this.token}`);
        }
        catch (error) {
            const err = error as BusinessError;
            console.error(`[ContinuationHelper] register failed: code=${err.code}, message=${err.message}`);
        }
    }
    /**
     * 更新回调（不重复注册，仅替换回调函数）
     * 在页面切换时调用，确保流转数据来源正确
     */
    updateCallbacks(onContinue: () => ContinuationData, onRestore: (data: ContinuationData) => void): void {
        this.onContinueCallback = onContinue;
        this.onRestoreCallback = onRestore;
        console.info('[ContinuationHelper] Callbacks updated');
    }
    /**
     * 注销自由流转
     */
    async unregister(): Promise<void> {
        if (!this.isRegistered || this.token === -1) {
            return;
        }
        try {
            continuationManager.off('deviceSelected', this.token);
            continuationManager.off('deviceUnselected', this.token);
            await continuationManager.unregister(this.token);
            this.isRegistered = false;
            this.token = -1;
            this.onContinueCallback = null;
            this.onRestoreCallback = null;
            console.info('[ContinuationHelper] Unregistered');
        }
        catch (error) {
            const err = error as BusinessError;
            console.error(`[ContinuationHelper] unregister failed: code=${err.code}, message=${err.message}`);
        }
    }
    /**
     * 获取接续数据
     */
    getContinuationData(): ContinuationData {
        if (this.onContinueCallback) {
            return this.onContinueCallback();
        }
        return { provinceId: '', timestamp: Date.now() };
    }
    /**
     * 恢复接续数据
     */
    restoreContinuationData(data: ContinuationData): void {
        if (this.onRestoreCallback) {
            this.onRestoreCallback(data);
        }
    }
    /**
     * 获取当前注册 token
     */
    getToken(): number {
        return this.token;
    }
    /**
     * 是否已注册
     */
    isContinuationRegistered(): boolean {
        return this.isRegistered;
    }
    /**
     * 主动发起流转（显示设备选择器）
     * 在 UI 中调用此方法让用户选择目标设备
     */
    async startContinuation(): Promise<void> {
        if (!this.isRegistered || this.token === -1) {
            console.warn('[ContinuationHelper] Not registered, cannot start continuation');
            return;
        }
        try {
            await continuationManager.startContinuationDeviceManager(this.token);
            console.info('[ContinuationHelper] Continuation device manager started');
        }
        catch (error) {
            const err = error as BusinessError;
            console.error(`[ContinuationHelper] startContinuation failed: code=${err.code}, message=${err.message}`);
        }
    }
}
