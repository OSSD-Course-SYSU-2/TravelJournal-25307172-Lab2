/**
 * DataModel.ets - 省份数据模型与存储操作
 * 提供省份列表、点亮状态和手账内容的持久化存储（基于 Preferences）
 * 省份使用椭圆表示，椭圆大小反映省份相对面积
 * 基准画布 1600×1000，运行时根据实际Canvas尺寸动态缩放
 */
import dataPreferences from '@ohos.data.preferences';
import common from '@ohos.app.ability.common';

// ==================== 数据接口定义 ====================

/** 回忆记录 */
export interface Memory {
  id: string;           // 唯一标识
  text: string;         // 文字内容（最多200字）
  photoUris: string[];  // 本地图片 URI 列表
  createTime: number;   // 创建时间戳
}

/** 省份信息（椭圆模型） */
export interface Province {
  id: string;           // 省份唯一标识（如 "beijing"）
  name: string;         // 省份显示名称
  cx: number;           // 椭圆中心 x（基准坐标系 0-1600）
  cy: number;           // 椭圆中心 y（基准坐标系 0-1000）
  rx: number;           // 椭圆水平半径（反映省份相对大小）
  ry: number;           // 椭圆垂直半径（反映省份相对大小）
  color: string;        // 省份填充色（未点亮时）
  isLighted: boolean;   // 是否已点亮
  lightedTime?: number; // 点亮时间戳
  memories: Memory[];   // 手账条目列表
}

// ==================== 存储常量 ====================

const PREFERENCES_NAME = 'travel_journal_canvas_prefs';
const LIGHTED_KEY = 'lighted_provinces';
const MEMORIES_KEY = 'province_memories';
const POSITIONS_KEY = 'province_positions';

// ==================== 省份椭圆数据 ====================

/**
 * 34个省级行政区的椭圆数据（基准画布 1600×1000）
 * 运行时根据Canvas实际尺寸动态缩放：
 *   cx_actual = base_cx / BASE_WIDTH * canvasWidth
 *   cy_actual = base_cy / BASE_HEIGHT * canvasHeight
 *   rx/ry_actual = base_r * sizeScale（保证最小可读尺寸）
 * 椭圆面积按省份真实面积比例差异化
 * 位置对应中国地图的相对方位，整体外廓近似中国版图形状
 *
 * 面积比例参考（万km²）：
 *   新疆166 / 西藏123 / 内蒙古119 / 青海72 / 四川49 / 黑龙江47 / 甘肃43 / 云南39 / 广西24 /
 *   湖南21 / 河北19 / 湖北19 / 广东18 / 贵州18 / 江西17 / 河南17 / 山西16 / 山东16 /
 *   辽宁15 / 安徽14 / 福建12 / 江苏11 / 浙江11 / 陕西21 / 重庆8 / 宁夏7 / 台湾3.6 /
 *   海南3.5 / 北京1.6 / 天津1.2 / 上海0.63 / 香港0.11 / 澳门0.003
 */

/** 基准画布宽度 */
export const BASE_WIDTH = 1600;
/** 基准画布高度 */
export const BASE_HEIGHT = 1000;

export const PROVINCE_ELLIPSES: Province[] = [
  // ===== 西北 =====
  { id: 'xinjiang', name: '新疆', cx: 249, cy: 310, rx: 155, ry: 125, color: '#C2A67A', isLighted: false, memories: [] },       // 沙漠驼
  { id: 'xizang', name: '西藏', cx: 257, cy: 710, rx: 130, ry: 105, color: '#E5E0D5', isLighted: false, memories: [] },       // 哈达白
  { id: 'qinghai', name: '青海', cx: 430, cy: 475, rx: 95, ry: 76, color: '#5B7C8C', isLighted: false, memories: [] },      // 青海湖蓝灰
  { id: 'gansu', name: '甘肃', cx: 575, cy: 380, rx: 78, ry: 55, color: '#B5756A', isLighted: false, memories: [] },        // 丹霞红灰
  { id: 'ningxia', name: '宁夏', cx: 760, cy: 340, rx: 40, ry: 34, color: '#A55D52', isLighted: false, memories: [] },      // 枸杞红灰
  { id: 'shaanxi', name: '陕西', cx: 677, cy: 525, rx: 62, ry: 55, color: '#AD8B72', isLighted: false, memories: [] },      // 兵马俑土

  // ===== 华北 =====
  { id: 'neimenggu', name: '内蒙古', cx: 807, cy: 210, rx: 118, ry: 82, color: '#A3B6A5', isLighted: false, memories: [] },   // 鼠尾草绿
  { id: 'shanxi', name: '山西', cx: 780, cy: 445, rx: 48, ry: 55, color: '#A29B8F', isLighted: false, memories: [] },       // 瓦灰色
  { id: 'hebei', name: '河北', cx: 967, cy: 425, rx: 55, ry: 48, color: '#D1C7B7', isLighted: false, memories: [] },       // 燕麦色
  { id: 'beijing', name: '北京', cx: 1017, cy: 340, rx: 38, ry: 32, color: '#B28B84', isLighted: false, memories: [] },      // 灰豆红
  { id: 'tianjin', name: '天津', cx: 1157, cy: 355, rx: 38, ry: 32, color: '#7F8C8D', isLighted: false, memories: [] },      // 雾霾蓝

  // ===== 东北 =====
  { id: 'liaoning', name: '辽宁', cx: 1317, cy: 385, rx: 52, ry: 48, color: '#5B7B8A', isLighted: false, memories: [] },     // 钢青色
  { id: 'jilin', name: '吉林', cx: 1452, cy: 270, rx: 55, ry: 50, color: '#B7A9B8', isLighted: false, memories: [] },       // 雪青色
  { id: 'heilongjiang', name: '黑龙江', cx: 1457, cy: 140, rx: 76, ry: 62, color: '#C0C5C1', isLighted: false, memories: [] },// 冰灰色

  // ===== 华东 =====
  { id: 'shandong', name: '山东', cx: 1187, cy: 460, rx: 52, ry: 48, color: '#A57C6B', isLighted: false, memories: [] },     // 岱赭
  { id: 'jiangsu', name: '江苏', cx: 1267, cy: 545, rx: 46, ry: 42, color: '#A7B8A4', isLighted: false, memories: [] },     // 水绿色
  { id: 'shanghai', name: '上海', cx: 1407, cy: 575, rx: 36, ry: 32, color: '#D4B5B0', isLighted: false, memories: [] },     // 烟粉色
  { id: 'anhui', name: '安徽', cx: 1317, cy: 637, rx: 46, ry: 42, color: '#E2DCD3', isLighted: false, memories: [] },       // 宣纸白
  { id: 'zhejiang', name: '浙江', cx: 1437, cy: 685, rx: 48, ry: 45, color: '#B8B5B0', isLighted: false, memories: [] },     // 雾雨灰
  { id: 'jiangxi', name: '江西', cx: 1207, cy: 705, rx: 50, ry: 45, color: '#6F7F8F', isLighted: false, memories: [] },     // 青花蓝灰
  { id: 'fujian', name: '福建', cx: 1297, cy: 775, rx: 42, ry: 40, color: '#B59A8A', isLighted: false, memories: [] },      // 陶土灰
  { id: 'taiwan', name: '台湾', cx: 1517, cy: 765, rx: 36, ry: 45, color: '#AAB5B8', isLighted: false, memories: [] },      // 玉山雾

  // ===== 华中 =====
  { id: 'henan', name: '河南', cx: 990, cy: 533, rx: 50, ry: 46, color: '#C2B29A', isLighted: false, memories: [] },       // 黄土灰
  { id: 'hubei', name: '湖北', cx: 1000, cy: 645, rx: 52, ry: 48, color: '#89A094', isLighted: false, memories: [] },       // 千湖绿灰
  { id: 'hunan', name: '湖南', cx: 970, cy: 755, rx: 55, ry: 50, color: '#B56A5C', isLighted: false, memories: [] },       // 辣椒锈红

  // ===== 西南 =====
  { id: 'sichuan', name: '四川', cx: 590, cy: 680, rx: 74, ry: 62, color: '#8DA38A', isLighted: false, memories: [] },     // 竹青灰
  { id: 'chongqing', name: '重庆', cx: 840, cy: 610, rx: 45, ry: 40, color: '#9E5E54', isLighted: false, memories: [] },   // 火锅红灰
  { id: 'guizhou', name: '贵州', cx: 800, cy: 708, rx: 50, ry: 45, color: '#5B6F7A', isLighted: false, memories: [] },     // 蜡染靛灰
  { id: 'yunnan', name: '云南', cx: 537, cy: 800, rx: 66, ry: 55, color: '#BDB2A4', isLighted: false, memories: [] },     // 菌菇灰

  // ===== 华南 =====
  { id: 'guangdong', name: '广东', cx: 1147, cy: 815, rx: 50, ry: 46, color: '#D4C9B8', isLighted: false, memories: [] },   // 暖米灰
  { id: 'guangxi', name: '广西', cx: 880, cy: 845, rx: 58, ry: 50, color: '#7A9A8E', isLighted: false, memories: [] },     // 漓江青
  { id: 'hainan', name: '海南', cx: 1017, cy: 935, rx: 36, ry: 32, color: '#D6A9A2', isLighted: false, memories: [] },      // 珊瑚粉灰
  { id: 'xianggang', name: '香港', cx: 1312, cy: 855, rx: 34, ry: 30, color: '#7C8B8F', isLighted: false, memories: [] },   // 维多利亚灰
  { id: 'aomen', name: '澳门', cx: 1187, cy: 895, rx: 34, ry: 30, color: '#DBCA9F', isLighted: false, memories: [] },       // 蛋壳黄
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
