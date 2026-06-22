if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    provinceModel?: ProvinceModel;
    continuationHelper?: ContinuationHelper;
    badgeManager?: BadgeManager;
    settings?: RenderingContextSettings;
    context2d?: CanvasRenderingContext2D;
    displayWidth?: number;
    displayHeight?: number;
    provinces?: Province[];
    toastMsg?: string;
    showToast?: boolean;
    showActionDialog?: boolean;
    actionProvinceId?: string;
    actionProvinceName?: string;
    badgePopupData?: BadgePopupData | null;
    pendingBadgePopups?: BadgePopupData[];
    swiperDisableSwipe?: boolean;
    isDragging?: boolean;
    draggingProvinceId?: string;
    dragStartX?: number;
    dragStartY?: number;
    dragOrigCx?: number;
    dragOrigCy?: number;
    dragMoved?: boolean;
    longPressTimer?: number;
}
import type common from "@ohos:app.ability.common";
import router from "@ohos:router";
import { ProvinceModel, BASE_WIDTH, BASE_HEIGHT } from "@normalized:N&&&entry/src/main/ets/model/DataModel&";
import type { Province } from "@normalized:N&&&entry/src/main/ets/model/DataModel&";
import { pointInEllipse } from "@normalized:N&&&entry/src/main/ets/common/PointInPolygon&";
import { ContinuationHelper } from "@normalized:N&&&entry/src/main/ets/common/ContinuationHelper&";
import { BadgeManager } from "@normalized:N&&&entry/src/main/ets/common/BadgeManager&";
import type { BadgePopupData } from "@normalized:N&&&entry/src/main/ets/common/BadgeManager&";
import { Badges } from "@normalized:N&&&entry/src/main/ets/pages/Badges&";
// ==================== 颜色常量 ====================
const COLOR_BG = '#FFF9F0'; // 画布背景色
const COLOR_LIGHTED = '#F5A623'; // 打卡后的填充色（金色）
const COLOR_STROKE = '#555555'; // 省份描边色
const COLOR_DRAG_STROKE = '#000000'; // 拖动时的描边色（黑色）
const COLOR_TEXT = '#333333'; // 省份名称文字色（未点亮）
const COLOR_TEXT_LIGHTED = '#FFFFFF'; // 省份名称文字色（已点亮）
const COLOR_CHECK = '#FFFFFF'; // 打勾图标色
/** 椭圆布局参数 */
interface EllipseLayout {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
}
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.provinceModel = ProvinceModel.getInstance();
        this.continuationHelper = ContinuationHelper.getInstance();
        this.badgeManager = BadgeManager.getInstance();
        this.settings = new RenderingContextSettings(true);
        this.context2d = new CanvasRenderingContext2D(this.settings);
        this.__displayWidth = new ObservedPropertySimplePU(0, this, "displayWidth");
        this.__displayHeight = new ObservedPropertySimplePU(0, this, "displayHeight");
        this.__provinces = new ObservedPropertyObjectPU([], this, "provinces");
        this.__toastMsg = new ObservedPropertySimplePU('', this, "toastMsg");
        this.__showToast = new ObservedPropertySimplePU(false, this, "showToast");
        this.__showActionDialog = new ObservedPropertySimplePU(false, this, "showActionDialog");
        this.__actionProvinceId = new ObservedPropertySimplePU('', this, "actionProvinceId");
        this.__actionProvinceName = new ObservedPropertySimplePU('', this, "actionProvinceName");
        this.__badgePopupData = new ObservedPropertyObjectPU(null, this, "badgePopupData");
        this.__pendingBadgePopups = new ObservedPropertyObjectPU([], this, "pendingBadgePopups");
        this.__swiperDisableSwipe = new ObservedPropertySimplePU(false, this, "swiperDisableSwipe");
        this.isDragging = false;
        this.draggingProvinceId = '';
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOrigCx = 0;
        this.dragOrigCy = 0;
        this.dragMoved = false;
        this.longPressTimer = -1;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.provinceModel !== undefined) {
            this.provinceModel = params.provinceModel;
        }
        if (params.continuationHelper !== undefined) {
            this.continuationHelper = params.continuationHelper;
        }
        if (params.badgeManager !== undefined) {
            this.badgeManager = params.badgeManager;
        }
        if (params.settings !== undefined) {
            this.settings = params.settings;
        }
        if (params.context2d !== undefined) {
            this.context2d = params.context2d;
        }
        if (params.displayWidth !== undefined) {
            this.displayWidth = params.displayWidth;
        }
        if (params.displayHeight !== undefined) {
            this.displayHeight = params.displayHeight;
        }
        if (params.provinces !== undefined) {
            this.provinces = params.provinces;
        }
        if (params.toastMsg !== undefined) {
            this.toastMsg = params.toastMsg;
        }
        if (params.showToast !== undefined) {
            this.showToast = params.showToast;
        }
        if (params.showActionDialog !== undefined) {
            this.showActionDialog = params.showActionDialog;
        }
        if (params.actionProvinceId !== undefined) {
            this.actionProvinceId = params.actionProvinceId;
        }
        if (params.actionProvinceName !== undefined) {
            this.actionProvinceName = params.actionProvinceName;
        }
        if (params.badgePopupData !== undefined) {
            this.badgePopupData = params.badgePopupData;
        }
        if (params.pendingBadgePopups !== undefined) {
            this.pendingBadgePopups = params.pendingBadgePopups;
        }
        if (params.swiperDisableSwipe !== undefined) {
            this.swiperDisableSwipe = params.swiperDisableSwipe;
        }
        if (params.isDragging !== undefined) {
            this.isDragging = params.isDragging;
        }
        if (params.draggingProvinceId !== undefined) {
            this.draggingProvinceId = params.draggingProvinceId;
        }
        if (params.dragStartX !== undefined) {
            this.dragStartX = params.dragStartX;
        }
        if (params.dragStartY !== undefined) {
            this.dragStartY = params.dragStartY;
        }
        if (params.dragOrigCx !== undefined) {
            this.dragOrigCx = params.dragOrigCx;
        }
        if (params.dragOrigCy !== undefined) {
            this.dragOrigCy = params.dragOrigCy;
        }
        if (params.dragMoved !== undefined) {
            this.dragMoved = params.dragMoved;
        }
        if (params.longPressTimer !== undefined) {
            this.longPressTimer = params.longPressTimer;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__displayWidth.purgeDependencyOnElmtId(rmElmtId);
        this.__displayHeight.purgeDependencyOnElmtId(rmElmtId);
        this.__provinces.purgeDependencyOnElmtId(rmElmtId);
        this.__toastMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__showToast.purgeDependencyOnElmtId(rmElmtId);
        this.__showActionDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__actionProvinceId.purgeDependencyOnElmtId(rmElmtId);
        this.__actionProvinceName.purgeDependencyOnElmtId(rmElmtId);
        this.__badgePopupData.purgeDependencyOnElmtId(rmElmtId);
        this.__pendingBadgePopups.purgeDependencyOnElmtId(rmElmtId);
        this.__swiperDisableSwipe.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__displayWidth.aboutToBeDeleted();
        this.__displayHeight.aboutToBeDeleted();
        this.__provinces.aboutToBeDeleted();
        this.__toastMsg.aboutToBeDeleted();
        this.__showToast.aboutToBeDeleted();
        this.__showActionDialog.aboutToBeDeleted();
        this.__actionProvinceId.aboutToBeDeleted();
        this.__actionProvinceName.aboutToBeDeleted();
        this.__badgePopupData.aboutToBeDeleted();
        this.__pendingBadgePopups.aboutToBeDeleted();
        this.__swiperDisableSwipe.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private provinceModel: ProvinceModel;
    private continuationHelper: ContinuationHelper;
    private badgeManager: BadgeManager;
    private settings: RenderingContextSettings;
    private context2d: CanvasRenderingContext2D;
    // Canvas 实际显示宽度（由 onAreaChange 动态获取）
    private __displayWidth: ObservedPropertySimplePU<number>;
    get displayWidth() {
        return this.__displayWidth.get();
    }
    set displayWidth(newValue: number) {
        this.__displayWidth.set(newValue);
    }
    // Canvas 实际显示高度（由 onAreaChange 动态获取）
    private __displayHeight: ObservedPropertySimplePU<number>;
    get displayHeight() {
        return this.__displayHeight.get();
    }
    set displayHeight(newValue: number) {
        this.__displayHeight.set(newValue);
    }
    // 省份数据（响应式）
    private __provinces: ObservedPropertyObjectPU<Province[]>;
    get provinces() {
        return this.__provinces.get();
    }
    set provinces(newValue: Province[]) {
        this.__provinces.set(newValue);
    }
    // Toast 提示
    private __toastMsg: ObservedPropertySimplePU<string>;
    get toastMsg() {
        return this.__toastMsg.get();
    }
    set toastMsg(newValue: string) {
        this.__toastMsg.set(newValue);
    }
    private __showToast: ObservedPropertySimplePU<boolean>;
    get showToast() {
        return this.__showToast.get();
    }
    set showToast(newValue: boolean) {
        this.__showToast.set(newValue);
    }
    // 操作对话框
    private __showActionDialog: ObservedPropertySimplePU<boolean>;
    get showActionDialog() {
        return this.__showActionDialog.get();
    }
    set showActionDialog(newValue: boolean) {
        this.__showActionDialog.set(newValue);
    }
    private __actionProvinceId: ObservedPropertySimplePU<string>;
    get actionProvinceId() {
        return this.__actionProvinceId.get();
    }
    set actionProvinceId(newValue: string) {
        this.__actionProvinceId.set(newValue);
    }
    private __actionProvinceName: ObservedPropertySimplePU<string>;
    get actionProvinceName() {
        return this.__actionProvinceName.get();
    }
    set actionProvinceName(newValue: string) {
        this.__actionProvinceName.set(newValue);
    }
    // 奖牌解锁弹窗
    private __badgePopupData: ObservedPropertyObjectPU<BadgePopupData | null>;
    get badgePopupData() {
        return this.__badgePopupData.get();
    }
    set badgePopupData(newValue: BadgePopupData | null) {
        this.__badgePopupData.set(newValue);
    }
    private __pendingBadgePopups: ObservedPropertyObjectPU<BadgePopupData[]>;
    get pendingBadgePopups() {
        return this.__pendingBadgePopups.get();
    }
    set pendingBadgePopups(newValue: BadgePopupData[]) {
        this.__pendingBadgePopups.set(newValue);
    }
    // 拖动时禁用 Swiper 滑动，避免冲突
    private __swiperDisableSwipe: ObservedPropertySimplePU<boolean>;
    get swiperDisableSwipe() {
        return this.__swiperDisableSwipe.get();
    }
    set swiperDisableSwipe(newValue: boolean) {
        this.__swiperDisableSwipe.set(newValue);
    }
    // 拖动状态
    private isDragging: boolean;
    private draggingProvinceId: string;
    private dragStartX: number;
    private dragStartY: number;
    private dragOrigCx: number;
    private dragOrigCy: number;
    private dragMoved: boolean;
    private longPressTimer: number;
    // ==================== 生命周期 ====================
    async aboutToAppear(): Promise<void> {
        const context = getContext(this) as common.UIAbilityContext;
        await this.provinceModel.init(context);
        await this.badgeManager.init(context);
        this.refreshProvinces();
        // 更新自由流转回调（首页不追踪具体省份）
        this.continuationHelper.updateCallbacks(() => {
            return { provinceId: '', timestamp: Date.now() };
        }, (data) => {
            if (data.provinceId) {
                AppStorage.setOrCreate<string>('continuation_province_id', data.provinceId);
                // 流转恢复后自动跳转到省份详情页
                router.pushUrl({
                    url: 'pages/ProvinceDetail',
                    params: { provinceId: data.provinceId }
                });
            }
        });
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
    // ==================== 奖牌解锁检测 ====================
    /**
     * 检测奖牌解锁并弹出通知
     * 在点亮省份后调用
     */
    async checkAndShowBadgeUnlock(): Promise<void> {
        const lightedIds = this.provinceModel.getProvinces()
            .filter(p => p.isLighted)
            .map(p => p.id);
        const newlyUnlockedIds = await this.badgeManager.checkAllBadges(lightedIds);
        if (newlyUnlockedIds.length === 0) {
            return;
        }
        // 构建弹窗数据队列
        const popups: BadgePopupData[] = [];
        for (const badgeId of newlyUnlockedIds) {
            const badge = this.badgeManager.getBadgeById(badgeId);
            if (badge) {
                const provinceNames = badge.requiredProvinceIds.map(pid => {
                    const province = this.provinceModel.getProvinceById(pid);
                    return province ? province.name : pid;
                });
                popups.push({ badge, provinceNames });
            }
        }
        // 依次显示弹窗
        this.pendingBadgePopups = popups;
        this.showNextBadgePopup();
    }
    /** 显示下一个奖牌弹窗 */
    showNextBadgePopup(): void {
        if (this.pendingBadgePopups.length === 0) {
            return;
        }
        this.badgePopupData = this.pendingBadgePopups.shift()!;
    }
    /** 关闭奖牌弹窗并显示下一个 */
    onBadgePopupClose(): void {
        this.badgePopupData = null;
        // 延迟显示下一个，避免动画冲突
        setTimeout(() => {
            this.showNextBadgePopup();
        }, 300);
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
        }
        else {
            ctx.fillStyle = province.color;
        }
        ctx.fill();
        // 描边
        if (this.isDragging && this.draggingProvinceId === province.id) {
            ctx.strokeStyle = COLOR_DRAG_STROKE;
            ctx.lineWidth = 3;
        }
        else {
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
            this.swiperDisableSwipe = true;
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
            this.swiperDisableSwipe = true;
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
        }
        else if (!this.dragMoved && this.draggingProvinceId) {
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
        this.swiperDisableSwipe = false;
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
        }
        else {
            // 未点亮 → 点亮该省份
            await this.provinceModel.lightProvince(province.id);
            this.refreshProvinces();
            this.showToastMsg(`已点亮 ${province.name}！`);
            // 检测奖牌解锁
            await this.checkAndShowBadgeUnlock();
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        // 顶部标题栏
        this.TitleBar.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Swiper 区域：地图 + 奖牌
            Swiper.create();
            // Swiper 区域：地图 + 奖牌
            Swiper.layoutWeight(1);
            // Swiper 区域：地图 + 奖牌
            Swiper.indicator(true);
            // Swiper 区域：地图 + 奖牌
            Swiper.indicatorStyle({
                selectedColor: '#F5A623',
                color: '#CCCCCC',
                size: 8
            });
            // Swiper 区域：地图 + 奖牌
            Swiper.loop(false);
            // Swiper 区域：地图 + 奖牌
            Swiper.disableSwipe(this.swiperDisableSwipe);
            // Swiper 区域：地图 + 奖牌
            Swiper.duration(300);
            // Swiper 区域：地图 + 奖牌
            Swiper.curve(Curve.EaseInOut);
        }, Swiper);
        // 第一页：地图
        this.MapPage.bind(this)();
        // 第二页：奖牌
        this.BadgePage.bind(this)();
        // Swiper 区域：地图 + 奖牌
        Swiper.pop();
        // 底部统计信息
        this.StatsBar.bind(this)();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Toast 提示
            if (this.showToast) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.ToastView.bind(this)();
                });
            }
            // 操作对话框
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 操作对话框
            if (this.showActionDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.ActionDialogView.bind(this)();
                });
            }
            // 奖牌解锁弹窗
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 奖牌解锁弹窗
            if (this.badgePopupData !== null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.BadgeUnlockPopup.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    // ==================== 子组件 ====================
    /** 顶部标题栏 */
    TitleBar(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(56);
            Row.backgroundColor('#FFFFFF');
            Row.shadow({ radius: 2, color: '#1A000000', offsetY: 1 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('TravelJournal');
            Text.fontSize('22fp');
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ left: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 自由流转按钮
            Text.create('\u21C4');
            // 自由流转按钮
            Text.fontSize('20fp');
            // 自由流转按钮
            Text.fontColor('#666666');
            // 自由流转按钮
            Text.margin({ right: 12 });
            // 自由流转按钮
            Text.onClick(() => {
                this.continuationHelper.startContinuation();
            });
        }, Text);
        // 自由流转按钮
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('左滑查看成就');
            Text.fontSize('13fp');
            Text.fontColor('#999999');
            Text.margin({ right: 16 });
        }, Text);
        Text.pop();
        Row.pop();
    }
    /** 地图页面（Swiper 第一页） */
    MapPage(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Canvas.create(this.context2d);
            Canvas.width('100%');
            Canvas.height('100%');
            Canvas.backgroundColor(COLOR_BG);
            Canvas.onReady(() => {
                this.drawMap();
            });
            Canvas.onTouch((event: TouchEvent) => {
                if (event.type === TouchType.Down) {
                    this.onTouchDown(event.touches[0].x, event.touches[0].y);
                }
                else if (event.type === TouchType.Move) {
                    this.onTouchMove(event.touches[0].x, event.touches[0].y);
                }
                else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
                    this.onTouchUp();
                }
            });
            Canvas.onAreaChange((oldValue: Area, newValue: Area) => {
                // 监听容器尺寸变化，实现多端自适应
                const newWidth = newValue.width as number;
                const newHeight = newValue.height as number;
                if (newWidth > 0 && newHeight > 0) {
                    this.displayWidth = newWidth;
                    this.displayHeight = newHeight;
                    this.drawMap();
                }
            });
        }, Canvas);
        Canvas.pop();
    }
    /** 奖牌页面（Swiper 第二页） */
    BadgePage(parent = null) {
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Badges(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 582, col: 5 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {};
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "Badges" });
        }
    }
    /** 底部统计栏 */
    StatsBar(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(48);
            Row.justifyContent(FlexAlign.Center);
            Row.backgroundColor('#FFFFFF');
            Row.shadow({ radius: 2, color: '#1A000000', offsetY: -1 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`已点亮 ${this.provinces.filter(p => p.isLighted).length} / ${this.provinces.length} 个省级行政区`);
            Text.fontSize('14fp');
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        Row.pop();
    }
    /** Toast 提示 */
    ToastView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.justifyContent(FlexAlign.Center);
            Column.position({ x: 0, y: '50%' });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.toastMsg);
            Text.fontSize('14fp');
            Text.fontColor('#FFFFFF');
            Text.padding({ left: 20, right: 20, top: 10, bottom: 10 });
            Text.backgroundColor('#CC333333');
            Text.borderRadius(20);
        }, Text);
        Text.pop();
        Column.pop();
    }
    /** 操作对话框（取消打卡 / 查看手账） */
    ActionDialogView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
            Column.backgroundColor('#66000000');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('55%');
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(16);
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.actionProvinceName);
            Text.fontSize('18fp');
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ top: 24, bottom: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 查看手账按钮
            Button.createWithLabel('查看手账');
            // 查看手账按钮
            Button.width('80%');
            // 查看手账按钮
            Button.height(44);
            // 查看手账按钮
            Button.fontSize('16fp');
            // 查看手账按钮
            Button.fontColor('#FFFFFF');
            // 查看手账按钮
            Button.backgroundColor('#F5A623');
            // 查看手账按钮
            Button.borderRadius(8);
            // 查看手账按钮
            Button.onClick(() => {
                this.showActionDialog = false;
                router.pushUrl({
                    url: 'pages/ProvinceDetail',
                    params: { provinceId: this.actionProvinceId }
                });
            });
        }, Button);
        // 查看手账按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 取消打卡按钮
            Button.createWithLabel('取消打卡');
            // 取消打卡按钮
            Button.width('80%');
            // 取消打卡按钮
            Button.height(44);
            // 取消打卡按钮
            Button.fontSize('16fp');
            // 取消打卡按钮
            Button.fontColor('#E74C3C');
            // 取消打卡按钮
            Button.backgroundColor('#FFFFFF');
            // 取消打卡按钮
            Button.borderRadius(8);
            // 取消打卡按钮
            Button.border({ width: 1, color: '#E74C3C' });
            // 取消打卡按钮
            Button.margin({ top: 12, bottom: 24 });
            // 取消打卡按钮
            Button.onClick(async () => {
                this.showActionDialog = false;
                await this.provinceModel.unlightProvince(this.actionProvinceId);
                this.refreshProvinces();
                this.showToastMsg(`已取消 ${this.actionProvinceName} 的打卡`);
            });
        }, Button);
        // 取消打卡按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 关闭按钮
            Text.create('关闭');
            // 关闭按钮
            Text.fontSize('14fp');
            // 关闭按钮
            Text.fontColor('#999999');
            // 关闭按钮
            Text.margin({ bottom: 16 });
            // 关闭按钮
            Text.onClick(() => {
                this.showActionDialog = false;
            });
        }, Text);
        // 关闭按钮
        Text.pop();
        Column.pop();
        Column.pop();
    }
    /** 奖牌解锁弹窗 */
    BadgeUnlockPopup(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
            Column.backgroundColor('rgba(0,0,0,0.5)');
            Column.onClick(() => {
                this.onBadgePopupClose();
            });
            Column.onAppear(() => {
                setTimeout(() => {
                    if (this.badgePopupData !== null) {
                        this.onBadgePopupClose();
                    }
                }, 3000);
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('70%');
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(20);
            Column.alignItems(HorizontalAlign.Center);
            Column.shadow({ radius: 20, color: '#33000000', offsetY: 4 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 大号 Emoji
            Text.create(this.badgePopupData?.badge.emoji ?? '');
            // 大号 Emoji
            Text.fontSize('80fp');
            // 大号 Emoji
            Text.margin({ top: 32, bottom: 16 });
        }, Text);
        // 大号 Emoji
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 奖牌名称
            Text.create(this.badgePopupData?.badge.name ?? '');
            // 奖牌名称
            Text.fontSize('24fp');
            // 奖牌名称
            Text.fontWeight(FontWeight.Bold);
            // 奖牌名称
            Text.fontColor('#333333');
            // 奖牌名称
            Text.margin({ bottom: 8 });
        }, Text);
        // 奖牌名称
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 解锁提示
            Text.create('奖牌解锁！');
            // 解锁提示
            Text.fontSize('16fp');
            // 解锁提示
            Text.fontColor('#F5A623');
            // 解锁提示
            Text.fontWeight(FontWeight.Bold);
            // 解锁提示
            Text.margin({ bottom: 12 });
        }, Text);
        // 解锁提示
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 所需省份列表
            Text.create(this.badgePopupData?.provinceNames.join('、') ?? '');
            // 所需省份列表
            Text.fontSize('13fp');
            // 所需省份列表
            Text.fontColor('#666666');
            // 所需省份列表
            Text.maxLines(3);
            // 所需省份列表
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
            // 所需省份列表
            Text.textAlign(TextAlign.Center);
            // 所需省份列表
            Text.padding({ left: 24, right: 24 });
            // 所需省份列表
            Text.margin({ bottom: 24 });
        }, Text);
        // 所需省份列表
        Text.pop();
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.traveljournal", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
