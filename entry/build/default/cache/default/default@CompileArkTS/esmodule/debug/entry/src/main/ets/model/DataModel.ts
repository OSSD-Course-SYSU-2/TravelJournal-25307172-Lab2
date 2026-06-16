import dataPreferences from "@ohos:data.preferences";
import type common from "@ohos:app.ability.common";
// ==================== 数据接口定义 ====================
/** 回忆记录 */
export interface Memory {
    id: string; // 唯一标识
    text: string; // 文字内容（最多200字）
    photoUris: string[]; // 本地图片 URI 列表
    createTime: number; // 创建时间戳
}
/** 省份信息（椭圆模型） */
export interface Province {
    id: string; // 省份唯一标识（如 "beijing"）
    name: string; // 省份显示名称
    cx: number; // 椭圆中心 x（逻辑坐标系 0-800）
    cy: number; // 椭圆中心 y（逻辑坐标系 0-900）
    rx: number; // 椭圆水平半径（反映省份相对大小）
    ry: number; // 椭圆垂直半径（反映省份相对大小）
    color: string; // 省份填充色（未点亮时）
    isLighted: boolean; // 是否已点亮
    lightedTime?: number; // 点亮时间戳
    memories: Memory[]; // 手账条目列表
}
// ==================== 存储常量 ====================
const PREFERENCES_NAME = 'travel_journal_canvas_prefs';
const LIGHTED_KEY = 'lighted_provinces';
const MEMORIES_KEY = 'province_memories';
const POSITIONS_KEY = 'province_positions';
// ==================== 省份椭圆数据 ====================
/**
 * 34个省级行政区的椭圆数据
 * 画布逻辑尺寸：800(x) × 900(y)，绘制时会缩放到 Canvas 实际尺寸
 * 坐标系：x 向右增大，y 向下增大
 * 椭圆大小大致反映省份相对面积
 * 位置大致对应中国地图的相对方位
 * 所有椭圆间最小间距 ≥ 8px（已通过碰撞检测验证）
 *
 * 布局说明：
 *   东北：黑龙江、吉林、辽宁
 *   华北：内蒙古、北京、天津、河北、山西
 *   西北：新疆、甘肃、宁夏、青海、陕西
 *   华东：山东、江苏、上海、浙江、安徽、江西、福建、台湾
 *   华中：河南、湖北、湖南
 *   西南：四川、重庆、贵州、云南、西藏
 *   华南：广东、广西、海南、香港、澳门
 */
/** 地图逻辑宽度 */
export const MAP_LOGICAL_WIDTH = 800;
/** 地图逻辑高度 */
export const MAP_LOGICAL_HEIGHT = 1125;
export const PROVINCE_ELLIPSES: Province[] = [
    // ===== 西北 =====
    { id: 'xinjiang', name: '新疆', cx: 127, cy: 527, rx: 91, ry: 78, color: '#C2A67A', isLighted: false, memories: [] },
    { id: 'xizang', name: '西藏', cx: 152, cy: 784, rx: 85, ry: 72, color: '#E5E0D5', isLighted: false, memories: [] },
    { id: 'qinghai', name: '青海', cx: 231, cy: 641, rx: 67, ry: 58, color: '#5B7C8C', isLighted: false, memories: [] },
    { id: 'gansu', name: '甘肃', cx: 285, cy: 535, rx: 58, ry: 49, color: '#B5756A', isLighted: false, memories: [] },
    { id: 'ningxia', name: '宁夏', cx: 379, cy: 487, rx: 41, ry: 36, color: '#A55D52', isLighted: false, memories: [] },
    { id: 'shaanxi', name: '陕西', cx: 355, cy: 635, rx: 45, ry: 38, color: '#AD8B72', isLighted: false, memories: [] },
    // ===== 华北 =====
    { id: 'neimenggu', name: '内蒙古', cx: 419, cy: 322, rx: 83, ry: 70, color: '#A3B6A5', isLighted: false, memories: [] },
    { id: 'shanxi', name: '山西', cx: 415, cy: 571, rx: 41, ry: 36, color: '#A29B8F', isLighted: false, memories: [] },
    { id: 'hebei', name: '河北', cx: 470, cy: 506, rx: 44, ry: 37, color: '#D1C7B7', isLighted: false, memories: [] },
    { id: 'beijing', name: '北京', cx: 479, cy: 424, rx: 41, ry: 36, color: '#B28B84', isLighted: false, memories: [] },
    { id: 'tianjin', name: '天津', cx: 571, cy: 432, rx: 41, ry: 36, color: '#7F8C8D', isLighted: false, memories: [] },
    // ===== 东北 =====
    { id: 'liaoning', name: '辽宁', cx: 651, cy: 484, rx: 41, ry: 36, color: '#5B7B8A', isLighted: false, memories: [] },
    { id: 'jilin', name: '吉林', cx: 688, cy: 408, rx: 44, ry: 37, color: '#B7A9B8', isLighted: false, memories: [] },
    { id: 'heilongjiang', name: '黑龙江', cx: 693, cy: 313, rx: 59, ry: 50, color: '#C0C5C1', isLighted: false, memories: [] },
    // ===== 华东 =====
    { id: 'shandong', name: '山东', cx: 565, cy: 513, rx: 41, ry: 36, color: '#A57C6B', isLighted: false, memories: [] },
    { id: 'jiangsu', name: '江苏', cx: 576, cy: 593, rx: 41, ry: 36, color: '#A7B8A4', isLighted: false, memories: [] },
    { id: 'shanghai', name: '上海', cx: 657, cy: 630, rx: 41, ry: 36, color: '#D4B5B0', isLighted: false, memories: [] },
    { id: 'anhui', name: '安徽', cx: 578, cy: 673, rx: 41, ry: 36, color: '#E2DCD3', isLighted: false, memories: [] },
    { id: 'zhejiang', name: '浙江', cx: 641, cy: 733, rx: 41, ry: 36, color: '#B8B5B0', isLighted: false, memories: [] },
    { id: 'jiangxi', name: '江西', cx: 553, cy: 763, rx: 41, ry: 36, color: '#6F7F8F', isLighted: false, memories: [] },
    { id: 'fujian', name: '福建', cx: 600, cy: 833, rx: 41, ry: 36, color: '#B59A8A', isLighted: false, memories: [] },
    { id: 'taiwan', name: '台湾', cx: 723, cy: 824, rx: 41, ry: 36, color: '#AAB5B8', isLighted: false, memories: [] },
    // ===== 华中 =====
    { id: 'henan', name: '河南', cx: 489, cy: 620, rx: 41, ry: 36, color: '#C2B29A', isLighted: false, memories: [] },
    { id: 'hubei', name: '湖北', cx: 490, cy: 701, rx: 44, ry: 37, color: '#89A094', isLighted: false, memories: [] },
    { id: 'hunan', name: '湖南', cx: 474, cy: 816, rx: 46, ry: 40, color: '#B56A5C', isLighted: false, memories: [] },
    // ===== 西南 =====
    { id: 'sichuan', name: '四川', cx: 299, cy: 744, rx: 60, ry: 52, color: '#8DA38A', isLighted: false, memories: [] },
    { id: 'chongqing', name: '重庆', cx: 410, cy: 744, rx: 41, ry: 36, color: '#9E5E54', isLighted: false, memories: [] },
    { id: 'guizhou', name: '贵州', cx: 379, cy: 822, rx: 41, ry: 36, color: '#5B6F7A', isLighted: false, memories: [] },
    { id: 'yunnan', name: '云南', cx: 288, cy: 868, rx: 54, ry: 47, color: '#BDB2A4', isLighted: false, memories: [] },
    // ===== 华南 =====
    { id: 'guangdong', name: '广东', cx: 530, cy: 884, rx: 41, ry: 36, color: '#D4C9B8', isLighted: false, memories: [] },
    { id: 'guangxi', name: '广西', cx: 435, cy: 909, rx: 48, ry: 41, color: '#7A9A8E', isLighted: false, memories: [] },
    { id: 'hainan', name: '海南', cx: 468, cy: 1035, rx: 41, ry: 36, color: '#D6A9A2', isLighted: false, memories: [] },
    { id: 'xianggang', name: '香港', cx: 607, cy: 930, rx: 41, ry: 36, color: '#7C8B8F', isLighted: false, memories: [] },
    { id: 'aomen', name: '澳门', cx: 543, cy: 988, rx: 41, ry: 36, color: '#DBCA9F', isLighted: false, memories: [] }, // 蛋壳黄
];
// ==================== 数据管理类 ====================
/**
 * ProvinceModel - 省份数据管理单例
 * 负责所有省份和回忆数据的增删改查，以及持久化存储
 */
export class ProvinceModel {
    private static instance: ProvinceModel;
    private preferences: dataPreferences.Preferences | null = null;
    private provinces: Province[] = [];
    private constructor() {
        // 初始化省份列表（从预定义数据深拷贝）
        this.provinces = JSON.parse(JSON.stringify(PROVINCE_ELLIPSES)) as Province[];
    }
    /** 获取单例实例 */
    static getInstance(): ProvinceModel {
        if (!ProvinceModel.instance) {
            ProvinceModel.instance = new ProvinceModel();
        }
        return ProvinceModel.instance;
    }
    /**
     * 初始化 Preferences
     * 必须在 Ability onCreate 或页面 aboutToAppear 中调用
     */
    async init(context: common.UIAbilityContext): Promise<void> {
        try {
            this.preferences = await dataPreferences.getPreferences(context, PREFERENCES_NAME);
            await this.loadProvinceData();
        }
        catch (error) {
            console.error(`[ProvinceModel] init failed: ${JSON.stringify(error)}`);
        }
    }
    /** 从 Preferences 加载省份数据 */
    private async loadProvinceData(): Promise<void> {
        if (!this.preferences) {
            return;
        }
        try {
            // 加载已点亮省份列表
            const lightedStr = await this.preferences.get(LIGHTED_KEY, '[]') as string;
            const lightedIds: string[] = JSON.parse(lightedStr) as string[];
            // 加载回忆数据
            const memoriesStr = await this.preferences.get(MEMORIES_KEY, '{}') as string;
            const memoriesMap: Record<string, Memory[]> = JSON.parse(memoriesStr) as Record<string, Memory[]>;
            // 将存储数据合并到省份列表
            for (const province of this.provinces) {
                if (lightedIds.includes(province.id)) {
                    province.isLighted = true;
                }
                if (memoriesMap[province.id]) {
                    province.memories = memoriesMap[province.id];
                }
            }
            // 加载用户自定义位置
            await this.loadPositions();
        }
        catch (error) {
            console.error(`[ProvinceModel] loadProvinceData failed: ${JSON.stringify(error)}`);
        }
    }
    /** 从 Preferences 加载用户自定义位置 */
    private async loadPositions(): Promise<void> {
        if (!this.preferences) {
            return;
        }
        try {
            const posStr = await this.preferences.get(POSITIONS_KEY, '{}') as string;
            const posMap: Record<string, number[]> = JSON.parse(posStr) as Record<string, number[]>;
            for (const province of this.provinces) {
                if (posMap[province.id]) {
                    province.cx = posMap[province.id][0];
                    province.cy = posMap[province.id][1];
                }
            }
        }
        catch (error) {
            console.error(`[ProvinceModel] loadPositions failed: ${JSON.stringify(error)}`);
        }
    }
    /** 将省份数据保存到 Preferences */
    private async saveProvinceData(): Promise<void> {
        if (!this.preferences) {
            return;
        }
        try {
            // 保存已点亮省份 ID 列表
            const lightedIds = this.provinces
                .filter(p => p.isLighted)
                .map(p => p.id);
            await this.preferences.put(LIGHTED_KEY, JSON.stringify(lightedIds));
            // 保存回忆数据
            const memoriesMap: Record<string, Memory[]> = {};
            for (const province of this.provinces) {
                if (province.memories.length > 0) {
                    memoriesMap[province.id] = province.memories;
                }
            }
            await this.preferences.put(MEMORIES_KEY, JSON.stringify(memoriesMap));
            await this.preferences.flush();
        }
        catch (error) {
            console.error(`[ProvinceModel] saveProvinceData failed: ${JSON.stringify(error)}`);
        }
    }
    // ==================== 省份操作 ====================
    /** 获取所有省份列表 */
    getProvinces(): Province[] {
        return this.provinces;
    }
    /** 获取所有已点亮的省份列表（按点亮时间排序） */
    getLightedProvinces(): Province[] {
        return this.provinces
            .filter(p => p.isLighted)
            .sort((a, b) => (b.lightedTime || 0) - (a.lightedTime || 0));
    }
    /** 根据 ID 获取省份 */
    getProvinceById(id: string): Province | undefined {
        return this.provinces.find(p => p.id === id);
    }
    /**
     * 点亮一个省份
     * @param provinceId 省份 ID
     * @returns 点亮后的省份对象
     */
    async lightProvince(provinceId: string): Promise<Province | null> {
        const province = this.provinces.find(p => p.id === provinceId);
        if (!province) {
            console.error(`[ProvinceModel] Province not found: ${provinceId}`);
            return null;
        }
        if (!province.isLighted) {
            province.isLighted = true;
            province.lightedTime = Date.now();
            await this.saveProvinceData();
        }
        return province;
    }
    /**
     * 取消点亮一个省份
     * @param provinceId 省份 ID
     */
    async unlightProvince(provinceId: string): Promise<void> {
        const province = this.provinces.find(p => p.id === provinceId);
        if (province) {
            province.isLighted = false;
            province.lightedTime = undefined;
            await this.saveProvinceData();
        }
    }
    /**
     * 更新省份位置（拖动后调用）
     * @param provinceId 省份 ID
     * @param cx 新的中心 x
     * @param cy 新的中心 y
     */
    async updateProvincePosition(provinceId: string, cx: number, cy: number): Promise<void> {
        const province = this.provinces.find(p => p.id === provinceId);
        if (province) {
            province.cx = cx;
            province.cy = cy;
            await this.savePositions();
        }
    }
    /** 将用户自定义位置保存到 Preferences */
    private async savePositions(): Promise<void> {
        if (!this.preferences) {
            return;
        }
        try {
            const posMap: Record<string, number[]> = {};
            for (const province of this.provinces) {
                posMap[province.id] = [province.cx, province.cy];
            }
            await this.preferences.put(POSITIONS_KEY, JSON.stringify(posMap));
            await this.preferences.flush();
        }
        catch (error) {
            console.error(`[ProvinceModel] savePositions failed: ${JSON.stringify(error)}`);
        }
    }
    // ==================== 回忆操作 ====================
    /**
     * 添加回忆到指定省份
     * @param provinceId 省份 ID
     * @param text 文字内容
     * @param photoUris 图片 URI 列表
     * @returns 新创建的回忆对象
     */
    async addMemory(provinceId: string, text: string, photoUris: string[]): Promise<Memory | null> {
        const province = this.provinces.find(p => p.id === provinceId);
        if (!province) {
            console.error(`[ProvinceModel] Province not found: ${provinceId}`);
            return null;
        }
        const memory: Memory = {
            id: this.generateId(),
            text: text,
            photoUris: photoUris,
            createTime: Date.now()
        };
        province.memories.push(memory);
        await this.saveProvinceData();
        return memory;
    }
    /**
     * 删除回忆
     * @param provinceId 省份 ID
     * @param memoryId 回忆 ID
     * @returns 被删除回忆的图片 URI 列表（用于清理文件）
     */
    async deleteMemory(provinceId: string, memoryId: string): Promise<string[]> {
        const province = this.provinces.find(p => p.id === provinceId);
        if (!province) {
            return [];
        }
        const index = province.memories.findIndex(m => m.id === memoryId);
        if (index === -1) {
            return [];
        }
        const deletedPhotoUris = [...province.memories[index].photoUris];
        province.memories.splice(index, 1);
        await this.saveProvinceData();
        return deletedPhotoUris;
    }
    /**
     * 获取指定省份的回忆列表
     * @param provinceId 省份 ID
     */
    getMemories(provinceId: string): Memory[] {
        const province = this.provinces.find(p => p.id === provinceId);
        return province ? province.memories : [];
    }
    // ==================== 工具方法 ====================
    /** 生成唯一 ID */
    private generateId(): string {
        return Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    }
}
