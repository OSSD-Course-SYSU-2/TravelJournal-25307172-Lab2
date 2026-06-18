/**
 * BadgePopup.ets - 奖牌解锁通知弹窗组件（@CustomDialog 版本）
 * 当用户解锁新奖牌时，在屏幕中央弹出半透明遮罩通知
 * 包含大号 Emoji、奖牌名称、所需省份列表
 * 点击任意处或3秒后自动关闭，带放大弹出动画
 *
 * 注意：当前 Index.ets 使用内联 @Builder 实现弹窗，
 * 此组件作为 @CustomDialog 备用方案保留
 */
import { Badge, BadgePopupData } from '../common/BadgeManager';

// ==================== 弹窗组件 ====================

@CustomDialog
export struct BadgePopup {
  private controller: CustomDialogController;
  @State popupData: BadgePopupData | null = null;
  @State scaleValue: number = 0.5;
  @State opacityValue: number = 0;

  aboutToAppear(): void {
    // 延迟启动动画，确保组件已挂载
    setTimeout(() => {
      this.scaleValue = 1.0;
      this.opacityValue = 1.0;
    }, 50);
  }

  /** 关闭弹窗 */
  close(): void {
    this.controller.close();
  }

  build() {
    Column() {
      Column() {
        // 大号 Emoji
        Text(this.popupData?.badge.emoji ?? '')
          .fontSize(80)
          .margin({ top: 32, bottom: 16 })

        // 奖牌名称
        Text(this.popupData?.badge.name ?? '')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ bottom: 8 })

        // 解锁提示
        Text('奖牌解锁！')
          .fontSize(16)
          .fontColor('#F5A623')
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 12 })

        // 所需省份列表
        Text(this.popupData?.provinceNames.join('、') ?? '')
          .fontSize(13)
          .fontColor('#666666')
          .maxLines(3)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .textAlign(TextAlign.Center)
          .padding({ left: 24, right: 24 })
          .margin({ bottom: 24 })
      }
      .width('70%')
      .backgroundColor('#FFFFFF')
      .borderRadius(20)
      .alignItems(HorizontalAlign.Center)
      .shadow({ radius: 20, color: '#33000000', offsetY: 4 })
      .scale({ x: this.scaleValue, y: this.scaleValue })
      .opacity(this.opacityValue)
      .animation({
        duration: 300,
        curve: Curve.Spring,
        playMode: PlayMode.Normal
      })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('rgba(0,0,0,0.5)')
    .onClick(() => {
      this.close();
    })
  }
}
