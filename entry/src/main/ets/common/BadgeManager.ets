/**
 * BadgeManager.ets - 奖牌管理类
 * 提供10枚旅行成就奖牌的静态定义、解锁检测、持久化存储
 * 使用 Preferences 存储解锁状态，与省份数据共用同一存储实例
 */
import dataPreferences from '@ohos.data.preferences';
import common from '@ohos.app.ability.common';

// ==================== 数据接口 ====================

/** 奖牌定义（不含运行时状态，作为模板使用） */
export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  shape: 'circle' | 'square';
  requiredProvinceIds: string[];
  unlockedBgColor: string;
}

/** 奖牌数据结构（含运行时状态） */
export interface Badge {
  id: string;
  name: string;
  emoji: string;
  shape: 'circle' | 'square';
  requiredProvinceIds: string[];
  unlockedBgColor: string;
  isUnlocked: boolean;
  unlockedTime: number;
}

/** 奖牌弹窗显示数据 */
export interface BadgePopupData {
  badge: Badge;
  provinceNames: string[];
}

/** 奖牌存储结构（Preferences 中保存的格式） */
interface BadgeStorageItem {
  isUnlocked: boolean;
  unlockedTime: number;
}

// ==================== 存储常量 ====================

const PREFERENCES_NAME = 'travel_journal_canvas_prefs';
const BADGES_KEY = 'badges_data';

// ==================== 10 枚奖牌静态定义 ====================

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'ice_explorer',
    name: '冰城探秘者',
    emoji: '\u{1F9CA}',
    shape: 'circle',
    requiredProvinceIds: ['heilongjiang', 'jilin', 'liaoning'],
    unlockedBgColor: '#B0D4F1'
  },
  {
    id: 'north_guardian',
    name: '北境守望者',
    emoji: '\u{1F3D4}\uFE0F',
    shape: 'square',
    requiredProvinceIds: ['beijing', 'tianjin', 'hebei', 'shanxi', 'neimenggu'],
    unlockedBgColor: '#D3D3D3'
  },
  {
    id: 'oriental_pearl',
    name: '东方明珠',
    emoji: '\u{1F3EE}',
    shape: 'circle',
    requiredProvinceIds: ['shanghai', 'jiangsu', 'zhejiang', 'anhui', 'fujian', 'jiangxi', 'shandong'],
    unlockedBgColor: '#FFFACD'
  },
  {
    id: 'central_traveler',
    name: '中原行者',
    emoji: '\u{1F3EF}',
    shape: 'square',
    requiredProvinceIds: ['henan', 'hubei', 'hunan'],
    unlockedBgColor: '#4A7C59'
  },
  {
    id: 'southwest_mystery',
    name: '西南秘境',
    emoji: '\u{1F43C}',
    shape: 'circle',
    requiredProvinceIds: ['chongqing', 'sichuan', 'guizhou', 'yunnan', 'xizang'],
    unlockedBgColor: '#90EE90'
  },
  {
    id: 'desert_smoke',
    name: '大漠孤烟',
    emoji: '\u{1F42B}',
    shape: 'square',
    requiredProvinceIds: ['shaanxi', 'gansu', 'qinghai', 'ningxia', 'xinjiang'],
    unlockedBgColor: '#D4A373'
  },
  {
    id: 'rice_fish_land',
    name: '鱼米之乡',
    emoji: '\u{1F33E}',
    shape: 'circle',
    requiredProvinceIds: ['jiangsu', 'anhui', 'jiangxi', 'hubei', 'hunan'],
    unlockedBgColor: '#C8A415'
  },
  {
    id: 'splendid_south',
    name: '锦绣南疆',
    emoji: '\u{1F33A}',
    shape: 'circle',
    requiredProvinceIds: ['guangdong', 'guangxi', 'hainan', 'xianggang', 'aomen'],
    unlockedBgColor: '#FFB6C1'
  },
  {
    id: 'coast_to_mountain',
    name: '山海之间',
    emoji: '\u{1F30A}',
    shape: 'square',
    requiredProvinceIds: ['liaoning', 'tianjin', 'shandong', 'jiangsu', 'shanghai', 'zhejiang', 'fujian', 'guangdong'],
    unlockedBgColor: '#1A5276'
  },
  {
    id: 'dragon_of_china',
    name: '万里神州',
    emoji: '\u{1F409}',
    shape: 'circle',
    requiredProvinceIds: [
      'anhui', 'beijing', 'chongqing', 'fujian', 'gansu', 'guangdong', 'guangxi',
      'guizhou', 'hainan', 'hebei', 'henan', 'heilongjiang', 'hubei', 'hunan',
      'jilin', 'jiangsu', 'jiangxi', 'liaoning', 'neimenggu', 'ningxia', 'qinghai',
      'shandong', 'shanxi', 'shaanxi', 'shanghai', 'sichuan', 'taiwan', 'tianjin',
      'xizang', 'xianggang', 'aomen', 'xinjiang', 'yunnan', 'zhejiang'
    ],
    unlockedBgColor: '#C41A1A'
  }
];

// ==================== 奖牌管理类 ====================

/**
 * BadgeManager - 奖牌管理单例
 * 负责奖牌定义、解锁检测、持久化存储
 */
export class BadgeManager {
  private static instance: BadgeManager;
  private preferences: dataPreferences.Preferences | null = null;
  private badges: Badge[] = [];

  private constructor() {
    // 从静态定义初始化奖牌列表（默认全部未解锁）
    this.badges = BADGE_DEFINITIONS.map((def: BadgeDefinition): Badge => {
      return {
        id: def.id,
        name: def.name,
        emoji: def.emoji,
        shape: def.shape,
        requiredProvinceIds: def.requiredProvinceIds,
        unlockedBgColor: def.unlockedBgColor,
        isUnlocked: false,
        unlockedTime: 0
      };
    });
  }

  /** 获取单例实例 */
  static getInstance(): BadgeManager {
    if (!BadgeManager.instance) {
      BadgeManager.instance = new BadgeManager();
    }
    return BadgeManager.instance;
  }

  /**
   * 初始化 Preferences 并加载奖牌数据
   * 必须在 ProvinceModel.init() 之后调用（共用同一 Preferences 实例）
   */
  async init(context: common.UIAbilityContext): Promise<void> {
    try {
      this.preferences = await dataPreferences.getPreferences(context, PREFERENCES_NAME);
      await this.loadBadges();
    } catch (error) {
      console.error(`[BadgeManager] init failed: ${JSON.stringify(error)}`);
    }
  }

  /** 从 Preferences 加载奖牌解锁状态 */
  private async loadBadges(): Promise<void> {
    if (!this.preferences) {
      return;
    }
    try {
      const dataStr = await this.preferences.get(BADGES_KEY, '{}') as string;
      const storageMap: Record<string, BadgeStorageItem> = JSON.parse(dataStr) as Record<string, BadgeStorageItem>;
      for (const badge of this.badges) {
        const item = storageMap[badge.id];
        if (item) {
          badge.isUnlocked = item.isUnlocked;
          badge.unlockedTime = item.unlockedTime;
        }
      }
    } catch (error) {
      console.error(`[BadgeManager] loadBadges failed: ${JSON.stringify(error)}`);
    }
  }

  /** 将奖牌数据保存到 Preferences */
  private async saveBadges(): Promise<void> {
    if (!this.preferences) {
      return;
    }
    try {
      const storageMap: Record<string, BadgeStorageItem> = {};
      for (const badge of this.badges) {
        const item: BadgeStorageItem = {
          isUnlocked: badge.isUnlocked,
          unlockedTime: badge.unlockedTime
        };
        storageMap[badge.id] = item;
      }
      await this.preferences.put(BADGES_KEY, JSON.stringify(storageMap));
      await this.preferences.flush();
    } catch (error) {
      console.error(`[BadgeManager] saveBadges failed: ${JSON.stringify(error)}`);
    }
  }

  // ==================== 奖牌查询 ====================

  /** 获取所有奖牌列表 */
  getBadges(): Badge[] {
    return this.badges;
  }

  /** 根据 ID 获取奖牌 */
  getBadgeById(id: string): Badge | undefined {
    return this.badges.find((b: Badge): boolean => b.id === id);
  }

  /** 获取已解锁奖牌数量 */
  getUnlockedCount(): number {
    return this.badges.filter((b: Badge): boolean => b.isUnlocked).length;
  }

  /**
   * 获取指定奖牌的进度信息
   * @param badgeId 奖牌 ID
   * @param lightedProvinceIds 已点亮的省份 ID 列表
   * @returns number[] 第一个元素为已满足数，第二个为总需求数
   */
  getBadgeProgress(badgeId: string, lightedProvinceIds: string[]): number[] {
    const badge = this.badges.find((b: Badge): boolean => b.id === badgeId);
    if (!badge) {
      return [0, 0];
    }
    const matched = badge.requiredProvinceIds.filter((id: string): boolean => lightedProvinceIds.includes(id)).length;
    return [matched, badge.requiredProvinceIds.length];
  }

  // ==================== 解锁检测 ====================

  /**
   * 检测所有奖牌的解锁状态
   * @param lightedProvinceIds 当前已点亮的省份 ID 列表
   * @returns 新解锁的奖牌 ID 列表（可能为空）
   */
  async checkAllBadges(lightedProvinceIds: string[]): Promise<string[]> {
    const newlyUnlocked: string[] = [];

    for (const badge of this.badges) {
      if (badge.isUnlocked) {
        continue;
      }
      const allLighted = badge.requiredProvinceIds.every((id: string): boolean => lightedProvinceIds.includes(id));
      if (allLighted) {
        badge.isUnlocked = true;
        badge.unlockedTime = Date.now();
        newlyUnlocked.push(badge.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      await this.saveBadges();
    }

    return newlyUnlocked;
  }
}
