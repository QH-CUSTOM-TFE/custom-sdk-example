import {
    ECameraMode,
    EDesignMode,
    ModelCameraService,
    ModelViewerService,
    SceneService,
} from '@manycore/custom-sdk';
import Select from 'antd/es/select';
import Switch from 'antd/es/switch';
import React, { Fragment, useCallback, useState } from 'react';

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

    const handleCameraModeChange = useCallback((mode: ECameraMode) => {
        cameraService.toggleCameraMode(mode);
    }, []);

    const changeDesignMode = useCallback((mode: EDesignMode) => {
        sceneService.setDesignMode({ mode });
    }, []);

    const resetPerspective = useCallback(() => {
        viewerService.resetPerspective();
    }, []);

    return (
        <Fragment>
            <div>
                <button className={style.viewerBtn} onClick={resetPerspective}>
                    重置视角
                </button>
                <Select defaultValue={sceneCameraMode[0].mode} onChange={handleCameraModeChange}>
                    {sceneCameraMode.map((cm, index) => {
                        return (
                            <Option value={cm.mode} key={index}>
                                {cm.text}
                            </Option>
                        );
                    })}
                </Select>
                <span>
                    <Switch
                        checkedChildren="开启控件"
                        unCheckedChildren="关闭控件"
                        onChange={setIsShowMoveControl}
                    />
                </span>
                {RenderModes.map((mode, index) => {
                    return (
                        <button
                            key={index}
                            className={style.viewerBtn}
                            onClick={() => {
                                /*if (mode.isFullTransparent) {
                                    viewerService.toggleModelFullTransparent(true);
                                } else {*/
                                    viewerService.toggleModelBorder(mode.isSetBorder!);
                                    viewerService.toggleModelTransparent(mode.isSetTransparent!);
                                // }
                            }}
                        >
                            {mode.text}
                        </button>
                    );
                })}
                <Select defaultValue={designModes[2].mode} onChange={changeDesignMode}>
                    {designModes.map((d, key) => {
                        return (
                            <Option value={d.mode} key={key}>
                                {d.text}
                            </Option>
                        );
                    })}
                </Select>
            </div>
            {isShowMoveControl && <CameraMoveControl />}
        </Fragment>
    );
}
