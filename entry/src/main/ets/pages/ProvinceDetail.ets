/**
 * ProvinceDetail.ets - 省份手账详情页
 * 功能：
 * 1. 显示省份名称和回忆列表
 * 2. 添加新回忆（文字 + 最多3张照片）
 * 3. 长按删除回忆（弹出确认框）
 * 4. 图片横向滑动浏览
 * 5. 支持自由流转（continuable）
 * 6. 画板功能（bindSheet 半模态弹窗）
 */
import router from '@ohos.router';
import common from '@ohos.app.ability.common';
import { ProvinceModel, Province, Memory } from '../model/DataModel';
import { FileHelper } from '../common/FileHelper';
import { ContinuationHelper, ContinuationData } from '../common/ContinuationHelper';
import { DrawDataManager } from '../common/DrawDataManager';
import { DrawBoard } from '../components/DrawBoard';
import photoAccessHelper from '@ohos.file.photoAccessHelper';

@Entry
@Component
struct ProvinceDetail {
  private provinceModel: ProvinceModel = ProvinceModel.getInstance();
  private fileHelper: FileHelper = FileHelper.getInstance();
  private continuationHelper: ContinuationHelper = ContinuationHelper.getInstance();
  private drawDataManager: DrawDataManager = DrawDataManager.getInstance();

  // 省份信息
  @State provinceId: string = '';
  @State provinceName: string = '';
  @State memories: Memory[] = [];

  // 添加回忆对话框
  @State showAddDialog: boolean = false;
  @State inputText: string = '';
  @State selectedPhotoUris: string[] = [];   // 相册选择的原始 URI
  @State savedPhotoUris: string[] = [];      // 已保存到私有目录的 URI

  // 删除确认对话框
  @State showDeleteDialog: boolean = false;
  @State deletingMemoryId: string = '';

  // Toast 提示
  @State toastMsg: string = '';
  @State showToast: boolean = false;

  // 画板弹窗
  @State showDrawBoard: boolean = false;

  // ==================== 生命周期 ====================

  async aboutToAppear(): Promise<void> {
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
    this.continuationHelper.updateCallbacks(
      (): ContinuationData => {
        return { provinceId: this.provinceId, timestamp: Date.now() };
      },
      (data: ContinuationData) => {
        if (data.provinceId) {
          this.provinceId = data.provinceId;
          this.loadProvinceData();
        }
      }
    );
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
    } catch (error) {
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
    } else {
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

  // ==================== 构建界面 ====================

  build() {
    Stack() {
      Column() {
        // 顶部导航栏
        this.NavigationBar()

        // 回忆列表
        this.MemoryList()

        // 底部按钮区域
        Column() {
          // 添加回忆按钮
          this.AddButton()

          // 打开画板按钮
          this.DrawBoardButton()
        }
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#FFF9F0')

      // 添加回忆对话框
      if (this.showAddDialog) {
        this.AddMemoryDialog()
      }

      // 删除确认对话框
      if (this.showDeleteDialog) {
        this.DeleteConfirmDialog()
      }

      // Toast
      if (this.showToast) {
        this.ToastView()
      }
    }
    .width('100%')
    .height('100%')
    .bindSheet($$this.showDrawBoard, this.DrawBoardSheetContent, {
      height: SheetSize.LARGE,
      dragBar: true,
      backgroundColor: Color.White,
      onDisappear: () => {
        // 画板关闭时保存数据（DrawBoard 的 aboutToDisappear 中处理）
      }
    })
  }

  // ==================== 子组件 ====================

  /** 顶部导航栏 */
  @Builder
  NavigationBar() {
    Row() {
      // 返回按钮
      Image($r('sys.media.ohos_ic_public_arrow_left'))
        .width(24)
        .height(24)
        .fillColor('#333333')
        .margin({ left: 16 })
        .onClick(() => router.back())

      // 省份名称
      Text(this.provinceName)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')
        .margin({ left: 12 })

      Blank()

      // 自由流转按钮
      Text('\u21C4')  // ⇄ 流转图标
        .fontSize(20)
        .fontColor('#666666')
        .margin({ right: 12 })
        .onClick(() => {
          this.continuationHelper.startContinuation();
        })

      // 回忆数量
      Text(`${this.memories.length} 条回忆`)
        .fontSize(13)
        .fontColor('#999999')
        .margin({ right: 16 })
    }
    .width('100%')
    .height(56)
    .backgroundColor('#FFFFFF')
    .shadow({ radius: 2, color: '#1A000000', offsetY: 1 })
  }

  /** 回忆列表 */
  @Builder
  MemoryList() {
    if (this.memories.length === 0) {
      // 空状态
      Column() {
        Text('\u270F')  // ✏
          .fontSize(48)
          .fontColor('#CCCCCC')
          .margin({ bottom: 16 })

        Text('还没有回忆，点击下方按钮添加吧')
          .fontSize(14)
          .fontColor('#999999')
      }
      .width('100%')
      .layoutWeight(1)
      .justifyContent(FlexAlign.Center)
    } else {
      List() {
        ForEach(this.memories, (memory: Memory) => {
          ListItem() {
            this.MemoryCard(memory)
          }
          .margin({ top: 12, left: 16, right: 16 })
        }, (memory: Memory) => memory.id)
      }
      .width('100%')
      .layoutWeight(1)
      .padding({ top: 12, bottom: 80 })
      .divider({ strokeWidth: 0 })
    }
  }

  /** 单条回忆卡片 */
  @Builder
  MemoryCard(memory: Memory) {
    Column() {
      // 时间
      Row() {
        Text(this.formatTime(memory.createTime))
          .fontSize(12)
          .fontColor('#999999')

        Blank()

        // 删除按钮
        Text('删除')
          .fontSize(13)
          .fontColor('#999999')
          .onClick(() => {
            this.deletingMemoryId = memory.id;
            this.showDeleteDialog = true;
          })
      }
      .width('100%')
      .margin({ bottom: 8 })

      // 文字内容
      if (memory.text) {
        Text(memory.text)
          .fontSize(15)
          .fontColor('#333333')
          .lineHeight(22)
          .width('100%')
          .margin({ bottom: 8 })
      }

      // 图片横向滑动
      if (memory.photoUris.length > 0) {
        Scroll() {
          Row() {
            ForEach(memory.photoUris, (uri: string, index?: number) => {
              Image(this.fileHelper.toImageUri(uri))
                .width('30%')
                .height(120)
                .borderRadius(8)
                .objectFit(ImageFit.Cover)
                .margin({ right: 8 })
            }, (uri: string, index?: number) => `${uri}_${index}`)
          }
        }
        .scrollable(ScrollDirection.Horizontal)
        .width('100%')
        .height(128)
      }
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .borderRadius(16)
    .shadow({ radius: 4, color: '#0D000000', offsetY: 2 })
    .gesture(
      LongPressGesture()
        .onAction(() => {
          this.deletingMemoryId = memory.id;
          this.showDeleteDialog = true;
        })
    )
  }

  /** 底部添加按钮 */
  @Builder
  AddButton() {
    Row() {
      Button('+ 添加新回忆')
        .fontSize(16)
        .fontColor('#FFFFFF')
        .backgroundColor('#FF6B6B')
        .borderRadius(24)
        .width('80%')
        .height(48)
        .onClick(() => this.openAddDialog())
    }
    .width('100%')
    .justifyContent(FlexAlign.Center)
    .padding({ top: 12, bottom: 4 })
    .backgroundColor('#FFF9F0')
  }

  /** 打开画板按钮 */
  @Builder
  DrawBoardButton() {
    Row() {
      Button('\u{1F58C} 打开画板')
        .fontSize(15)
        .fontColor('#FF6B6B')
        .backgroundColor('#FFF0F0')
        .borderRadius(24)
        .width('80%')
        .height(44)
        .borderWidth(1)
        .borderColor('#FF6B6B')
        .onClick(() => {
          this.showDrawBoard = true;
        })
    }
    .width('100%')
    .justifyContent(FlexAlign.Center)
    .padding({ top: 4, bottom: 12 })
    .backgroundColor('#FFF9F0')
  }

  /** 画板弹窗内容 */
  @Builder
  DrawBoardSheetContent() {
    Column() {
      DrawBoard({ provinceId: this.provinceId })
    }
    .width('100%')
    .height('100%')
  }

  /** 添加回忆对话框 */
  @Builder
  AddMemoryDialog() {
    Column() {
      Column() {
        // 标题
        Text('添加新回忆')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ bottom: 16 })

        // 文字输入
        TextArea({ placeholder: '写下你的旅行回忆（最多200字）...' })
          .width('100%')
          .height(100)
          .fontSize(14)
          .fontColor('#333333')
          .placeholderColor('#CCCCCC')
          .backgroundColor('#F5F5F5')
          .borderRadius(8)
          .padding(12)
          .maxLength(200)
          .onChange((value: string) => {
            this.inputText = value;
          })
          .margin({ bottom: 12 })

        // 已选照片预览
        if (this.savedPhotoUris.length > 0) {
          Row() {
            ForEach(this.savedPhotoUris, (uri: string, index?: number) => {
              Stack() {
                Image(this.fileHelper.toImageUri(uri))
                  .width(72)
                  .height(72)
                  .borderRadius(8)
                  .objectFit(ImageFit.Cover)

                // 删除按钮
                Text('\u00D7')  // ×
                  .fontSize(16)
                  .fontColor('#FFFFFF')
                  .width(20)
                  .height(20)
                  .textAlign(TextAlign.Center)
                  .backgroundColor('#CC000000')
                  .borderRadius(10)
                  .position({ x: 56, y: 0 })
                  .onClick(() => {
                    if (index !== undefined) {
                      this.removePhoto(index);
                    }
                  })
              }
              .width(72)
              .height(72)
              .margin({ right: 8 })
            }, (uri: string, index?: number) => `${uri}_${index}`)
          }
          .width('100%')
          .margin({ bottom: 12 })
        }

        // 选择照片按钮
        if (this.savedPhotoUris.length < 3) {
          Button(`选择照片（${this.savedPhotoUris.length}/3）`)
            .fontSize(13)
            .fontColor('#FF6B6B')
            .backgroundColor('#FFF0F0')
            .borderRadius(8)
            .width('100%')
            .height(40)
            .onClick(() => this.pickPhotos())
            .margin({ bottom: 16 })
        }

        // 操作按钮
        Row() {
          Button('取消')
            .fontSize(14)
            .fontColor('#666666')
            .backgroundColor('#F0F0F0')
            .borderRadius(8)
            .layoutWeight(1)
            .onClick(() => {
              this.showAddDialog = false;
            })

          Button('添加')
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor('#FF6B6B')
            .borderRadius(8)
            .layoutWeight(1)
            .margin({ left: 12 })
            .onClick(() => this.confirmSaveMemory())
        }
        .width('100%')
      }
      .width('85%')
      .padding(20)
      .backgroundColor('#FFFFFF')
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor('#80000000')
  }

  /** 删除确认对话框 */
  @Builder
  DeleteConfirmDialog() {
    Column() {
      Column() {
        Text('确认删除')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ bottom: 12 })

        Text('删除后无法恢复，是否确认？')
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
              this.showDeleteDialog = false;
            })

          Button('删除')
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor('#FF6B6B')
            .borderRadius(8)
            .layoutWeight(1)
            .margin({ left: 12 })
            .onClick(() => this.confirmDeleteMemory())
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
}
