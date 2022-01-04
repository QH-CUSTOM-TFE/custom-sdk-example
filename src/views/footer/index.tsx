import {
    ECameraMode,
    EDesignMode,
    ModelCameraService,
    ModelViewerService,
    SceneService,
} from '@manycore/custom-sdk';
import Select from 'antd/es/select';
import Switch from 'antd/es/switch';
import { Fragment, useState } from 'react';

import { designModes, RenderModes, sceneCameraMode } from '../../constant';
import { getApplication } from '../../core/app';
import { CameraMoveControl } from './CameraMoveControl';
import style from './index.module.scss';

const viewerService = getApplication().getService(ModelViewerService);
const cameraService = getApplication().getService(ModelCameraService);
const sceneService = getApplication().getService(SceneService);

const { Option } = Select;

export function Footer() {
    const [isShowMoveControl, setIsShowMoveControl] = useState(false);

    const handleCameraModeChange = (mode: ECameraMode) => {
        cameraService.toggleCameraMode(mode);
    };

    const changeDesignMode = (mode: EDesignMode) => {
        sceneService.setDesignMode({ mode });
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
