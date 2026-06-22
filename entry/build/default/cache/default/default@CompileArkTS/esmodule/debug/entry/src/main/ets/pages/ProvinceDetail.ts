if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ProvinceDetail_Params {
    provinceModel?: ProvinceModel;
    fileHelper?: FileHelper;
    continuationHelper?: ContinuationHelper;
    drawDataManager?: DrawDataManager;
    provinceId?: string;
    provinceName?: string;
    memories?: Memory[];
    showAddDialog?: boolean;
    inputText?: string;
    selectedPhotoUris?: string[];
    savedPhotoUris?: string[];
    showDeleteDialog?: boolean;
    deletingMemoryId?: string;
    toastMsg?: string;
    showToast?: boolean;
    showDrawBoard?: boolean;
    allowDismissDrawBoard?: boolean;
    sheetHeight?: number;
    sheetWidth?: number;
}
import router from "@ohos:router";
import type common from "@ohos:app.ability.common";
import display from "@ohos:display";
import { ProvinceModel } from "@normalized:N&&&entry/src/main/ets/model/DataModel&";
import type { Memory } from "@normalized:N&&&entry/src/main/ets/model/DataModel&";
import { FileHelper } from "@normalized:N&&&entry/src/main/ets/common/FileHelper&";
import { ContinuationHelper } from "@normalized:N&&&entry/src/main/ets/common/ContinuationHelper&";
import type { ContinuationData } from "@normalized:N&&&entry/src/main/ets/common/ContinuationHelper&";
import { DrawDataManager } from "@normalized:N&&&entry/src/main/ets/common/DrawDataManager&";
import { DrawBoard } from "@normalized:N&&&entry/src/main/ets/components/DrawBoard&";
import photoAccessHelper from "@ohos:file.photoAccessHelper";
class ProvinceDetail extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.provinceModel = ProvinceModel.getInstance();
        this.fileHelper = FileHelper.getInstance();
        this.continuationHelper = ContinuationHelper.getInstance();
        this.drawDataManager = DrawDataManager.getInstance();
        this.__provinceId = new ObservedPropertySimplePU('', this, "provinceId");
        this.__provinceName = new ObservedPropertySimplePU('', this, "provinceName");
        this.__memories = new ObservedPropertyObjectPU([], this, "memories");
        this.__showAddDialog = new ObservedPropertySimplePU(false, this, "showAddDialog");
        this.__inputText = new ObservedPropertySimplePU('', this, "inputText");
        this.__selectedPhotoUris = new ObservedPropertyObjectPU([], this, "selectedPhotoUris");
        this.__savedPhotoUris = new ObservedPropertyObjectPU([], this, "savedPhotoUris");
        this.__showDeleteDialog = new ObservedPropertySimplePU(false, this, "showDeleteDialog");
        this.__deletingMemoryId = new ObservedPropertySimplePU('', this, "deletingMemoryId");
        this.__toastMsg = new ObservedPropertySimplePU('', this, "toastMsg");
        this.__showToast = new ObservedPropertySimplePU(false, this, "showToast");
        this.__showDrawBoard = new ObservedPropertySimplePU(false, this, "showDrawBoard");
        this.allowDismissDrawBoard = false;
        this.__sheetHeight = new ObservedPropertySimplePU(600, this, "sheetHeight");
        this.__sheetWidth = new ObservedPropertySimplePU(360, this, "sheetWidth");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ProvinceDetail_Params) {
        if (params.provinceModel !== undefined) {
            this.provinceModel = params.provinceModel;
        }
        if (params.fileHelper !== undefined) {
            this.fileHelper = params.fileHelper;
        }
        if (params.continuationHelper !== undefined) {
            this.continuationHelper = params.continuationHelper;
        }
        if (params.drawDataManager !== undefined) {
            this.drawDataManager = params.drawDataManager;
        }
        if (params.provinceId !== undefined) {
            this.provinceId = params.provinceId;
        }
        if (params.provinceName !== undefined) {
            this.provinceName = params.provinceName;
        }
        if (params.memories !== undefined) {
            this.memories = params.memories;
        }
        if (params.showAddDialog !== undefined) {
            this.showAddDialog = params.showAddDialog;
        }
        if (params.inputText !== undefined) {
            this.inputText = params.inputText;
        }
        if (params.selectedPhotoUris !== undefined) {
            this.selectedPhotoUris = params.selectedPhotoUris;
        }
        if (params.savedPhotoUris !== undefined) {
            this.savedPhotoUris = params.savedPhotoUris;
        }
        if (params.showDeleteDialog !== undefined) {
            this.showDeleteDialog = params.showDeleteDialog;
        }
        if (params.deletingMemoryId !== undefined) {
            this.deletingMemoryId = params.deletingMemoryId;
        }
        if (params.toastMsg !== undefined) {
            this.toastMsg = params.toastMsg;
        }
        if (params.showToast !== undefined) {
            this.showToast = params.showToast;
        }
        if (params.showDrawBoard !== undefined) {
            this.showDrawBoard = params.showDrawBoard;
        }
        if (params.allowDismissDrawBoard !== undefined) {
            this.allowDismissDrawBoard = params.allowDismissDrawBoard;
        }
        if (params.sheetHeight !== undefined) {
            this.sheetHeight = params.sheetHeight;
        }
        if (params.sheetWidth !== undefined) {
            this.sheetWidth = params.sheetWidth;
        }
    }
    updateStateVars(params: ProvinceDetail_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__provinceId.purgeDependencyOnElmtId(rmElmtId);
        this.__provinceName.purgeDependencyOnElmtId(rmElmtId);
        this.__memories.purgeDependencyOnElmtId(rmElmtId);
        this.__showAddDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__inputText.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedPhotoUris.purgeDependencyOnElmtId(rmElmtId);
        this.__savedPhotoUris.purgeDependencyOnElmtId(rmElmtId);
        this.__showDeleteDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__deletingMemoryId.purgeDependencyOnElmtId(rmElmtId);
        this.__toastMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__showToast.purgeDependencyOnElmtId(rmElmtId);
        this.__showDrawBoard.purgeDependencyOnElmtId(rmElmtId);
        this.__sheetHeight.purgeDependencyOnElmtId(rmElmtId);
        this.__sheetWidth.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__provinceId.aboutToBeDeleted();
        this.__provinceName.aboutToBeDeleted();
        this.__memories.aboutToBeDeleted();
        this.__showAddDialog.aboutToBeDeleted();
        this.__inputText.aboutToBeDeleted();
        this.__selectedPhotoUris.aboutToBeDeleted();
        this.__savedPhotoUris.aboutToBeDeleted();
        this.__showDeleteDialog.aboutToBeDeleted();
        this.__deletingMemoryId.aboutToBeDeleted();
        this.__toastMsg.aboutToBeDeleted();
        this.__showToast.aboutToBeDeleted();
        this.__showDrawBoard.aboutToBeDeleted();
        this.__sheetHeight.aboutToBeDeleted();
        this.__sheetWidth.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private provinceModel: ProvinceModel;
    private fileHelper: FileHelper;
    private continuationHelper: ContinuationHelper;
    private drawDataManager: DrawDataManager;
    // 省份信息
    private __provinceId: ObservedPropertySimplePU<string>;
    get provinceId() {
        return this.__provinceId.get();
    }
    set provinceId(newValue: string) {
        this.__provinceId.set(newValue);
    }
    private __provinceName: ObservedPropertySimplePU<string>;
    get provinceName() {
        return this.__provinceName.get();
    }
    set provinceName(newValue: string) {
        this.__provinceName.set(newValue);
    }
    private __memories: ObservedPropertyObjectPU<Memory[]>;
    get memories() {
        return this.__memories.get();
    }
    set memories(newValue: Memory[]) {
        this.__memories.set(newValue);
    }
    // 添加回忆对话框
    private __showAddDialog: ObservedPropertySimplePU<boolean>;
    get showAddDialog() {
        return this.__showAddDialog.get();
    }
    set showAddDialog(newValue: boolean) {
        this.__showAddDialog.set(newValue);
    }
    private __inputText: ObservedPropertySimplePU<string>;
    get inputText() {
        return this.__inputText.get();
    }
    set inputText(newValue: string) {
        this.__inputText.set(newValue);
    }
    private __selectedPhotoUris: ObservedPropertyObjectPU<string[]>; // 相册选择的原始 URI
    get selectedPhotoUris() {
        return this.__selectedPhotoUris.get();
    }
    set selectedPhotoUris(newValue: string[]) {
        this.__selectedPhotoUris.set(newValue);
    }
    private __savedPhotoUris: ObservedPropertyObjectPU<string[]>; // 已保存到私有目录的 URI
    get savedPhotoUris() {
        return this.__savedPhotoUris.get();
    }
    set savedPhotoUris(newValue: string[]) {
        this.__savedPhotoUris.set(newValue);
    }
    // 删除确认对话框
    private __showDeleteDialog: ObservedPropertySimplePU<boolean>;
    get showDeleteDialog() {
        return this.__showDeleteDialog.get();
    }
    set showDeleteDialog(newValue: boolean) {
        this.__showDeleteDialog.set(newValue);
    }
    private __deletingMemoryId: ObservedPropertySimplePU<string>;
    get deletingMemoryId() {
        return this.__deletingMemoryId.get();
    }
    set deletingMemoryId(newValue: string) {
        this.__deletingMemoryId.set(newValue);
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
    // 画板弹窗
    private __showDrawBoard: ObservedPropertySimplePU<boolean>;
    get showDrawBoard() {
        return this.__showDrawBoard.get();
    }
    set showDrawBoard(newValue: boolean) {
        this.__showDrawBoard.set(newValue);
    }
    // 是否允许关闭画板（仅关闭按钮可触发）
    private allowDismissDrawBoard: boolean;
    // 画板弹窗高度（动态计算，基于屏幕高度的 85%）
    private __sheetHeight: ObservedPropertySimplePU<number>;
    get sheetHeight() {
        return this.__sheetHeight.get();
    }
    set sheetHeight(newValue: number) {
        this.__sheetHeight.set(newValue);
    }
    // 画板弹窗宽度（动态计算，充满屏幕宽度）
    private __sheetWidth: ObservedPropertySimplePU<number>;
    get sheetWidth() {
        return this.__sheetWidth.get();
    }
    set sheetWidth(newValue: number) {
        this.__sheetWidth.set(newValue);
    }
    // ==================== 生命周期 ====================
    async aboutToAppear(): Promise<void> {
        // 动态计算画板弹窗尺寸（一多适配）
        this.calcSheetSize();
        // 从路由参数获取省份 ID
        const params = router.getParams() as Record<string, string>;
        if (params && params['provinceId']) {
            this.provinceId = params['provinceId'];
        }
        // 如果是从自由流转恢复的，从 AppStorage 获取省份 ID
        if (!this.provinceId) {
            const savedData = AppStorage.get<string>('continuation_province_id');
            if (savedData) {
                this.provinceId = savedData;
            }
        }
        if (this.provinceId) {
            this.loadProvinceData();
            // 设置当前省份 ID 到 AppStorage（供自由流转使用）
            AppStorage.setOrCreate<string>('current_province_id', this.provinceId);
        }
        // 初始化画板数据管理器
        const context = getContext(this) as common.UIAbilityContext;
        this.drawDataManager.init(context);
        // 更新自由流转回调（使用 updateCallbacks 避免重复注册）
        this.continuationHelper.updateCallbacks((): ContinuationData => {
            return { provinceId: this.provinceId, timestamp: Date.now() };
        }, (data: ContinuationData) => {
            if (data.provinceId) {
                this.provinceId = data.provinceId;
                this.loadProvinceData();
            }
        });
    }
    /** 加载省份数据 */
    loadProvinceData(): void {
        const province = this.provinceModel.getProvinceById(this.provinceId);
        if (province) {
            this.provinceName = province.name;
            this.memories = [...province.memories];
        }
    }
    // ==================== 相册选择 ====================
    /** 打开系统相册选择照片 */
    async pickPhotos(): Promise<void> {
        try {
            const picker: photoAccessHelper.PhotoViewPicker = new photoAccessHelper.PhotoViewPicker();
            const selectOptions: photoAccessHelper.PhotoSelectOptions = {
                MIMEType: photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE,
                maxSelectNumber: 3 - this.savedPhotoUris.length
            };
            const result: photoAccessHelper.PhotoSelectResult = await picker.select(selectOptions);
            if (result && result.photoUris) {
                this.selectedPhotoUris = result.photoUris;
                // 将图片复制到应用私有目录
                const newUris = this.fileHelper.copyImagesToPrivateDir(this.selectedPhotoUris);
                this.savedPhotoUris = [...this.savedPhotoUris, ...newUris];
            }
        }
        catch (error) {
            console.error(`[ProvinceDetail] pickPhotos failed: ${JSON.stringify(error)}`);
            this.showToastMsg('选择照片失败');
        }
    }
    // ==================== 回忆操作 ====================
    /** 打开添加回忆对话框 */
    openAddDialog(): void {
        this.inputText = '';
        this.selectedPhotoUris = [];
        this.savedPhotoUris = [];
        this.showAddDialog = true;
    }
    /** 确认添加回忆 */
    async confirmSaveMemory(): Promise<void> {
        if (!this.inputText.trim() && this.savedPhotoUris.length === 0) {
            this.showToastMsg('请输入回忆内容或选择照片');
            return;
        }
        // 限制文字长度 200 字
        const text = this.inputText.trim().substring(0, 200);
        const memory = await this.provinceModel.addMemory(this.provinceId, text, this.savedPhotoUris);
        if (memory) {
            this.showToastMsg('回忆已添加');
        }
        else {
            this.showToastMsg('添加失败');
        }
        this.showAddDialog = false;
        this.loadProvinceData();
    }
    /** 确认删除回忆 */
    async confirmDeleteMemory(): Promise<void> {
        this.showDeleteDialog = false;
        const deletedPhotoUris = await this.provinceModel.deleteMemory(this.provinceId, this.deletingMemoryId);
        this.fileHelper.deleteImages(deletedPhotoUris);
        this.loadProvinceData();
        this.showToastMsg('回忆已删除');
    }
    /** 移除已选照片 */
    removePhoto(index: number): void {
        if (index >= 0 && index < this.savedPhotoUris.length) {
            const removedPath = this.savedPhotoUris[index];
            this.savedPhotoUris.splice(index, 1);
            this.fileHelper.deleteImage(removedPath);
        }
    }
    // ==================== 工具方法 ====================
    /** 格式化时间 */
    formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
    }
    /** 显示 Toast */
    showToastMsg(msg: string): void {
        this.toastMsg = msg;
        this.showToast = true;
        setTimeout(() => {
            this.showToast = false;
        }, 2000);
    }
    /** 动态计算画板弹窗尺寸 - 一多适配：屏幕宽度的 100%，高度的 85% */
    calcSheetSize(): void {
        try {
            const displayInfo = display.getDefaultDisplaySync();
            const screenHeight = px2vp(displayInfo.height);
            const screenWidth = px2vp(displayInfo.width);
            this.sheetHeight = Math.floor(screenHeight * 0.85);
            this.sheetWidth = Math.floor(screenWidth);
        }
        catch (e) {
            this.sheetHeight = 600;
            this.sheetWidth = 360;
        }
    }
    /** 打开画板 */
    openDrawBoard(): void {
        this.showDrawBoard = true;
    }
    /** 关闭画板 */
    closeDrawBoard(): void {
        this.allowDismissDrawBoard = true;
        this.showDrawBoard = false;
    }
    // ==================== 构建界面 ====================
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
            Stack.bindSheet({ value: this.showDrawBoard, changeEvent: newValue => { this.showDrawBoard = newValue; } }, { builder: this.DrawBoardSheetContent.bind(this) }, {
                height: this.sheetHeight,
                width: this.sheetWidth,
                dragBar: false,
                showClose: false,
                backgroundColor: Color.White,
                onWillDismiss: (dismissAction: DismissSheetAction) => {
                    if (this.allowDismissDrawBoard) {
                        dismissAction.dismiss();
                    }
                },
                onWillSpringBackWhenDismiss: (springBackAction: SpringBackAction) => {
                    if (!this.allowDismissDrawBoard) {
                        springBackAction.springBack();
                    }
                },
                onDisappear: () => {
                    this.allowDismissDrawBoard = false;
                }
            });
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#FFF9F0');
            Column.hitTestBehavior(this.showDrawBoard ? HitTestMode.None : HitTestMode.Default);
        }, Column);
        // 顶部导航栏
        this.NavigationBar.bind(this)();
        // 回忆列表
        this.MemoryList.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 底部按钮区域
            Column.create();
        }, Column);
        // 添加回忆按钮
        this.AddButton.bind(this)();
        // 打开画板按钮
        this.DrawBoardButton.bind(this)();
        // 底部按钮区域
        Column.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 添加回忆对话框
            if (this.showAddDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.AddMemoryDialog.bind(this)();
                });
            }
            // 删除确认对话框
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 删除确认对话框
            if (this.showDeleteDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.DeleteConfirmDialog.bind(this)();
                });
            }
            // Toast
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // Toast
            if (this.showToast) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.ToastView.bind(this)();
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
    /** 顶部导航栏 */
    NavigationBar(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(56);
            Row.backgroundColor('#FFFFFF');
            Row.shadow({ radius: 2, color: '#1A000000', offsetY: 1 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 返回按钮
            Image.create({ "id": 125830087, "type": 20000, params: [], "bundleName": "com.example.traveljournal", "moduleName": "entry" });
            // 返回按钮
            Image.width(24);
            // 返回按钮
            Image.height(24);
            // 返回按钮
            Image.fillColor('#333333');
            // 返回按钮
            Image.margin({ left: 16 });
            // 返回按钮
            Image.onClick(() => router.back());
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 省份名称
            Text.create(this.provinceName);
            // 省份名称
            Text.fontSize('20fp');
            // 省份名称
            Text.fontWeight(FontWeight.Bold);
            // 省份名称
            Text.fontColor('#333333');
            // 省份名称
            Text.margin({ left: 12 });
        }, Text);
        // 省份名称
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
            // 回忆数量
            Text.create(`${this.memories.length} 条回忆`);
            // 回忆数量
            Text.fontSize('13fp');
            // 回忆数量
            Text.fontColor('#999999');
            // 回忆数量
            Text.margin({ right: 16 });
        }, Text);
        // 回忆数量
        Text.pop();
        Row.pop();
    }
    /** 回忆列表 */
    MemoryList(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.memories.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        // 空状态
                        Column.create();
                        // 空状态
                        Column.width('100%');
                        // 空状态
                        Column.layoutWeight(1);
                        // 空状态
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('\u270F');
                        Text.fontSize('48fp');
                        Text.fontColor('#CCCCCC');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('还没有回忆，点击下方按钮添加吧');
                        Text.fontSize('14fp');
                        Text.fontColor('#999999');
                    }, Text);
                    Text.pop();
                    // 空状态
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.width('100%');
                        List.layoutWeight(1);
                        List.padding({ top: 12, bottom: 80 });
                        List.divider({ strokeWidth: 0 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const memory = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                    ListItem.margin({ top: 12, left: 16, right: 16 });
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.MemoryCard.bind(this)(memory);
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.memories, forEachItemGenFunction, (memory: Memory) => memory.id, false, false);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
    }
    /** 单条回忆卡片 */
    MemoryCard(memory: Memory, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(16);
            Column.shadow({ radius: 4, color: '#0D000000', offsetY: 2 });
            Gesture.create(GesturePriority.Low);
            LongPressGesture.create();
            LongPressGesture.onAction(() => {
                this.deletingMemoryId = memory.id;
                this.showDeleteDialog = true;
            });
            LongPressGesture.pop();
            Gesture.pop();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 时间
            Row.create();
            // 时间
            Row.width('100%');
            // 时间
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.formatTime(memory.createTime));
            Text.fontSize('12fp');
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 删除按钮
            Text.create('删除');
            // 删除按钮
            Text.fontSize('13fp');
            // 删除按钮
            Text.fontColor('#999999');
            // 删除按钮
            Text.onClick(() => {
                this.deletingMemoryId = memory.id;
                this.showDeleteDialog = true;
            });
        }, Text);
        // 删除按钮
        Text.pop();
        // 时间
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 文字内容
            if (memory.text) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(memory.text);
                        Text.fontSize('15fp');
                        Text.fontColor('#333333');
                        Text.lineHeight(22);
                        Text.width('100%');
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                });
            }
            // 图片横向滑动
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 图片横向滑动
            if (memory.photoUris.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.scrollable(ScrollDirection.Horizontal);
                        Scroll.width('100%');
                        Scroll.height(128);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index?: number) => {
                            const uri = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Image.create(this.fileHelper.toImageUri(uri));
                                Image.width('30%');
                                Image.height(120);
                                Image.borderRadius(8);
                                Image.objectFit(ImageFit.Cover);
                                Image.margin({ right: 8 });
                            }, Image);
                        };
                        this.forEachUpdateFunction(elmtId, memory.photoUris, forEachItemGenFunction, (uri: string, index?: number) => `${uri}_${index}`, true, true);
                    }, ForEach);
                    ForEach.pop();
                    Row.pop();
                    Scroll.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    /** 底部添加按钮 */
    AddButton(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.Center);
            Row.padding({ top: 12, bottom: 4 });
            Row.backgroundColor('#FFF9F0');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('+ 添加新回忆');
            Button.fontSize('16fp');
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#FF6B6B');
            Button.borderRadius(24);
            Button.width('80%');
            Button.height(48);
            Button.onClick(() => this.openAddDialog());
        }, Button);
        Button.pop();
        Row.pop();
    }
    /** 打开画板按钮 */
    DrawBoardButton(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.Center);
            Row.padding({ top: 4, bottom: 12 });
            Row.backgroundColor('#FFF9F0');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('\u{1F58C} 打开画板');
            Button.fontSize('15fp');
            Button.fontColor('#FF6B6B');
            Button.backgroundColor('#FFF0F0');
            Button.borderRadius(24);
            Button.width('80%');
            Button.height(44);
            Button.borderWidth(1);
            Button.borderColor('#FF6B6B');
            Button.onClick(() => {
                this.openDrawBoard();
            });
        }, Button);
        Button.pop();
        Row.pop();
    }
    /** 画板弹窗内容 */
    DrawBoardSheetContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new DrawBoard(this, { provinceId: this.provinceId, onClose: () => {
                            this.closeDrawBoard();
                        } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/ProvinceDetail.ets", line: 488, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            provinceId: this.provinceId,
                            onClose: () => {
                                this.closeDrawBoard();
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        provinceId: this.provinceId
                    });
                }
            }, { name: "DrawBoard" });
        }
        Column.pop();
    }
    /** 添加回忆对话框 */
    AddMemoryDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.backgroundColor('#80000000');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('85%');
            Column.padding(20);
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题
            Text.create('添加新回忆');
            // 标题
            Text.fontSize('18fp');
            // 标题
            Text.fontWeight(FontWeight.Bold);
            // 标题
            Text.fontColor('#333333');
            // 标题
            Text.margin({ bottom: 16 });
        }, Text);
        // 标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 文字输入
            TextArea.create({ placeholder: '写下你的旅行回忆（最多200字）...' });
            // 文字输入
            TextArea.width('100%');
            // 文字输入
            TextArea.height(100);
            // 文字输入
            TextArea.fontSize('14fp');
            // 文字输入
            TextArea.fontColor('#333333');
            // 文字输入
            TextArea.placeholderColor('#CCCCCC');
            // 文字输入
            TextArea.backgroundColor('#F5F5F5');
            // 文字输入
            TextArea.borderRadius(8);
            // 文字输入
            TextArea.padding(12);
            // 文字输入
            TextArea.maxLength(200);
            // 文字输入
            TextArea.onChange((value: string) => {
                this.inputText = value;
            });
            // 文字输入
            TextArea.margin({ bottom: 12 });
        }, TextArea);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 已选照片预览
            if (this.savedPhotoUris.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, index?: number) => {
                            const uri = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Stack.create();
                                Stack.width(72);
                                Stack.height(72);
                                Stack.margin({ right: 8 });
                            }, Stack);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Image.create(this.fileHelper.toImageUri(uri));
                                Image.width(72);
                                Image.height(72);
                                Image.borderRadius(8);
                                Image.objectFit(ImageFit.Cover);
                            }, Image);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                // 删除按钮
                                Text.create('\u00D7');
                                // 删除按钮
                                Text.fontSize('16fp');
                                // 删除按钮
                                Text.fontColor('#FFFFFF');
                                // 删除按钮
                                Text.width(20);
                                // 删除按钮
                                Text.height(20);
                                // 删除按钮
                                Text.textAlign(TextAlign.Center);
                                // 删除按钮
                                Text.backgroundColor('#CC000000');
                                // 删除按钮
                                Text.borderRadius(10);
                                // 删除按钮
                                Text.position({ x: 56, y: 0 });
                                // 删除按钮
                                Text.onClick(() => {
                                    if (index !== undefined) {
                                        this.removePhoto(index);
                                    }
                                });
                            }, Text);
                            // 删除按钮
                            Text.pop();
                            Stack.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.savedPhotoUris, forEachItemGenFunction, (uri: string, index?: number) => `${uri}_${index}`, true, true);
                    }, ForEach);
                    ForEach.pop();
                    Row.pop();
                });
            }
            // 选择照片按钮
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 选择照片按钮
            if (this.savedPhotoUris.length < 3) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(`选择照片（${this.savedPhotoUris.length}/3）`);
                        Button.fontSize('13fp');
                        Button.fontColor('#FF6B6B');
                        Button.backgroundColor('#FFF0F0');
                        Button.borderRadius(8);
                        Button.width('100%');
                        Button.height(40);
                        Button.onClick(() => this.pickPhotos());
                        Button.margin({ bottom: 16 });
                    }, Button);
                    Button.pop();
                });
            }
            // 操作按钮
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 操作按钮
            Row.create();
            // 操作按钮
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
                this.showAddDialog = false;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('添加');
            Button.fontSize('14fp');
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#FF6B6B');
            Button.borderRadius(8);
            Button.layoutWeight(1);
            Button.margin({ left: 12 });
            Button.onClick(() => this.confirmSaveMemory());
        }, Button);
        Button.pop();
        // 操作按钮
        Row.pop();
        Column.pop();
        Column.pop();
    }
    /** 删除确认对话框 */
    DeleteConfirmDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.backgroundColor('#80000000');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('72%');
            Column.padding(24);
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('确认删除');
            Text.fontSize('18fp');
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('删除后无法恢复，是否确认？');
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
                this.showDeleteDialog = false;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('删除');
            Button.fontSize('14fp');
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#FF6B6B');
            Button.borderRadius(8);
            Button.layoutWeight(1);
            Button.margin({ left: 12 });
            Button.onClick(() => this.confirmDeleteMemory());
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        Column.pop();
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
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "ProvinceDetail";
    }
}
registerNamedRoute(() => new ProvinceDetail(undefined, {}), "", { bundleName: "com.example.traveljournal", moduleName: "entry", pagePath: "pages/ProvinceDetail", pageFullPath: "entry/src/main/ets/pages/ProvinceDetail", integratedHsp: "false", moduleType: "followWithHap" });
