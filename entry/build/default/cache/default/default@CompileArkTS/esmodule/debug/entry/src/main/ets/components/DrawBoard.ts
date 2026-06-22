if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DrawBoard_Params {
    provinceId?: string;
    // 关闭回调
    onClose?: () => void;
    drawDataManager?: DrawDataManager;
    settings?: RenderingContextSettings;
    context?: CanvasRenderingContext2D;
    currentTool?: DrawTool;
    currentColor?: string;
    currentStrokeWidth?: StrokeWidth;
    isDrawing?: boolean;
    showClearConfirm?: boolean;
    lastX?: number;
    lastY?: number;
    canvasWidth?: number;
    canvasHeight?: number;
    dataLoaded?: boolean;
}
import { DrawDataManager } from "@normalized:N&&&entry/src/main/ets/common/DrawDataManager&";
import photoAccessHelper from "@ohos:file.photoAccessHelper";
import image from "@ohos:multimedia.image";
// 画笔工具枚举
enum DrawTool {
    PEN = // 画笔
     0,
    ERASER = 1 // 橡皮擦
}
// 笔触粗细枚举
enum StrokeWidth {
    THIN = 2,
    MEDIUM = 5,
    THICK = 10 // 粗
}
// 预设颜色
const PRESET_COLORS: string[] = ['#000000', '#FF0000', '#0000FF', '#00AA00', '#FF8800', '#8800CC'];
export class DrawBoard extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__provinceId = new SynchedPropertySimpleOneWayPU(params.provinceId, this, "provinceId");
        this.onClose = () => { };
        this.drawDataManager = DrawDataManager.getInstance();
        this.settings = new RenderingContextSettings(true);
        this.context = new CanvasRenderingContext2D(this.settings);
        this.__currentTool = new ObservedPropertySimplePU(DrawTool.PEN, this, "currentTool");
        this.__currentColor = new ObservedPropertySimplePU('#000000', this, "currentColor");
        this.__currentStrokeWidth = new ObservedPropertySimplePU(StrokeWidth.MEDIUM, this, "currentStrokeWidth");
        this.__isDrawing = new ObservedPropertySimplePU(false, this, "isDrawing");
        this.__showClearConfirm = new ObservedPropertySimplePU(false, this, "showClearConfirm");
        this.lastX = 0;
        this.lastY = 0;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.dataLoaded = false;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DrawBoard_Params) {
        if (params.provinceId === undefined) {
            this.__provinceId.set('');
        }
        if (params.onClose !== undefined) {
            this.onClose = params.onClose;
        }
        if (params.drawDataManager !== undefined) {
            this.drawDataManager = params.drawDataManager;
        }
        if (params.settings !== undefined) {
            this.settings = params.settings;
        }
        if (params.context !== undefined) {
            this.context = params.context;
        }
        if (params.currentTool !== undefined) {
            this.currentTool = params.currentTool;
        }
        if (params.currentColor !== undefined) {
            this.currentColor = params.currentColor;
        }
        if (params.currentStrokeWidth !== undefined) {
            this.currentStrokeWidth = params.currentStrokeWidth;
        }
        if (params.isDrawing !== undefined) {
            this.isDrawing = params.isDrawing;
        }
        if (params.showClearConfirm !== undefined) {
            this.showClearConfirm = params.showClearConfirm;
        }
        if (params.lastX !== undefined) {
            this.lastX = params.lastX;
        }
        if (params.lastY !== undefined) {
            this.lastY = params.lastY;
        }
        if (params.canvasWidth !== undefined) {
            this.canvasWidth = params.canvasWidth;
        }
        if (params.canvasHeight !== undefined) {
            this.canvasHeight = params.canvasHeight;
        }
        if (params.dataLoaded !== undefined) {
            this.dataLoaded = params.dataLoaded;
        }
    }
    updateStateVars(params: DrawBoard_Params) {
        this.__provinceId.reset(params.provinceId);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__provinceId.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTool.purgeDependencyOnElmtId(rmElmtId);
        this.__currentColor.purgeDependencyOnElmtId(rmElmtId);
        this.__currentStrokeWidth.purgeDependencyOnElmtId(rmElmtId);
        this.__isDrawing.purgeDependencyOnElmtId(rmElmtId);
        this.__showClearConfirm.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__provinceId.aboutToBeDeleted();
        this.__currentTool.aboutToBeDeleted();
        this.__currentColor.aboutToBeDeleted();
        this.__currentStrokeWidth.aboutToBeDeleted();
        this.__isDrawing.aboutToBeDeleted();
        this.__showClearConfirm.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    // 省份 ID，用于绑定画板数据
    private __provinceId: SynchedPropertySimpleOneWayPU<string>;
    get provinceId() {
        return this.__provinceId.get();
    }
    set provinceId(newValue: string) {
        this.__provinceId.set(newValue);
    }
    // 关闭回调
    private onClose: () => void;
    // 画板数据管理器
    private drawDataManager: DrawDataManager;
    // Canvas 上下文
    private settings: RenderingContextSettings;
    private context: CanvasRenderingContext2D;
    // 绘制状态
    private __currentTool: ObservedPropertySimplePU<DrawTool>;
    get currentTool() {
        return this.__currentTool.get();
    }
    set currentTool(newValue: DrawTool) {
        this.__currentTool.set(newValue);
    }
    private __currentColor: ObservedPropertySimplePU<string>;
    get currentColor() {
        return this.__currentColor.get();
    }
    set currentColor(newValue: string) {
        this.__currentColor.set(newValue);
    }
    private __currentStrokeWidth: ObservedPropertySimplePU<StrokeWidth>;
    get currentStrokeWidth() {
        return this.__currentStrokeWidth.get();
    }
    set currentStrokeWidth(newValue: StrokeWidth) {
        this.__currentStrokeWidth.set(newValue);
    }
    private __isDrawing: ObservedPropertySimplePU<boolean>;
    get isDrawing() {
        return this.__isDrawing.get();
    }
    set isDrawing(newValue: boolean) {
        this.__isDrawing.set(newValue);
    }
    // 清空确认
    private __showClearConfirm: ObservedPropertySimplePU<boolean>;
    get showClearConfirm() {
        return this.__showClearConfirm.get();
    }
    set showClearConfirm(newValue: boolean) {
        this.__showClearConfirm.set(newValue);
    }
    // 上一个触摸点坐标
    private lastX: number;
    private lastY: number;
    // Canvas 尺寸
    private canvasWidth: number;
    private canvasHeight: number;
    // 是否已加载保存的数据
    private dataLoaded: boolean;
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
            }
            catch (error) {
                console.error(`[DrawBoard] loadSavedData failed: ${JSON.stringify(error)}`);
            }
        }
        else {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error(`[DrawBoard] saveDrawData failed: ${JSON.stringify(error)}`);
        }
    }
    // ==================== 构建界面 ====================
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#FFFFFF');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部标题栏 + 关闭按钮
            Row.create();
            // 顶部标题栏 + 关闭按钮
            Row.width('100%');
            // 顶部标题栏 + 关闭按钮
            Row.height(48);
            // 顶部标题栏 + 关闭按钮
            Row.alignItems(VerticalAlign.Center);
            // 顶部标题栏 + 关闭按钮
            Row.backgroundColor('#FAFAFA');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('画板');
            Text.fontSize('18fp');
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.layoutWeight(1);
            Text.margin({ left: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('关闭');
            Button.fontSize('14fp');
            Button.fontColor('#FF6B6B');
            Button.backgroundColor('#FFF0F0');
            Button.borderRadius(16);
            Button.height(32);
            Button.padding({ left: 16, right: 16 });
            Button.margin({ right: 16 });
            Button.onClick(() => {
                this.onClose();
            });
        }, Button);
        Button.pop();
        // 顶部标题栏 + 关闭按钮
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Canvas 绘制区域 - 使用 priorityGesture(PanGesture) 拦截所有方向手势，防止 bindSheet 拖拽
            Canvas.create(this.context);
            // Canvas 绘制区域 - 使用 priorityGesture(PanGesture) 拦截所有方向手势，防止 bindSheet 拖拽
            Canvas.width('100%');
            // Canvas 绘制区域 - 使用 priorityGesture(PanGesture) 拦截所有方向手势，防止 bindSheet 拖拽
            Canvas.layoutWeight(1);
            // Canvas 绘制区域 - 使用 priorityGesture(PanGesture) 拦截所有方向手势，防止 bindSheet 拖拽
            Canvas.backgroundColor('#FFFFFF');
            // Canvas 绘制区域 - 使用 priorityGesture(PanGesture) 拦截所有方向手势，防止 bindSheet 拖拽
            Canvas.onReady(() => {
                this.canvasWidth = this.context.width;
                this.canvasHeight = this.context.height;
            });
            // Canvas 绘制区域 - 使用 priorityGesture(PanGesture) 拦截所有方向手势，防止 bindSheet 拖拽
            Canvas.onAreaChange((oldValue: Area, newValue: Area) => {
                const newWidth = newValue.width as number;
                const newHeight = newValue.height as number;
                if (newWidth > 0 && newHeight > 0) {
                    this.canvasWidth = newWidth;
                    this.canvasHeight = newHeight;
                }
            });
            Gesture.create(GesturePriority.High);
            PanGesture.create({ direction: PanDirection.All, distance: 1 });
            PanGesture.onActionStart((event: GestureEvent) => {
                this.isDrawing = true;
                this.lastX = event.fingerList[0].localX;
                this.lastY = event.fingerList[0].localY;
                this.context.beginPath();
                this.context.moveTo(this.lastX, this.lastY);
            });
            PanGesture.onActionUpdate((event: GestureEvent) => {
                const x = event.fingerList[0].localX;
                const y = event.fingerList[0].localY;
                if (!this.isDrawing) {
                    return;
                }
                if (this.currentTool === DrawTool.ERASER) {
                    this.context.globalCompositeOperation = 'destination-out';
                    this.context.strokeStyle = 'rgba(0,0,0,1)';
                    this.context.lineWidth = this.currentStrokeWidth * 3;
                }
                else {
                    this.context.globalCompositeOperation = 'source-over';
                    this.context.strokeStyle = this.currentColor;
                    this.context.lineWidth = this.currentStrokeWidth;
                }
                this.context.lineCap = 'round';
                this.context.lineJoin = 'round';
                const midX = (this.lastX + x) / 2;
                const midY = (this.lastY + y) / 2;
                this.context.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
                this.context.stroke();
                this.lastX = x;
                this.lastY = y;
            });
            PanGesture.onActionEnd((event: GestureEvent) => {
                if (this.isDrawing) {
                    this.context.lineTo(this.lastX, this.lastY);
                    this.context.stroke();
                    this.context.closePath();
                    this.isDrawing = false;
                    this.context.globalCompositeOperation = 'source-over';
                }
            });
            PanGesture.pop();
            Gesture.pop();
        }, Canvas);
        // Canvas 绘制区域 - 使用 priorityGesture(PanGesture) 拦截所有方向手势，防止 bindSheet 拖拽
        Canvas.pop();
        // 工具栏
        this.ToolBar.bind(this)();
        Column.pop();
    }
    /** 底部工具栏 - 一多适配：layoutWeight 自适应宽度 */
    ToolBar(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 分隔线
            Divider.create();
            // 分隔线
            Divider.color('#E0E0E0');
            // 分隔线
            Divider.width('100%');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 第一行：工具按钮 + 笔触粗细
            Row.create();
            // 第一行：工具按钮 + 笔触粗细
            Row.width('100%');
            // 第一行：工具按钮 + 笔触粗细
            Row.height(56);
            // 第一行：工具按钮 + 笔触粗细
            Row.justifyContent(FlexAlign.SpaceEvenly);
            // 第一行：工具按钮 + 笔触粗细
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 画笔按钮
            Column.create();
            // 画笔按钮
            Column.layoutWeight(1);
            // 画笔按钮
            Column.justifyContent(FlexAlign.Center);
            // 画笔按钮
            Column.onClick(() => this.switchTool(DrawTool.PEN));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('\u270F');
            Text.fontSize('18fp');
            Text.fontColor(this.currentTool === DrawTool.PEN ? '#FF6B6B' : '#666666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('画笔');
            Text.fontSize('10fp');
            Text.fontColor(this.currentTool === DrawTool.PEN ? '#FF6B6B' : '#999999');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        // 画笔按钮
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 橡皮擦
            Column.create();
            // 橡皮擦
            Column.layoutWeight(1);
            // 橡皮擦
            Column.justifyContent(FlexAlign.Center);
            // 橡皮擦
            Column.onClick(() => this.switchTool(DrawTool.ERASER));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('\u{1F9F9}');
            Text.fontSize('18fp');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('橡皮');
            Text.fontSize('10fp');
            Text.fontColor(this.currentTool === DrawTool.ERASER ? '#FF6B6B' : '#999999');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        // 橡皮擦
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 笔触粗细选择
            Row.create();
            // 笔触粗细选择
            Row.layoutWeight(1);
            // 笔触粗细选择
            Row.justifyContent(FlexAlign.Center);
            // 笔触粗细选择
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 细
            Column.create();
            // 细
            Column.width(28);
            // 细
            Column.height(28);
            // 细
            Column.justifyContent(FlexAlign.Center);
            // 细
            Column.borderRadius(4);
            // 细
            Column.backgroundColor(this.currentStrokeWidth === StrokeWidth.THIN ? '#FFF0F0' : Color.Transparent);
            // 细
            Column.onClick(() => this.switchStrokeWidth(StrokeWidth.THIN));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Circle.create();
            Circle.width(6);
            Circle.height(6);
            Circle.fill(this.currentStrokeWidth === StrokeWidth.THIN ? '#FF6B6B' : '#666666');
        }, Circle);
        // 细
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 中
            Column.create();
            // 中
            Column.width(28);
            // 中
            Column.height(28);
            // 中
            Column.justifyContent(FlexAlign.Center);
            // 中
            Column.borderRadius(4);
            // 中
            Column.backgroundColor(this.currentStrokeWidth === StrokeWidth.MEDIUM ? '#FFF0F0' : Color.Transparent);
            // 中
            Column.onClick(() => this.switchStrokeWidth(StrokeWidth.MEDIUM));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Circle.create();
            Circle.width(10);
            Circle.height(10);
            Circle.fill(this.currentStrokeWidth === StrokeWidth.MEDIUM ? '#FF6B6B' : '#666666');
        }, Circle);
        // 中
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 粗
            Column.create();
            // 粗
            Column.width(28);
            // 粗
            Column.height(28);
            // 粗
            Column.justifyContent(FlexAlign.Center);
            // 粗
            Column.borderRadius(4);
            // 粗
            Column.backgroundColor(this.currentStrokeWidth === StrokeWidth.THICK ? '#FFF0F0' : Color.Transparent);
            // 粗
            Column.onClick(() => this.switchStrokeWidth(StrokeWidth.THICK));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Circle.create();
            Circle.width(14);
            Circle.height(14);
            Circle.fill(this.currentStrokeWidth === StrokeWidth.THICK ? '#FF6B6B' : '#666666');
        }, Circle);
        // 粗
        Column.pop();
        // 笔触粗细选择
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 清空
            Column.create();
            // 清空
            Column.layoutWeight(1);
            // 清空
            Column.justifyContent(FlexAlign.Center);
            // 清空
            Column.onClick(() => this.clearCanvas());
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('\u{1F5D1}');
            Text.fontSize('18fp');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('清空');
            Text.fontSize('10fp');
            Text.fontColor('#999999');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        // 清空
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 添加照片
            Column.create();
            // 添加照片
            Column.layoutWeight(1);
            // 添加照片
            Column.justifyContent(FlexAlign.Center);
            // 添加照片
            Column.onClick(() => this.addPhoto());
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('\u{1F5BC}');
            Text.fontSize('18fp');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('照片');
            Text.fontSize('10fp');
            Text.fontColor('#999999');
            Text.margin({ top: 2 });
        }, Text);
        Text.pop();
        // 添加照片
        Column.pop();
        // 第一行：工具按钮 + 笔触粗细
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 第二行：颜色选择
            Row.create();
            // 第二行：颜色选择
            Row.width('100%');
            // 第二行：颜色选择
            Row.justifyContent(FlexAlign.Center);
            // 第二行：颜色选择
            Row.alignItems(VerticalAlign.Center);
            // 第二行：颜色选择
            Row.padding({ top: 4, bottom: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const color = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Circle.create();
                    Circle.width(20);
                    Circle.height(20);
                    Circle.fill(color);
                    Circle.stroke(this.currentColor === color && this.currentTool === DrawTool.PEN ? '#FF6B6B' : '#E0E0E0');
                    Circle.strokeWidth(this.currentColor === color && this.currentTool === DrawTool.PEN ? 2.5 : 1);
                    Circle.margin({ left: 6, right: 6 });
                    Circle.onClick(() => this.switchColor(color));
                }, Circle);
            };
            this.forEachUpdateFunction(elmtId, PRESET_COLORS, forEachItemGenFunction, (color: string) => color, false, false);
        }, ForEach);
        ForEach.pop();
        // 第二行：颜色选择
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 清空确认弹窗
            if (this.showClearConfirm) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.ClearConfirmDialog.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
    }
    /** 清空确认对话框 */
    ClearConfirmDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.backgroundColor('#80000000');
            Column.position({ x: 0, y: 0 });
            Column.zIndex(999);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('72%');
            Column.padding(24);
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('确认清空');
            Text.fontSize('18fp');
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('清空后画布内容将无法恢复，是否确认？');
            Text.fontSize('14fp');
            Text.fontColor('#666666');
            Text.margin({ bottom: 24 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.fontSize('14fp');
            Button.fontColor('#666666');
            Button.backgroundColor('#F0F0F0');
            Button.borderRadius(8);
            Button.layoutWeight(1);
            Button.onClick(() => {
                this.showClearConfirm = false;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('清空');
            Button.fontSize('14fp');
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#FF6B6B');
            Button.borderRadius(8);
            Button.layoutWeight(1);
            Button.margin({ left: 12 });
            Button.onClick(() => this.confirmClear());
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
