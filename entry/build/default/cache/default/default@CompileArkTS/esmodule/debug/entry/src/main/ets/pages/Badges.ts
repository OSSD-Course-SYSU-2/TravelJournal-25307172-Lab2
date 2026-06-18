if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Badges_Params {
    badgeManager?: BadgeManager;
    badges?: Badge[];
    containerWidth?: number;
}
import { BadgeManager } from "@normalized:N&&&entry/src/main/ets/common/BadgeManager&";
import type { Badge } from "@normalized:N&&&entry/src/main/ets/common/BadgeManager&";
/** 基准屏幕宽度（手机典型值），用于自适应缩放 */
const BASE_SCREEN_WIDTH: number = 360;
export class Badges extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.badgeManager = BadgeManager.getInstance();
        this.__badges = new ObservedPropertyObjectPU([], this, "badges");
        this.__containerWidth = new ObservedPropertySimplePU(0, this, "containerWidth");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Badges_Params) {
        if (params.badgeManager !== undefined) {
            this.badgeManager = params.badgeManager;
        }
        if (params.badges !== undefined) {
            this.badges = params.badges;
        }
        if (params.containerWidth !== undefined) {
            this.containerWidth = params.containerWidth;
        }
    }
    updateStateVars(params: Badges_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__badges.purgeDependencyOnElmtId(rmElmtId);
        this.__containerWidth.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__badges.aboutToBeDeleted();
        this.__containerWidth.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private badgeManager: BadgeManager;
    private __badges: ObservedPropertyObjectPU<Badge[]>;
    get badges() {
        return this.__badges.get();
    }
    set badges(newValue: Badge[]) {
        this.__badges.set(newValue);
    }
    private __containerWidth: ObservedPropertySimplePU<number>;
    get containerWidth() {
        return this.__containerWidth.get();
    }
    set containerWidth(newValue: number) {
        this.__containerWidth.set(newValue);
    }
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#FFF9F0');
            Column.onAreaChange((_oldValue: Area, newValue: Area) => {
                const newWidth = newValue.width as number;
                if (newWidth > 0 && newWidth !== this.containerWidth) {
                    this.containerWidth = newWidth;
                }
            });
            Column.onVisibleAreaChange([0.0, 1.0], (isVisible: boolean, currentRatio: number) => {
                if (isVisible && currentRatio > 0.0) {
                    this.refreshBadges();
                }
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 页面标题
            Text.create('\u{1F3C5} 旅行成就');
            // 页面标题
            Text.fontSize(this.getScale() * 24);
            // 页面标题
            Text.fontWeight(FontWeight.Bold);
            // 页面标题
            Text.fontColor('#333333');
            // 页面标题
            Text.margin({ top: 20, bottom: 16 });
        }, Text);
        // 页面标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 奖牌网格（可滚动）
            Scroll.create();
            // 奖牌网格（可滚动）
            Scroll.layoutWeight(1);
            // 奖牌网格（可滚动）
            Scroll.scrollBar(BarState.Auto);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.SpaceEvenly, alignItems: ItemAlign.Start });
            Flex.width('100%');
            Flex.padding({ left: '4%', right: '4%' });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const badge = _item;
                this.BadgeCard.bind(this)(badge);
            };
            this.forEachUpdateFunction(elmtId, this.badges, forEachItemGenFunction, (badge: Badge) => badge.id + (badge.isUnlocked ? '_1' : '_0'), false, false);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        // 奖牌网格（可滚动）
        Scroll.pop();
        Column.pop();
    }
    /** 单个奖牌卡片 */
    BadgeCard(badge: Badge, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('42%');
            Column.margin({ top: 8, bottom: 8 });
            Column.borderRadius(16);
            Column.backgroundColor('#FFFAF0');
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Emoji 容器（牌面）- 三层结构确保灰度限制在奖章边界内
            // 最外层：负责边框（不受灰度影响）
            Stack.create();
            // Emoji 容器（牌面）- 三层结构确保灰度限制在奖章边界内
            // 最外层：负责边框（不受灰度影响）
            Stack.width('80%');
            // Emoji 容器（牌面）- 三层结构确保灰度限制在奖章边界内
            // 最外层：负责边框（不受灰度影响）
            Stack.aspectRatio(1);
            // Emoji 容器（牌面）- 三层结构确保灰度限制在奖章边界内
            // 最外层：负责边框（不受灰度影响）
            Stack.borderRadius(badge.shape === 'circle' ? '50%' : 12);
            // Emoji 容器（牌面）- 三层结构确保灰度限制在奖章边界内
            // 最外层：负责边框（不受灰度影响）
            Stack.border({
                width: badge.isUnlocked ? 2.5 : 1.5,
                color: badge.isUnlocked ? '#FFD700' : '#CCCCCC'
            });
            // Emoji 容器（牌面）- 三层结构确保灰度限制在奖章边界内
            // 最外层：负责边框（不受灰度影响）
            Stack.shadow(badge.isUnlocked ? {
                radius: 10,
                color: '#80FFD700',
                offsetX: 0,
                offsetY: 0
            } : {
                radius: 0,
                color: '#00000000',
                offsetX: 0,
                offsetY: 0
            });
            // Emoji 容器（牌面）- 三层结构确保灰度限制在奖章边界内
            // 最外层：负责边框（不受灰度影响）
            Stack.margin({ top: 12 });
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 中间层：负责裁剪形状 + 灰度 + 半透明效果
            Stack.create();
            // 中间层：负责裁剪形状 + 灰度 + 半透明效果
            Stack.width('100%');
            // 中间层：负责裁剪形状 + 灰度 + 半透明效果
            Stack.height('100%');
            // 中间层：负责裁剪形状 + 灰度 + 半透明效果
            Stack.borderRadius(badge.shape === 'circle' ? '50%' : 12);
            // 中间层：负责裁剪形状 + 灰度 + 半透明效果
            Stack.clip(true);
            // 中间层：负责裁剪形状 + 灰度 + 半透明效果
            Stack.grayscale(badge.isUnlocked ? 0 : 1);
            // 中间层：负责裁剪形状 + 灰度 + 半透明效果
            Stack.opacity(badge.isUnlocked ? 1 : 0.6);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 最内层：负责 Emoji 内容和背景色
            Column.create();
            // 最内层：负责 Emoji 内容和背景色
            Column.width('100%');
            // 最内层：负责 Emoji 内容和背景色
            Column.height('100%');
            // 最内层：负责 Emoji 内容和背景色
            Column.justifyContent(FlexAlign.Center);
            // 最内层：负责 Emoji 内容和背景色
            Column.alignItems(HorizontalAlign.Center);
            // 最内层：负责 Emoji 内容和背景色
            Column.backgroundColor(badge.isUnlocked ? badge.unlockedBgColor : '#F0F0F0');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(badge.emoji);
            Text.fontSize(this.getScale() * 48);
        }, Text);
        Text.pop();
        // 最内层：负责 Emoji 内容和背景色
        Column.pop();
        // 中间层：负责裁剪形状 + 灰度 + 半透明效果
        Stack.pop();
        // Emoji 容器（牌面）- 三层结构确保灰度限制在奖章边界内
        // 最外层：负责边框（不受灰度影响）
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 奖牌名称
            Text.create(badge.name);
            // 奖牌名称
            Text.fontSize(this.getScale() * 14);
            // 奖牌名称
            Text.fontColor('#333333');
            // 奖牌名称
            Text.margin({ top: 10, bottom: 12 });
            // 奖牌名称
            Text.maxLines(1);
            // 奖牌名称
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        // 奖牌名称
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
