/**
 * Badges.ets - 旅行成就奖牌展示页
 * 使用 Scroll + Flex 布局，每行2枚奖牌卡片
 * 尺寸基于屏幕宽度自适应缩放（基准 360px 手机宽度）
 * 未解锁：灰度+半透明仅作用于奖章内部（裁剪边界内），边框保持原色
 * 已解锁：彩色 + 金色边框 + 光晕 + 对应背景色
 * 圆形徽章：borderRadius=50% 实现真正圆形
 */
import { BadgeManager, Badge } from '../common/BadgeManager';

/** 基准屏幕宽度（手机典型值），用于自适应缩放 */
const BASE_SCREEN_WIDTH: number = 360;

@Component
export struct Badges {
  private badgeManager: BadgeManager = BadgeManager.getInstance();
  @State badges: Badge[] = [];
  @State containerWidth: number = 0;

  aboutToAppear(): void {
    this.refreshBadges();
  }

  /** 刷新奖牌数据（深拷贝确保 @State 检测到变化） */
  refreshBadges(): void {
    const source = this.badgeManager.getBadges();
    const copied: Badge[] = [];
    for (const b of source) {
      const badge: Badge = {
        id: b.id,
        name: b.name,
        emoji: b.emoji,
        shape: b.shape,
        requiredProvinceIds: b.requiredProvinceIds,
        unlockedBgColor: b.unlockedBgColor,
        isUnlocked: b.isUnlocked,
        unlockedTime: b.unlockedTime
      };
      copied.push(badge);
    }
    this.badges = copied;
  }

  /** 缩放因子：当前屏幕宽度 / 基准宽度，最小为 1 */
  getScale(): number {
    if (this.containerWidth <= 0) {
      return 1;
    }
    return Math.max(1, this.containerWidth / BASE_SCREEN_WIDTH);
  }

  build() {
    Column() {
      // 页面标题
      Text('\u{1F3C5} 旅行成就')
        .fontSize(this.getScale() * 24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')
        .margin({ top: 20, bottom: 16 })

      // 奖牌网格（可滚动）
      Scroll() {
        Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.SpaceEvenly, alignItems: ItemAlign.Start }) {
          ForEach(this.badges, (badge: Badge) => {
            this.BadgeCard(badge)
          }, (badge: Badge) => badge.id + (badge.isUnlocked ? '_1' : '_0'))
        }
        .width('100%')
        .padding({ left: '4%', right: '4%' })
      }
      .layoutWeight(1)
      .scrollBar(BarState.Auto)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFF9F0')
    .onAreaChange((_oldValue: Area, newValue: Area) => {
      const newWidth = newValue.width as number;
      if (newWidth > 0 && newWidth !== this.containerWidth) {
        this.containerWidth = newWidth;
      }
    })
    // 当组件变为可见时刷新数据（Swiper 切换到此页时触发）
    .onVisibleAreaChange([0.0, 1.0], (isVisible: boolean, currentRatio: number) => {
      if (isVisible && currentRatio > 0.0) {
        this.refreshBadges();
      }
    })
  }

  /** 单个奖牌卡片 */
  @Builder
  BadgeCard(badge: Badge) {
    Column() {
      // Emoji 容器（牌面）- 三层结构确保灰度限制在奖章边界内
      // 最外层：负责边框（不受灰度影响）
      Stack() {
        // 中间层：负责裁剪形状 + 灰度 + 半透明效果
        Stack() {
          // 最内层：负责 Emoji 内容和背景色
          Column() {
            Text(badge.emoji)
              .fontSize(this.getScale() * 48)
          }
          .width('100%')
          .height('100%')
          .justifyContent(FlexAlign.Center)
          .alignItems(HorizontalAlign.Center)
          .backgroundColor(badge.isUnlocked ? badge.unlockedBgColor : '#F0F0F0')
        }
        .width('100%')
        .height('100%')
        .borderRadius(badge.shape === 'circle' ? '50%' : 12)
        .clip(true)
        .grayscale(badge.isUnlocked ? 0 : 1)
        .opacity(badge.isUnlocked ? 1 : 0.6)
      }
      .width('80%')
      .aspectRatio(1)
      .borderRadius(badge.shape === 'circle' ? '50%' : 12)
      .border({
        width: badge.isUnlocked ? 2.5 : 1.5,
        color: badge.isUnlocked ? '#FFD700' : '#CCCCCC'
      })
      .shadow(badge.isUnlocked ? {
        radius: 10,
        color: '#80FFD700',
        offsetX: 0,
        offsetY: 0
      } : {
        radius: 0,
        color: '#00000000',
        offsetX: 0,
        offsetY: 0
      })
      .margin({ top: 12 })

      // 奖牌名称
      Text(badge.name)
        .fontSize(this.getScale() * 14)
        .fontColor('#333333')
        .margin({ top: 10, bottom: 12 })
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
    }
    .width('42%')
    .margin({ top: 8, bottom: 8 })
    .borderRadius(16)
    .backgroundColor('#FFFAF0')
    .alignItems(HorizontalAlign.Center)
  }
}
