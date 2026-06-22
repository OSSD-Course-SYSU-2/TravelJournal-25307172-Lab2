/**
 * DrawBoard.ets - 画板主组件
 * 功能：
 * 1. Canvas 手写绘制（鼠标/手指）
 * 2. 画笔颜色切换（6种预设颜色）
 * 3. 笔触粗细切换（3档）
 * 4. 橡皮擦模式
 * 5. 清空画布（二次确认）
 * 6. 添加照片到画布
 * 7. 数据保存与恢复
 * 8. 适配一多：使用百分比/fp/vp 相对单位
 */
import { DrawDataManager } from '../common/DrawDataManager';
import photoAccessHelper from '@ohos.file.photoAccessHelper';
import image from '@ohos.multimedia.image';

// 画笔工具枚举
enum DrawTool {
  PEN,       // 画笔
  ERASER     // 橡皮擦
}

// 笔触粗细枚举
enum StrokeWidth {
  THIN = 2,   // 细
  MEDIUM = 5, // 中
  THICK = 10  // 粗
}

// 预设颜色
const PRESET_COLORS: string[] = ['#000000', '#FF0000', '#0000FF', '#00AA00', '#FF8800', '#8800CC'];

@Component
export struct DrawBoard {
  // 省份 ID，用于绑定画板数据
  @Prop provinceId: string = '';

  // 画板数据管理器
  private drawDataManager: DrawDataManager = DrawDataManager.getInstance();

  // Canvas 上下文
  private settings: RenderingContextSettings = new RenderingContextSettings(true);
  private context: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);

  // 绘制状态
  @State currentTool: DrawTool = DrawTool.PEN;
  @State currentColor: string = '#000000';
  @State currentStrokeWidth: StrokeWidth = StrokeWidth.MEDIUM;
  @State isDrawing: boolean = false;

  // 清空确认
  @State showClearConfirm: boolean = false;

  // 上一个触摸点坐标
  private lastX: number = 0;
  private lastY: number = 0;

  // Canvas 尺寸
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;

  // 是否已加载保存的数据
  private dataLoaded: boolean = false;

  // ==================== 生命周期 ====================

  aboutToAppear(): void {
    // 延迟加载已保存的画板数据（等待 Canvas onReady 完成）
    setTimeout(() => {
      this.loadSavedData();
    }, 500);
  }

  /** 组件销毁时自动保存数据 */
  aboutToDisappear(): void {
    this.saveDrawData();
  }

  /** 加载已保存的画板数据 */
  async loadSavedData(): Promise<void> {
    if (this.dataLoaded || this.canvasWidth === 0) {
      return;
    }
    const savedData = await this.drawDataManager.loadDrawData(this.provinceId);
    if (savedData && savedData.length > 0) {
      try {
        // 使用 @ohos.multimedia.image 创建 ImageSource 并绘制到 Canvas
        await this.drawBase64ToCanvas(savedData);
        this.dataLoaded = true;
      } catch (error) {
        console.error(`[DrawBoard] loadSavedData failed: ${JSON.stringify(error)}`);
      }
    } else {
      this.dataLoaded = true;
    }
  }

  /**
   * 将 base64 图片数据绘制到 Canvas
   * 使用 @ohos.multimedia.image API 替代 Web Image 对象
   */
  async drawBase64ToCanvas(base64Data: string): Promise<void> {
    try {
      // 提取纯 base64 数据（去掉 data:image/png;base64, 前缀）
      const base64Str = base64Data.replace(/^data:image\/\w+;base64,/, '');
      // 将 base64 解码为 ArrayBuffer
      const buffer: ArrayBuffer = this.base64ToArrayBuffer(base64Str);
      // 创建 ImageSource
      const imageSource: image.ImageSource = image.createImageSource(buffer);
      // 创建 PixelMap
      const pixelMap: image.PixelMap = await imageSource.createPixelMap();
      // 绘制到 Canvas
      this.context.drawImage(pixelMap, 0, 0, this.canvasWidth, this.canvasHeight);
    } catch (error) {
      console.error(`[DrawBoard] drawBase64ToCanvas failed: ${JSON.stringify(error)}`);
    }
  }

  /**
   * base64 字符串转 ArrayBuffer
   * ArkTS 不支持 atob()，手动实现解码
   */
  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup: number[] = new Array(128);
    for (let i = 0; i < chars.length; i++) {
      lookup[chars.charCodeAt(i)] = i;
    }

    const len: number = base64.length;
    let bufferLength: number = len * 3 / 4;
    if (base64[len - 1] === '=') {
      bufferLength--;
    }
    if (base64[len - 2] === '=') {
      bufferLength--;
    }

    const bytes: Uint8Array = new Uint8Array(bufferLength);
    let p: number = 0;
    for (let i = 0; i < len; i += 4) {
      const a: number = lookup[base64.charCodeAt(i)];
      const b: number = lookup[base64.charCodeAt(i + 1)];
      const c: number = lookup[base64.charCodeAt(i + 2)];
      const d: number = lookup[base64.charCodeAt(i + 3)];

      bytes[p++] = (a << 2) | (b >> 4);
      if (c !== undefined && p < bufferLength) {
        bytes[p++] = ((b & 0x0F) << 4) | (c >> 2);
      }
      if (d !== undefined && p < bufferLength) {
        bytes[p++] = ((c & 0x03) << 6) | d;
      }
    }

    return bytes.buffer;
  }

  // ==================== 绘制逻辑 ====================

  /** 处理触摸事件 */
  handleTouchEvent(event: TouchEvent): void {
    const touch = event.touches[0];
    const x = touch.x;
    const y = touch.y;

    switch (event.type) {
      case TouchType.Down:
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        this.context.beginPath();
        this.context.moveTo(x, y);
        break;

      case TouchType.Move:
        if (!this.isDrawing) {
          return;
        }
        // 设置绘制样式
        if (this.currentTool === DrawTool.ERASER) {
          this.context.globalCompositeOperation = 'destination-out';
          this.context.strokeStyle = 'rgba(0,0,0,1)';
          this.context.lineWidth = this.currentStrokeWidth * 3; // 橡皮擦稍大
        } else {
          this.context.globalCompositeOperation = 'source-over';
          this.context.strokeStyle = this.currentColor;
          this.context.lineWidth = this.currentStrokeWidth;
        }
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';

        // 使用二次贝塞尔曲线使笔迹更平滑
        const midX = (this.lastX + x) / 2;
        const midY = (this.lastY + y) / 2;
        this.context.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
        this.context.stroke();

        this.lastX = x;
        this.lastY = y;
        break;

      case TouchType.Up:
      case TouchType.Cancel:
        if (this.isDrawing) {
          this.context.lineTo(x, y);
          this.context.stroke();
          this.context.closePath();
          this.isDrawing = false;
          // 恢复默认合成模式
          this.context.globalCompositeOperation = 'source-over';
        }
        break;
    }
  }

  // ==================== 工具操作 ====================

  /** 切换画笔工具 */
  switchTool(tool: DrawTool): void {
    this.currentTool = tool;
  }

  /** 切换颜色 */
  switchColor(color: string): void {
    this.currentColor = color;
    this.currentTool = DrawTool.PEN; // 选颜色时自动切回画笔
  }

  /** 切换粗细 */
  switchStrokeWidth(width: StrokeWidth): void {
    this.currentStrokeWidth = width;
  }

  /** 清空画布 */
  clearCanvas(): void {
    this.showClearConfirm = true;
  }

  /** 确认清空 */
  confirmClear(): void {
    this.showClearConfirm = false;
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  /** 添加照片到画布 */
  async addPhoto(): Promise<void> {
    try {
      const picker: photoAccessHelper.PhotoViewPicker = new photoAccessHelper.PhotoViewPicker();
      const selectOptions: photoAccessHelper.PhotoSelectOptions = {
        MIMEType: photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE,
        maxSelectNumber: 1
      };
      const result: photoAccessHelper.PhotoSelectResult = await picker.select(selectOptions);
      if (result && result.photoUris && result.photoUris.length > 0) {
        const uri = result.photoUris[0];
        this.drawImageToCanvas(uri);
      }
    } catch (error) {
      console.error(`[DrawBoard] addPhoto failed: ${JSON.stringify(error)}`);
    }
  }

  /**
   * 将图片绘制到画布中央
   * 使用 @ohos.multimedia.image 创建 PixelMap 绘制到 Canvas
   */
  async drawImageToCanvas(uri: string): Promise<void> {
    try {
      const imageSource: image.ImageSource = image.createImageSource(uri);
      const pixelMap: image.PixelMap = await imageSource.createPixelMap();
      // 计算居中位置，图片占画布宽度的 80%
      const imgWidth: number = this.canvasWidth * 0.8;
      const imageInfo: image.ImageInfo = await imageSource.getImageInfo();
      const imgHeight: number = imageInfo.size.height / imageInfo.size.width * imgWidth;
      const drawX: number = (this.canvasWidth - imgWidth) / 2;
      const drawY: number = (this.canvasHeight - imgHeight) / 2;
      this.context.drawImage(pixelMap, drawX, drawY, imgWidth, imgHeight);
    } catch (error) {
      console.error(`[DrawBoard] drawImageToCanvas failed: ${JSON.stringify(error)}`);
    }
  }

  /** 保存画板数据 */
  async saveDrawData(): Promise<void> {
    if (this.canvasWidth === 0) {
      return;
    }
    try {
      const imageData = this.context.toDataURL('image/png');
      await this.drawDataManager.saveDrawData(this.provinceId, imageData);
      console.info(`[DrawBoard] Draw data saved for province: ${this.provinceId}`);
    } catch (error) {
      console.error(`[DrawBoard] saveDrawData failed: ${JSON.stringify(error)}`);
    }
  }

  // ==================== 构建界面 ====================

  build() {
    Column() {
      // Canvas 绘制区域
      Canvas(this.context)
        .width('100%')
        .layoutWeight(1)
        .backgroundColor('#FFFFFF')
        .onReady(() => {
          this.canvasWidth = this.context.width;
          this.canvasHeight = this.context.height;
        })
        .onTouch((event: TouchEvent) => {
          this.handleTouchEvent(event);
        })

      // 工具栏
      this.ToolBar()
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFFFFF')
  }

  /** 底部工具栏 - 使用 fp/vp 相对单位适配一多 */
  @Builder
  ToolBar() {
    Column() {
      // 分隔线
      Divider()
        .color('#E0E0E0')
        .width('100%')

      Scroll() {
        Row() {
          // 画笔按钮
          Column() {
            Text('\u270F')  // ✏
              .fontSize(18)
              .fontColor(this.currentTool === DrawTool.PEN ? '#FF6B6B' : '#666666')
            Text('画笔')
              .fontSize(10)
              .fontColor(this.currentTool === DrawTool.PEN ? '#FF6B6B' : '#999999')
              .margin({ top: 2 })
          }
          .width(44)
          .justifyContent(FlexAlign.Center)
          .onClick(() => this.switchTool(DrawTool.PEN))

          // 颜色选择
          Row() {
            ForEach(PRESET_COLORS, (color: string) => {
              Circle()
                .width(20)
                .height(20)
                .fill(color)
                .stroke(this.currentColor === color && this.currentTool === DrawTool.PEN ? '#FF6B6B' : '#E0E0E0')
                .strokeWidth(this.currentColor === color && this.currentTool === DrawTool.PEN ? 2.5 : 1)
                .margin({ left: 3, right: 3 })
                .onClick(() => this.switchColor(color))
            }, (color: string) => color)
          }
          .margin({ left: 6, right: 6 })

          // 笔触粗细
          Row() {
            // 细
            Column() {
              Circle()
                .width(6)
                .height(6)
                .fill(this.currentStrokeWidth === StrokeWidth.THIN ? '#FF6B6B' : '#666666')
            }
            .width(28)
            .height(28)
            .justifyContent(FlexAlign.Center)
            .borderRadius(4)
            .backgroundColor(this.currentStrokeWidth === StrokeWidth.THIN ? '#FFF0F0' : Color.Transparent)
            .onClick(() => this.switchStrokeWidth(StrokeWidth.THIN))

            // 中
            Column() {
              Circle()
                .width(10)
                .height(10)
                .fill(this.currentStrokeWidth === StrokeWidth.MEDIUM ? '#FF6B6B' : '#666666')
            }
            .width(28)
            .height(28)
            .justifyContent(FlexAlign.Center)
            .borderRadius(4)
            .backgroundColor(this.currentStrokeWidth === StrokeWidth.MEDIUM ? '#FFF0F0' : Color.Transparent)
            .onClick(() => this.switchStrokeWidth(StrokeWidth.MEDIUM))

            // 粗
            Column() {
              Circle()
                .width(14)
                .height(14)
                .fill(this.currentStrokeWidth === StrokeWidth.THICK ? '#FF6B6B' : '#666666')
            }
            .width(28)
            .height(28)
            .justifyContent(FlexAlign.Center)
            .borderRadius(4)
            .backgroundColor(this.currentStrokeWidth === StrokeWidth.THICK ? '#FFF0F0' : Color.Transparent)
            .onClick(() => this.switchStrokeWidth(StrokeWidth.THICK))
          }
          .margin({ left: 4, right: 4 })

          // 橡皮擦
          Column() {
            Text('\u{1F9F9}')  // 🧹
              .fontSize(18)
            Text('橡皮')
              .fontSize(10)
              .fontColor(this.currentTool === DrawTool.ERASER ? '#FF6B6B' : '#999999')
              .margin({ top: 2 })
          }
          .width(44)
          .justifyContent(FlexAlign.Center)
          .onClick(() => this.switchTool(DrawTool.ERASER))

          // 清空
          Column() {
            Text('\u{1F5D1}')  // 🗑️
              .fontSize(18)
            Text('清空')
              .fontSize(10)
              .fontColor('#999999')
              .margin({ top: 2 })
          }
          .width(44)
          .justifyContent(FlexAlign.Center)
          .onClick(() => this.clearCanvas())

          // 添加照片
          Column() {
            Text('\u{1F5BC}')  // 🖼️
              .fontSize(18)
            Text('照片')
              .fontSize(10)
              .fontColor('#999999')
              .margin({ top: 2 })
          }
          .width(44)
          .justifyContent(FlexAlign.Center)
          .onClick(() => this.addPhoto())
        }
        .width('100%')
        .height(56)
        .justifyContent(FlexAlign.SpaceEvenly)
        .alignItems(VerticalAlign.Center)
        .padding({ left: 8, right: 8 })
      }
      .scrollable(ScrollDirection.Horizontal)
      .width('100%')
      .scrollBar(BarState.Off)
    }
    .width('100%')

    // 清空确认弹窗
    if (this.showClearConfirm) {
      this.ClearConfirmDialog()
    }
  }

  /** 清空确认对话框 */
  @Builder
  ClearConfirmDialog() {
    Column() {
      Column() {
        Text('确认清空')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ bottom: 12 })

        Text('清空后画布内容将无法恢复，是否确认？')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ bottom: 24 })

        Row() {
          Button('取消')
            .fontSize(14)
            .fontColor('#666666')
            .backgroundColor('#F0F0F0')
            .borderRadius(8)
            .layoutWeight(1)
            .onClick(() => {
              this.showClearConfirm = false;
            })

          Button('清空')
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor('#FF6B6B')
            .borderRadius(8)
            .layoutWeight(1)
            .margin({ left: 12 })
            .onClick(() => this.confirmClear())
        }
        .width('100%')
      }
      .width('72%')
      .padding(24)
      .backgroundColor('#FFFFFF')
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor('#80000000')
    .position({ x: 0, y: 0 })
    .zIndex(999)
  }
}
