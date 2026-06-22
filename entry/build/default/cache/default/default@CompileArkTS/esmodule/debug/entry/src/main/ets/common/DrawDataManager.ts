import dataPreferences from "@ohos:data.preferences";
import type common from "@ohos:app.ability.common";
const DRAW_PREFS_NAME = 'travel_journal_draw_prefs';
const DRAW_DATA_KEY = 'province_draw_data';
export class DrawDataManager {
    private static instance: DrawDataManager;
    private preferences: dataPreferences.Preferences | null = null;
    private constructor() { }
    /** 获取单例实例 */
    static getInstance(): DrawDataManager {
        if (!DrawDataManager.instance) {
            DrawDataManager.instance = new DrawDataManager();
        }
        return DrawDataManager.instance;
    }
    /**
     * 初始化 Preferences
     * 必须在 Ability onCreate 或页面 aboutToAppear 中调用
     */
    async init(context: common.UIAbilityContext): Promise<void> {
        try {
            this.preferences = await dataPreferences.getPreferences(context, DRAW_PREFS_NAME);
        }
        catch (error) {
            console.error(`[DrawDataManager] init failed: ${JSON.stringify(error)}`);
        }
    }
    /**
     * 保存画板数据
     * @param provinceId 省份 ID
     * @param imageData Canvas 导出的 base64 图片数据
     */
    async saveDrawData(provinceId: string, imageData: string): Promise<void> {
        if (!this.preferences) {
            console.error('[DrawDataManager] preferences is null, please call init first');
            return;
        }
        try {
            // 读取现有数据映射
            const dataStr = await this.preferences.get(DRAW_DATA_KEY, '{}') as string;
            const dataMap: Record<string, string> = JSON.parse(dataStr) as Record<string, string>;
            // 更新指定省份的数据
            dataMap[provinceId] = imageData;
            // 保存回 Preferences
            await this.preferences.put(DRAW_DATA_KEY, JSON.stringify(dataMap));
            await this.preferences.flush();
            console.info(`[DrawDataManager] Draw data saved for province: ${provinceId}`);
        }
        catch (error) {
            console.error(`[DrawDataManager] saveDrawData failed: ${JSON.stringify(error)}`);
        }
    }
    /**
     * 加载画板数据
     * @param provinceId 省份 ID
     * @returns base64 图片数据，不存在则返回空字符串
     */
    async loadDrawData(provinceId: string): Promise<string> {
        if (!this.preferences) {
            console.error('[DrawDataManager] preferences is null, please call init first');
            return '';
        }
        try {
            const dataStr = await this.preferences.get(DRAW_DATA_KEY, '{}') as string;
            const dataMap: Record<string, string> = JSON.parse(dataStr) as Record<string, string>;
            return dataMap[provinceId] || '';
        }
        catch (error) {
            console.error(`[DrawDataManager] loadDrawData failed: ${JSON.stringify(error)}`);
            return '';
        }
    }
    /**
     * 删除指定省份的画板数据
     * @param provinceId 省份 ID
     */
    async deleteDrawData(provinceId: string): Promise<void> {
        if (!this.preferences) {
            return;
        }
        try {
            const dataStr = await this.preferences.get(DRAW_DATA_KEY, '{}') as string;
            const dataMap: Record<string, string> = JSON.parse(dataStr) as Record<string, string>;
            // ArkTS 不支持 delete 操作符，通过重建映射来移除指定 key
            const newMap: Record<string, string> = {};
            const keys = Object.keys(dataMap);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] !== provinceId) {
                    newMap[keys[i]] = dataMap[keys[i]];
                }
            }
            await this.preferences.put(DRAW_DATA_KEY, JSON.stringify(newMap));
            await this.preferences.flush();
        }
        catch (error) {
            console.error(`[DrawDataManager] deleteDrawData failed: ${JSON.stringify(error)}`);
        }
    }
}
