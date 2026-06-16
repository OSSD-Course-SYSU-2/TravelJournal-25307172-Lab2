import UIAbility from "@ohos:app.ability.UIAbility";
import AbilityConstant from "@ohos:app.ability.AbilityConstant";
import type Want from "@ohos:app.ability.Want";
import type window from "@ohos:window";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
import type { Permissions } from "@ohos:abilityAccessCtrl";
import type { BusinessError } from "@ohos:base";
import { ProvinceModel } from "@normalized:N&&&entry/src/main/ets/model/DataModel&";
import { FileHelper } from "@normalized:N&&&entry/src/main/ets/common/FileHelper&";
import { ContinuationHelper } from "@normalized:N&&&entry/src/main/ets/common/ContinuationHelper&";
import type { ContinuationData } from "@normalized:N&&&entry/src/main/ets/common/ContinuationHelper&";
export default class EntryAbility extends UIAbility {
    private provinceModel: ProvinceModel = ProvinceModel.getInstance();
    private fileHelper: FileHelper = FileHelper.getInstance();
    private continuationHelper: ContinuationHelper = ContinuationHelper.getInstance();
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        console.info('[EntryAbility] onCreate');
        // 初始化 FileHelper 上下文
        this.fileHelper.setContext(this.context);
        // 初始化 ProvinceModel
        this.provinceModel.init(this.context);
        // 如果是接续恢复，从 want 中获取数据
        if (launchParam.launchReason === AbilityConstant.LaunchReason.CONTINUATION) {
            const provinceId = want.parameters?.['provinceId'] as string;
            if (provinceId) {
                AppStorage.setOrCreate<string>('continuation_province_id', provinceId);
            }
        }
        // 注册自由流转
        this.continuationHelper.register((): ContinuationData => {
            const provinceId = AppStorage.get<string>('current_province_id') || '';
            return { provinceId: provinceId, timestamp: Date.now() };
        }, (data: ContinuationData) => {
            if (data.provinceId) {
                AppStorage.setOrCreate<string>('continuation_province_id', data.provinceId);
            }
        });
        // 动态请求分布式数据同步权限
        this.requestDistributedPermission();
    }
    /**
     * 动态请求分布式数据同步权限
     * DISTRIBUTED_DATASYNC 是 user_grant 级别权限，需要运行时向用户授权
     */
    private requestDistributedPermission(): void {
        try {
            const atManager = abilityAccessCtrl.createAtManager();
            const permissions: Array<Permissions> = ['ohos.permission.DISTRIBUTED_DATASYNC'];
            atManager.requestPermissionsFromUser(this.context, permissions).then((data) => {
                console.info(`[EntryAbility] requestPermissionsFromUser result: authResults=${data.authResults}`);
                if (data.authResults.length > 0 && data.authResults[0] === 0) {
                    console.info('[EntryAbility] DISTRIBUTED_DATASYNC permission granted');
                }
                else {
                    console.warn('[EntryAbility] DISTRIBUTED_DATASYNC permission denied');
                }
            }).catch((err: BusinessError) => {
                console.error(`[EntryAbility] requestPermissionsFromUser failed: code=${err.code}, msg=${err.message}`);
            });
        }
        catch (error) {
            const err = error as BusinessError;
            console.error(`[EntryAbility] requestDistributedPermission error: code=${err.code}, msg=${err.message}`);
        }
    }
    /**
     * 自由流转 - 源设备侧回调
     * 当用户发起接续时，系统调用此方法获取需要传递的数据
     */
    onContinue(wantParam: Record<string, Object>): AbilityConstant.OnContinueResult {
        console.info('[EntryAbility] onContinue');
        // 获取当前接续数据
        const data = this.continuationHelper.getContinuationData();
        // 将数据写入 wantParam
        wantParam['provinceId'] = data.provinceId;
        wantParam['timestamp'] = data.timestamp.toString();
        return AbilityConstant.OnContinueResult.AGREE;
    }
    /**
     * 自由流转 - 目标设备侧回调
     * 当接续数据到达目标设备时，系统调用此方法恢复数据
     */
    onRestoreData(want: Want): void {
        console.info('[EntryAbility] onRestoreData');
        const provinceId = want.parameters?.['provinceId'] as string;
        if (provinceId) {
            AppStorage.setOrCreate<string>('continuation_province_id', provinceId);
            // 通知 ContinuationHelper 恢复数据
            this.continuationHelper.restoreContinuationData({
                provinceId: provinceId,
                timestamp: Date.now()
            });
        }
    }
    /**
     * 自由流转 - 流转失败回调
     * 当接续过程中发生错误时，系统调用此方法
     */
    onContinueFailed(code: number): void {
        console.error(`[EntryAbility] onContinueFailed, code: ${code}`);
        // 通知 UI 层流转失败
        AppStorage.setOrCreate<string>('continuation_error', `流转失败 (code: ${code})`);
    }
    onDestroy(): void {
        console.info('[EntryAbility] onDestroy');
        // 注销自由流转
        this.continuationHelper.unregister();
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        console.info('[EntryAbility] onWindowStageCreate');
        // 设置主窗口
        windowStage.loadContent('pages/Index', (err) => {
            if (err.code) {
                console.error(`[EntryAbility] loadContent failed: ${JSON.stringify(err)}`);
                return;
            }
            console.info('[EntryAbility] loadContent success');
        });
    }
    onWindowStageDestroy(): void {
        console.info('[EntryAbility] onWindowStageDestroy');
    }
    onForeground(): void {
        console.info('[EntryAbility] onForeground');
    }
    onBackground(): void {
        console.info('[EntryAbility] onBackground');
    }
}
