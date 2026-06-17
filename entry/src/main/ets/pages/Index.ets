/**
 * Index.ets - 旅游手账首页（Canvas 椭圆省份地图版）
 * 功能：
 * 1. 使用 Canvas 绘制中国34省级行政区地图（椭圆表示，大小反映省份面积）
 * 2. 点击未点亮省份 → 点亮并保存
 * 3. 点击已点亮省份 → 弹出对话框（取消打卡 / 查看手账）
 * 4. 长按拖动省份 → 移动椭圆位置（不可拖出画布边界）
 * 5. 多端自适应：一套基准数据，运行时根据Canvas尺寸动态缩放
 */
import common from '@ohos.app.ability.common';
import router from '@ohos.router';
import { ProvinceModel, Province, BASE_WIDTH, BASE_HEIGHT } from '../model/DataModel';
import { pointInEllipse } from '../common/PointInPolygon';
import { ContinuationHelper } from '../common/ContinuationHelper';

// ==================== 颜色常量 ====================

const COLOR_BG = '#FFF9F0';             // 画布背景色
const COLOR_LIGHTED = '#F5A623';        // 打卡后的填充色（金色）
const COLOR_STROKE = '#555555';         // 省份描边色
const COLOR_DRAG_STROKE = '#000000';    // 拖动时的描边色（黑色）
const COLOR_TEXT = '#333333';           // 省份名称文字色（未点亮）
const COLOR_TEXT_LIGHTED = '#FFFFFF';   // 省份名称文字色（已点亮）
const COLOR_CHECK = '#FFFFFF';          // 打勾图标色

/** 椭圆布局参数 */
interface EllipseLayout {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

@Entry
@Component
struct Index {
  private provinceModel: ProvinceModel = ProvinceModel.getInstance();
  private continuationHelper: ContinuationHelper = ContinuationHelper.getInstance();
  private settings: RenderingContextSettings = new RenderingContextSettings(true);
  private context2d: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);

  // Canvas 实际显示宽度（由 onAreaChange 动态获取）
  @State displayWidth: number = 0;
  // Canvas 实际显示高度（由 onAreaChange 动态获取）
  @State displayHeight: number = 0;

  // 省份数据（响应式）
  @State provinces: Province[] = [];

  // Toast 提示
  @State toastMsg: string = '';
  @State showToast: boolean = false;

  // 操作对话框
  @State showActionDialog: boolean = false;
  @State actionProvinceId: string = '';
  @State actionProvinceName: string = '';

  // 拖动状态
  private isDragging: boolean = false;
  private draggingProvinceId: string = '';
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragOrigCx: number = 0;
  private dragOrigCy: number = 0;
  private dragMoved: boolean = false;
  private longPressTimer: number = -1;

  // ==================== 生命周期 ====================

  async aboutToAppear(): Promise<void> {
    const context = getContext(this) as common.UIAbilityContext;
    await this.provinceModel.init(context);
    this.refreshProvinces();

    // 更新自由流转回调（首页不追踪具体省份）
    this.continuationHelper.updateCallbacks(
      () => {
        return { provinceId: '', timestamp: Date.now() };
      },
      (data) => {
        if (data.provinceId) {
          AppStorage.setOrCreate<string>('continuation_province_id', data.provinceId);
          // 流转恢复后自动跳转到省份详情页
          router.pushUrl({
            url: 'pages/ProvinceDetail',
            params: { provinceId: data.provinceId }
          });
        }
      }
    );

    // 检查是否有流转恢复数据，自动跳转到对应省份详情页
    const continuationProvinceId = AppStorage.get<string>('continuation_province_id');
    if (continuationProvinceId) {
      AppStorage.setOrCreate<string>('continuation_province_id', '');
      router.pushUrl({
        url: 'pages/ProvinceDetail',
        params: { provinceId: continuationProvinceId }
      });
    }
  }

  /** 刷新省份数据 */
  refreshProvinces(): void {
    this.provinces = [...this.provinceModel.getProvinces()];
    this.drawMap();
  }

  // ==================== 动态布局计算 ====================

  /**
   * 椭圆尺寸缩放因子
   * 基准：min(canvasW, canvasH) / 1000
   * 保证椭圆大小与屏幕尺寸成正比
   */
  getSizeScale(): number {
    if (this.displayWidth <= 0 || this.displayHeight <= 0) {
      return 1;
    }
    return Math.min(this.displayWidth, this.displayHeight) / BASE_HEIGHT;
  }

  /**
   * 椭圆最小水平半径（保证文字可读）
   * 取 canvasWidth 的 3.5%
   */
  getMinRx(): number {
    return Math.round(this.displayWidth * 0.035);
  }

  /**
   * 椭圆最小垂直半径（保证文字可读）
   * 取 canvasHeight 的 2.5%
   */
  getMinRy(): number {
    return Math.round(this.displayHeight * 0.025);
  }

  /**
   * 获取省份在当前Canvas上的椭圆参数
   * 基准坐标按比例映射到实际Canvas尺寸，椭圆半径按sizeScale缩放并保证最小值
   */
  getProvinceLayout(province: Province): EllipseLayout {
    const cx = province.cx / BASE_WIDTH * this.displayWidth;
    const cy = province.cy / BASE_HEIGHT * this.displayHeight;
    const sizeScale = this.getSizeScale();
    const minRx = this.getMinRx();
    const minRy = this.getMinRy();
    const rx = Math.max(Math.round(province.rx * sizeScale), minRx);
    const ry = Math.max(Math.round(province.ry * sizeScale), minRy);
    const layout: EllipseLayout = { cx, cy, rx, ry };
    return layout;
  }

  // ==================== 拖动边界 ====================

  /** Canvas左边界（像素） */
  getBoundsLeft(): number {
    return 0;
  }

  /** Canvas上边界（像素） */
  getBoundsTop(): number {
    return 0;
  }

  /** Canvas右边界（像素） */
  getBoundsRight(): number {
    return this.displayWidth;
  }

  /** Canvas下边界（像素） */
  getBoundsBottom(): number {
    return this.displayHeight;
  }

  // ==================== 地图绘制 ====================

  /** 绘制整个地图 */
  drawMap(): void {
    const ctx = this.context2d;
    if (!ctx) {
      return;
    }

    const w = this.displayWidth;
    const h = this.displayHeight;
    if (w <= 0 || h <= 0) {
      return;
    }

    // 清空画布
    ctx.clearRect(0, 0, w, h);

    // 绘制背景
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, w, h);

    // 绘制每个省份
    for (const province of this.provinces) {
      this.drawProvince(ctx, province);
    }
  }

  /** 绘制单个省份（椭圆） */
  drawProvince(ctx: CanvasRenderingContext2D, province: Province): void {
    const layout = this.getProvinceLayout(province);
    const cx = layout.cx;
    const cy = layout.cy;
    const rx = layout.rx;
    const ry = layout.ry;

    // 绘制椭圆
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

    // 填充颜色
    if (province.isLighted) {
      ctx.fillStyle = COLOR_LIGHTED;
    } else {
      ctx.fillStyle = province.color;
    }
    ctx.fill();

    // 描边
    if (this.isDragging && this.draggingProvinceId === province.id) {
      ctx.strokeStyle = COLOR_DRAG_STROKE;
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = COLOR_STROKE;
      ctx.lineWidth = 1.5;
    }
    ctx.stroke();

    // 绘制省份名称
    const minRadius = Math.min(rx, ry);
    let fontSize = Math.round(minRadius * 1.8);
    fontSize = Math.max(16, Math.min(56, fontSize));

    ctx.fillStyle = province.isLighted ? COLOR_TEXT_LIGHTED : COLOR_TEXT;
    ctx.font = (province.isLighted ? 'bold ' : '') + fontSize + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(province.name, cx, cy);

    // 已点亮省份绘制打勾图标
    if (province.isLighted) {
      const checkSize = Math.max(10, Math.round(minRadius * 0.7));
      ctx.fillStyle = COLOR_CHECK;
      ctx.font = 'bold ' + checkSize + 'px sans-serif';
      ctx.fillText('\u2714', cx + rx * 0.6, cy - ry * 0.6);
    }
  }

  // ==================== 触摸事件处理 ====================

  /** 查找触摸点所在的省份 */
  findProvinceAt(pixelX: number, pixelY: number): Province | null {
    for (let i = this.provinces.length - 1; i >= 0; i--) {
      const province = this.provinces[i];
      const layout = this.getProvinceLayout(province);
      if (pointInEllipse(pixelX, pixelY, layout.cx, layout.cy, layout.rx, layout.ry)) {
        return province;
      }
    }
    return null;
  }

  /** 触摸开始 */
  onTouchDown(x: number, y: number): void {
    const province = this.findProvinceAt(x, y);
    if (!province) {
      return;
    }

    // 记录拖动起始信息（像素坐标）
    this.draggingProvinceId = province.id;
    this.dragStartX = x;
    this.dragStartY = y;
    const layout = this.getProvinceLayout(province);
    this.dragOrigCx = layout.cx;
    this.dragOrigCy = layout.cy;
    this.dragMoved = false;
    this.isDragging = false;

    // 启动长按计时器（500ms 后进入拖动模式）
    this.longPressTimer = setTimeout(() => {
      this.isDragging = true;
      this.drawMap();
    }, 500);
  }

  /** 触摸移动 */
  onTouchMove(x: number, y: number): void {
    if (!this.draggingProvinceId) {
      return;
    }

    // 计算移动距离（像素）
    const dx = x - this.dragStartX;
    const dy = y - this.dragStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果移动距离超过阈值，取消长按计时器，直接进入拖动
    if (distance > 3 && !this.isDragging) {
      clearTimeout(this.longPressTimer);
      this.isDragging = true;
    }

    if (this.isDragging) {
      this.dragMoved = true;
      const province = this.provinces.find(p => p.id === this.draggingProvinceId);
      if (province) {
        let newCx = this.dragOrigCx + dx;
        let newCy = this.dragOrigCy + dy;

        // 限制椭圆不能拖出Canvas边界
        const boundsLeft = this.getBoundsLeft();
        const boundsTop = this.getBoundsTop();
        const boundsRight = this.getBoundsRight();
        const boundsBottom = this.getBoundsBottom();
        const layout = this.getProvinceLayout(province);
        newCx = Math.max(boundsLeft + layout.rx, Math.min(boundsRight - layout.rx, newCx));
        newCy = Math.max(boundsTop + layout.ry, Math.min(boundsBottom - layout.ry, newCy));

        // 将像素坐标转换回基准坐标并更新
        province.cx = newCx / this.displayWidth * BASE_WIDTH;
        province.cy = newCy / this.displayHeight * BASE_HEIGHT;
        this.drawMap();
      }
    }
  }

  /** 触摸结束 */
  async onTouchUp(): Promise<void> {
    // 清除长按计时器
    if (this.longPressTimer !== -1) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = -1;
    }

    if (this.isDragging && this.dragMoved) {
      // 拖动结束 → 保存位置
      const province = this.provinces.find(p => p.id === this.draggingProvinceId);
      if (province) {
        await this.provinceModel.updateProvincePosition(province.id, province.cx, province.cy);
        this.showToastMsg(`已移动 ${province.name}`);
      }
    } else if (!this.dragMoved && this.draggingProvinceId) {
      // 没有拖动 → 当作点击处理
      const province = this.provinces.find(p => p.id === this.draggingProvinceId);
      if (province) {
        await this.onProvinceClick(province);
      }
    }

    // 重置拖动状态
    this.isDragging = false;
    this.draggingProvinceId = '';
    this.dragMoved = false;
    this.drawMap();
  }

  // ==================== 点击处理 ====================

  /** 省份被点击 */
  async onProvinceClick(province: Province): Promise<void> {
    if (province.isLighted) {
      // 已点亮 → 弹出操作对话框（取消打卡 / 查看手账）
      this.actionProvinceId = province.id;
      this.actionProvinceName = province.name;
      this.showActionDialog = true;
    } else {
      // 未点亮 → 点亮该省份
      await this.provinceModel.lightProvince(province.id);
      this.refreshProvinces();
      this.showToastMsg(`已点亮 ${province.name}！`);
    }
  }

  // ==================== 工具方法 ====================

  /** 显示 Toast 提示 */
  showToastMsg(msg: string): void {
    this.toastMsg = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }

  // ==================== 构建界面 ====================

  build() {
    Stack() {
      Column() {
        // 顶部标题栏
        this.TitleBar()

        // Canvas 地图区域（填满中间区域）
        this.MapArea()

        // 底部统计信息
        this.StatsBar()
      }
      .width('100%')
      .height('100%')

      // Toast 提示
      if (this.showToast) {
        this.ToastView()
      }

      // 操作对话框
      if (this.showActionDialog) {
        this.ActionDialogView()
      }
    }
    .width('100%')
    .height('100%')
  }

  // ==================== 子组件 ====================

  /** 顶部标题栏 */
  @Builder
  TitleBar() {
    Row() {
      Text('TravelJournal')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')
        .margin({ left: 16 })

      Blank()

      // 自由流转按钮
      Text('\u21C4')  // ⇄ 流转图标
        .fontSize(20)
        .fontColor('#666666')
        .margin({ right: 12 })
        .onClick(() => {
          this.continuationHelper.startContinuation();
        })

      Text('长按拖动可移动省份')
        .fontSize(13)
        .fontColor('#999999')
        .margin({ right: 16 })
    }
    .width('100%')
    .height(56)
    .backgroundColor('#FFFFFF')
    .shadow({ radius: 2, color: '#1A000000', offsetY: 1 })
  }

  /** Canvas 地图区域（填满中间区域，与上下栏平齐） */
  @Builder
  MapArea() {
    Canvas(this.context2d)
      .width('100%')
      .layoutWeight(1)
      .backgroundColor(COLOR_BG)
      .onReady(() => {
        this.drawMap();
      })
      .onTouch((event: TouchEvent) => {
        if (event.type === TouchType.Down) {
          this.onTouchDown(event.touches[0].x, event.touches[0].y);
        } else if (event.type === TouchType.Move) {
          this.onTouchMove(event.touches[0].x, event.touches[0].y);
        } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
          this.onTouchUp();
        }
      })
      .onAreaChange((oldValue: Area, newValue: Area) => {
        // 监听容器尺寸变化，实现多端自适应
        const newWidth = newValue.width as number;
        const newHeight = newValue.height as number;
        if (newWidth > 0 && newHeight > 0) {
          this.displayWidth = newWidth;
          this.displayHeight = newHeight;
          this.drawMap();
        }
      })
  }

  /** 底部统计栏 */
  @Builder
  StatsBar() {
    Row() {
      Text(`已点亮 ${this.provinces.filter(p => p.isLighted).length} / ${this.provinces.length} 个省级行政区`)
        .fontSize(14)
        .fontColor('#666666')
    }
    .width('100%')
    .height(48)
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#FFFFFF')
    .shadow({ radius: 2, color: '#1A000000', offsetY: -1 })
  }

  /** Toast 提示 */
  @Builder
  ToastView() {
    Column() {
      Text(this.toastMsg)
        .fontSize(14)
        .fontColor('#FFFFFF')
        .padding({ left: 20, right: 20, top: 10, bottom: 10 })
        .backgroundColor('#CC333333')
        .borderRadius(20)
    }
    .width('100%')
    .justifyContent(FlexAlign.Center)
    .position({ x: 0, y: '50%' })
  }

  /** 操作对话框（取消打卡 / 查看手账） */
  @Builder
  ActionDialogView() {
    Column() {
      Column() {
        Text(this.actionProvinceName)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ top: 24, bottom: 20 })

        // 查看手账按钮
        Button('查看手账')
          .width('80%')
          .height(44)
          .fontSize(16)
          .fontColor('#FFFFFF')
          .backgroundColor('#F5A623')
          .borderRadius(8)
          .onClick(() => {
            this.showActionDialog = false;
            router.pushUrl({
              url: 'pages/ProvinceDetail',
              params: { provinceId: this.actionProvinceId }
            });
          })

        // 取消打卡按钮
        Button('取消打卡')
          .width('80%')
          .height(44)
          .fontSize(16)
          .fontColor('#E74C3C')
          .backgroundColor('#FFFFFF')
          .borderRadius(8)
          .border({ width: 1, color: '#E74C3C' })
          .margin({ top: 12, bottom: 24 })
          .onClick(async () => {
            this.showActionDialog = false;
            await this.provinceModel.unlightProvince(this.actionProvinceId);
            this.refreshProvinces();
            this.showToastMsg(`已取消 ${this.actionProvinceName} 的打卡`);
          })

        // 关闭按钮
        Text('关闭')
          .fontSize(14)
          .fontColor('#999999')
          .margin({ bottom: 16 })
          .onClick(() => {
            this.showActionDialog = false;
          })
      }
      .width('55%')
      .backgroundColor('#FFFFFF')
      .borderRadius(16)
      .alignItems(HorizontalAlign.Center)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#66000000')
  }
}
