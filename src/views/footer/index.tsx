import Switch from 'antd/lib/switch';
import { Fragment, useState } from 'react';

import {
    ECameraMode,
    EDesignMode, EElementType, EFittingType,
    ModelCameraService, ModelViewerSelectionV2Service,
    ModelViewerService,
    SceneService,
} from '@manycore/custom-sdk';

import { designModes, RenderModes, sceneCameraMode } from '../../constant';
import { getApplication } from '../../core/app';
import { CameraMoveControl } from './CameraMoveControl';
import style from './index.module.scss';
import Select from 'antd/lib/select';

const viewerService = getApplication().getService(ModelViewerService);
const cameraService = getApplication().getService(ModelCameraService);
const sceneService = getApplication().getService(SceneService);
const sectionService = getApplication().getService(ModelViewerSelectionV2Service);

const { Option } = Select;

// 点击模型时获取板面
const fn = (data) => {
    console.log('【监听】板面选中数据:', data);
};
// hover模型时获取板面
// const fn1 = (data) => {
//     console.log('【监听】板面hover数据:', data);
// };

export function Footer() {
    const [isShowMoveControl, setIsShowMoveControl] = useState(false);

    const handleCameraModeChange = (mode: ECameraMode) => {
        cameraService.toggleCameraMode(mode);
    };

    const changeDesignMode = (mode: EDesignMode) => {
        if(mode !== EDesignMode.CUSTOM){
            sceneService.setDesignMode({mode});
            sectionService.plankFaceClickEvent.off(fn); // 移除
            // sectionService.plankFaceHoverEvent.off(fn1); // 移除
        }else {
            // 进入自定义模式
            sectionService.plankFaceClickEvent.on(fn); // 监听
            // sectionService.plankFaceClickEvent.once(fn); // 监听一次
            // sectionService.plankFaceHoverEvent.on(fn1); // 监听
            // sectionService.plankFaceHoverEvent.once(fn1); // 监听一次

            sceneService.setDesignMode({
                mode: EDesignMode.CUSTOM,
                customModeCb: {
                    findSelectModel: (model) => {
                        // console.log('eder find', model)
                        // 选中判断
                        if (model.hasOwnProperty('linkParamModelId')) {
                            // console.log('五金孔槽模型');
                            const { modelType } = model;
                            if (modelType === EFittingType.HOLE) {
                                console.log('选中-孔模型');
                                return {
                                    id: model.id,
                                    type: EElementType.HOLE
                                }
                            }
                            if (modelType === EFittingType.GROOVE) {
                                console.log('选中-槽模型');
                                return {
                                    id: model.id,
                                    type: EElementType.GROOVE
                                }
                            }
                            if (modelType === EFittingType.HARDWARE_GROOVE) {
                                console.log('选中-五金槽');
                                return {
                                    id: model.id,
                                    type: EElementType.HARDWARE_GROOVE
                                }
                            }
                            if (modelType === EFittingType.HARDWARE) {
                                console.log('选中-五金模型');
                                return {
                                    id: model.id,
                                    type: EElementType.HARDWARE
                                }
                            }
                        } else {
                            console.log('选中-参数化模型');
                            return {
                                id: model.id,
                                type: EElementType.PARAM_MODEL
                            }
                        }
                    },
                    findHintModel: (model) => {
                        // console.log('eder hint', model)
                        // 处理高亮判断
                        if (model.hasOwnProperty('linkParamModelId')) {
                            // console.log('五金孔槽模型');
                            const { modelType } = model;
                            if (modelType === EFittingType.HOLE) {
                                console.log('高亮-孔模型');
                                return {
                                    id: model.id,
                                    type: EElementType.HOLE
                                }
                            }
                            if (modelType === EFittingType.GROOVE) {
                                console.log('高亮-槽模型')
                                return {
                                    id: model.id,
                                    type: EElementType.GROOVE
                                }
                            }
                            if (modelType === EFittingType.HARDWARE_GROOVE) {
                                console.log('高亮-五金槽')
                                return {
                                    id: model.id,
                                    type: EElementType.HARDWARE_GROOVE
                                }
                            }
                            if (modelType === EFittingType.HARDWARE) {
                                console.log('高亮-五金模型')
                                return {
                                    id: model.id,
                                    type: EElementType.HARDWARE
                                }
                            }
                        } else {
                            console.log('高亮-参数化模型')
                            return {
                                id: model.id,
                                type: EElementType.PARAM_MODEL
                            }
                        }
                    }
                }
            });
        }
    };
    return (
        <Fragment>
            <div>
                <button
                    className={style.viewerBtn}
                    onClick={() => viewerService.resetPerspective()}
                >
                    重置视角
                </button>
                <Select defaultValue={sceneCameraMode[0].mode} onChange={handleCameraModeChange}>
                    {sceneCameraMode.map((cm) => {
                        return <Option value={cm.mode}>{cm.text}</Option>;
                    })}
                </Select>
                <span>
                    <Switch
                        checkedChildren="开启控件"
                        unCheckedChildren="关闭控件"
                        onChange={(checked: boolean) => setIsShowMoveControl(checked)}
                    />
                </span>
                {RenderModes.map((mode) => {
                    return (
                        <button
                            className={style.viewerBtn}
                            onClick={() => {
                                viewerService.toggleModelBorder(mode.isSetBorder);
                                viewerService.toggleModelTransparent(mode.isSetTransparent);
                            }}
                        >
                            {mode.text}
                        </button>
                    );
                })}
                <Select defaultValue={designModes[2].mode} onChange={changeDesignMode}>
                    {designModes.map((d) => {
                        return <Option value={d.mode}>{d.text}</Option>;
                    })}
                </Select>
            </div>
            {isShowMoveControl && <CameraMoveControl />}
        </Fragment>
    );
}
