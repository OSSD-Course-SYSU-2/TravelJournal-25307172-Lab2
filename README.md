# TravelJournal - 旅游手账

一款基于 HarmonyOS 的旅游打卡手账应用。在中国地图上点亮去过的省份，记录旅行回忆，用画板涂鸦，收集成就奖牌。

## 功能概览

### 省份地图打卡

使用 Canvas 绘制中国 34 个省级行政区地图，每个省份以椭圆表示，大小反映真实面积比例。

- 点击未点亮省份 → 点亮并保存（金色填充 + 打勾图标）
- 点击已点亮省份 → 弹出操作对话框（查看手账 / 取消打卡）
- 长按拖动省份 → 移动椭圆位置，位置持久化保存
- 底部统计栏显示打卡进度

### 旅行手账

为每个省份记录旅行回忆：

- 添加文字回忆（最多 200 字）+ 最多 3 张照片
- 照片从系统相册选取，保存到应用私有目录
- 删除回忆时同步清理关联图片
- 图片横向滑动浏览

### 画板涂鸦

通过半模态弹窗打开画板，在省份页面上自由涂鸦：

- 6 种预设画笔颜色（黑、红、蓝、绿、橙、紫）
- 3 档笔触粗细（细 / 中 / 粗）
- 橡皮擦模式
- 从相册添加照片到画布
- 清空画布（二次确认）
- 画板数据自动保存与恢复

### 成就奖牌

10 枚旅行成就奖牌，按区域和主题划分：

| 奖牌 | 所需省份 |
|------|----------|
| 🧊 冰城探秘者 | 黑龙江、吉林、辽宁 |
| 🏔️ 北境守望者 | 北京、天津、河北、山西、内蒙古 |
| 🏮 东方明珠 | 上海、江苏、浙江、安徽、福建、江西、山东 |
| 🏯 中原行者 | 河南、湖北、湖南 |
| 🐼 西南秘境 | 重庆、四川、贵州、云南、西藏 |
| 🐫 大漠孤烟 | 陕西、甘肃、青海、宁夏、新疆 |
| 🌾 鱼米之乡 | 江苏、安徽、江西、湖北、湖南 |
| 🌸 锦绣南疆 | 广东、广西、海南、香港、澳门 |
| 🌊 山海之间 | 辽宁、天津、山东、江苏、上海、浙江、福建、广东 |
| 🐉 万里神州 | 全部 34 个省份 |

点亮省份时自动检测奖牌解锁，弹出解锁通知。

### 自由流转

支持 HarmonyOS 多设备间的应用接续：

- 点击流转按钮（⇄）选择目标设备
- 自动传递当前查看的省份信息
- 目标设备恢复后自动跳转到对应页面

## 技术栈

| 项目 | 说明 |
|------|------|
| 开发语言 | ArkTS |
| UI 框架 | ArkUI 声明式开发范式 |
| 目标设备 | phone、tablet、2in1 |
| 最低 SDK | API 22 (HarmonyOS 6.0.2) |
| 数据持久化 | Preferences 轻量级存储 |
| 构建工具 | Hvigor |
| 包管理 | OHPM |

## 项目结构

```
TravelJournal/
├── AppScope/
│   ├── app.json5                          # 应用全局配置
│   └── resources/base/
│       └── element/string.json            # 全局字符串资源
├── entry/
│   ├── src/main/
│   │   ├── module.json5                   # 模块配置（权限、Ability、页面路由）
│   │   ├── ets/
│   │   │   ├── entryability/
│   │   │   │   └── EntryAbility.ets       # 应用入口 Ability
│   │   │   ├── pages/
│   │   │   │   ├── Index.ets              # 首页 - Canvas 省份地图
│   │   │   │   ├── ProvinceDetail.ets     # 省份详情 - 手账管理
│   │   │   │   └── Badges.ets             # 成就奖牌展示
│   │   │   ├── components/
│   │   │   │   ├── DrawBoard.ets          # 画板组件
│   │   │   │   └── BadgePopup.ets         # 奖牌解锁弹窗
│   │   │   ├── common/
│   │   │   │   ├── ContinuationHelper.ets # 自由流转辅助类
│   │   │   │   ├── DrawDataManager.ets    # 画板数据持久化
│   │   │   │   ├── BadgeManager.ets       # 奖牌管理
│   │   │   │   ├── FileHelper.ets         # 图片文件操作
│   │   │   │   └── PointInPolygon.ets     # 椭圆碰撞检测
│   │   │   └── model/
│   │   │       └── DataModel.ets          # 省份数据模型
│   │   └── resources/
│   │       └── base/
│   │           ├── element/               # 字符串、颜色资源
│   │           ├── media/                 # 应用图标
│   │           └── profile/
│   │               └── main_pages.json    # 页面路由配置
│   ├── build-profile.json5
│   └── oh-package.json5
├── build-profile.json5                    # 项目级构建配置
└── oh-package.json5
```

## 技术要点

### 一多适配

> "一多"即"一次开发，多端部署"，是 HarmonyOS 的核心开发理念，要求应用在手机、平板、2in1 等不同屏幕尺寸的设备上都能提供合理的布局和交互体验。

#### 当前适配状态

项目在一多适配上处于**部分适配**状态，整体适配率约 28%。以下按"已适配"和"未适配"分类说明。

##### 已适配的部分

| 适配项 | 实现方式 | 涉及文件 | 效果 |
|--------|----------|----------|------|
| Canvas 省份地图 | 基准坐标系 1600×1000，运行时通过 `onAreaChange` 获取实际尺寸按比例映射 | Index.ets | 完全自适应，任意屏幕尺寸下地图比例正确 |
| 椭圆最小尺寸 | `getMinRx()` / `getMinRy()` 取 Canvas 宽高的百分比，保证文字可读 | Index.ets | 小屏幕上省份名称不会溢出 |
| 画板弹窗尺寸 | `display.getDefaultDisplaySync()` 动态计算屏幕 85% 高度 / 100% 宽度 | ProvinceDetail.ets | 弹窗在平板上充满屏幕宽度 |
| 画板工具栏宽度 | 工具按钮使用 `layoutWeight(1)` 自动等分 | DrawBoard.ets | 工具栏不会溢出屏幕 |
| 画板 Canvas | `width('100%')` + `layoutWeight(1)` + `onAreaChange` | DrawBoard.ets | 画布自动填满可用空间 |
| 奖牌卡片宽度 | 卡片 `width('42%')`，Emoji 容器 `aspectRatio: 1` | Badges.ets | 卡片宽度随屏幕缩放 |
| 奖牌 fontSize | `getScale()` 缩放因子（容器宽度 / 360vp 基准宽度） | Badges.ets | 文字大小随屏幕缩放 |
| 容器宽度 | 大部分容器使用 `'100%'`、百分比、`layoutWeight` | 全部文件 | 宽度方向自适应 |
| fontSize 单位 | 所有 `fontSize` 使用 `fp` 单位（跟随系统字体缩放） | 全部文件 | 用户调整系统字体大小时文字同步缩放 |

##### 未适配的部分

以下 UI 属性仍使用硬编码的 vp 值，在平板（2x 屏幕宽度）上会出现布局问题：

**1. 固定高度（~12 处）**

平板上元素高度不变，视觉比例失调，点击区域偏小。

| 元素 | 硬编码值 | 所在文件 |
|------|----------|----------|
| 标题栏 / 导航栏 | `height: 56` | Index.ets, ProvinceDetail.ets |
| 统计栏 | `height: 48` | Index.ets |
| 按钮高度 | `height: 44` / `height: 48` | Index.ets, ProvinceDetail.ets |
| 画板标题栏 | `height: 48` | DrawBoard.ets |
| 画板工具栏行 | `height: 56` | DrawBoard.ets |
| 画板关闭按钮 | `height: 32` | DrawBoard.ets |
| 回忆图片高度 | `height: 120` | ProvinceDetail.ets |
| 图片滚动区 | `height: 128` | ProvinceDetail.ets |
| 输入框 | `height: 100` | ProvinceDetail.ets |
| 照片预览 | `height: 72` | ProvinceDetail.ets |

**2. 固定间距（~50 处）**

margin / padding 全部为硬编码 vp 值，平板上间距偏窄，视觉拥挤。

高频值：`4, 8, 10, 12, 16, 20, 24, 32`

**3. 固定圆角（~15 处）**

borderRadius 不会随屏幕缩放，平板上圆角比例失调。

高频值：`4, 8, 10, 16, 20, 24`

**4. 固定小元素尺寸（~10 处）**

| 元素 | 硬编码值 | 所在文件 |
|------|----------|----------|
| 返回箭头图标 | `width/height: 24` | ProvinceDetail.ets |
| 照片预览缩略图 | `width/height: 72` | ProvinceDetail.ets |
| 删除按钮 | `width/height: 20` | ProvinceDetail.ets |
| 笔触粗细指示圆 | `width/height: 6, 10, 14` | DrawBoard.ets |
| 粗细选择容器 | `width/height: 28` | DrawBoard.ets |
| 颜色选择圆圈 | `width/height: 20` | DrawBoard.ets |

**5. BadgePopup.ets 完全未适配**

该组件作为 `@CustomDialog` 备用方案，所有 UI 尺寸均为硬编码，未引入任何缩放机制。

#### 适配率统计

| 文件 | 自适应属性数 | 硬编码属性数 | 适配率 |
|------|-------------|-------------|--------|
| Index.ets | 18 | 47 | 27.7% |
| ProvinceDetail.ets | 22 | 72 | 23.4% |
| DrawBoard.ets | 16 | 48 | 25.0% |
| Badges.ets | 15 | 12 | 55.6% |
| BadgePopup.ets | 5 | 14 | 26.3% |
| **合计** | **76** | **193** | **28.3%** |

#### 改进方向

要实现真正意义上的一多，建议按以下优先级推进：

1. **引入断点系统**：根据屏幕宽度分档（sm < 600vp / md 600-840vp / lg > 840vp），不同断点使用不同的布局参数（如标题栏高度 sm:48 / md:56 / lg:64）
2. **height 自适应**：标题栏、按钮等关键高度根据断点调整，或使用 `minHeight` + `padding` 替代固定高度
3. **间距自适应**：margin / padding 根据断点取不同值，或使用百分比
4. **栅格布局**：回忆卡片在平板（lg 断点）上使用多列布局（`GridRow` / `GridCol`），充分利用屏幕空间
5. **资源限定词**：为不同屏幕尺寸提供不同的资源文件（如 `resources/base/element/` vs `resources/lg/element/`）

### Canvas 绘图

- 椭圆碰撞检测算法（`pointInEllipse`）判断触摸点是否在省份区域内
- 画板使用 `priorityGesture(PanGesture)` 拦截手势，防止与 `bindSheet` 拖拽冲突
- 使用 `quadraticCurveTo` 实现平滑曲线绘制
- 橡皮擦通过 `globalCompositeOperation = 'destination-out'` 实现
- Canvas 数据导出为 base64 PNG 持久化，恢复时通过 `@ohos.multimedia.image` 解码为 PixelMap 绘制
- 手动实现 base64 解码（ArkTS 不支持 `atob()`）

### 自由流转

- 完整的 `continuationManager` 集成：注册、设备选择、数据传递、恢复
- `EntryAbility` 实现 `onContinue` / `onRestoreData` / `onContinueFailed` 三个流转回调
- 流转数据包含当前省份 ID，恢复后自动跳转到对应省份详情页
- 使用 `AppStorage` 在 Ability 和页面间传递流转数据

### 架构设计

- 所有管理类（`ProvinceModel`、`BadgeManager`、`ContinuationHelper`、`DrawDataManager`、`FileHelper`）采用单例模式
- 省份颜色设计：每个省份有独特的文化主题色（如新疆"沙漠驼"、西藏"哈达白"、四川"竹青灰"等）
- 奖牌三层 Stack 结构：灰度效果仅作用于奖章内部，边框保持原色
- 奖牌弹窗队列机制：多个奖牌同时解锁时依次显示

## 权限

| 权限 | 级别 | 用途 |
|------|------|------|
| `ohos.permission.DISTRIBUTED_DATASYNC` | user_grant | 多设备间自由流转 |

该权限在应用启动时通过 `abilityAccessCtrl` 动态请求用户授权。

## 构建

1. 使用 DevEco Studio 打开项目
2. 连接 HarmonyOS 设备或启动模拟器
3. 点击运行

## 许可证

MIT
