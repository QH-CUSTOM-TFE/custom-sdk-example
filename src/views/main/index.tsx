import { IExportModelData } from '@manycore/custom-miniapp-sdk';
import {
    ECameraMoveDirection,
    ESelectedType,
    FittingDesignService,
    ISelected,
    ModelCameraService,
    ModelViewerSelectionService,
} from '@manycore/custom-sdk';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { AppLayout } from '../../components/AppLayout';
import { getApplication } from '../../core/app';
import { actionUpdateSelected } from '../../store/selection/action';
import { IAppSelection } from '../../store/selection/reducers';
import { Footer } from '../footer';
import { Header } from '../header';
import RightPanel from '../rightPanel';

export interface IMainProps {
    actions: {
        onSelectionChange: (selected: IExportModelData[]) => void;
    };
}

export function Main(props: IMainProps) {
    useEffect(() => {
        const selectService = getApplication().getService(ModelViewerSelectionService);
        const fittingDesignService = getApplication().getService(FittingDesignService);
        const watchSelectedModelChange = async (selected: ISelected) => {
            if (selected.type === ESelectedType.MODEL) {
                props.actions.onSelectionChange(selected.data as IExportModelData[]);
            } else if (selected.type === ESelectedType.CASBIN) {
                console.log(
                    '111111111111',
                    'casbin data',
                    await fittingDesignService.getConnectedFittingDesign(selected.data[0].id, true)
                );
            } else {
                props.actions.onSelectionChange([] as IExportModelData[]);
            }
            console.log('1111111111', 'model changed', selected);
        };
        // 当选择某块板件时，触发
        selectService.on(watchSelectedModelChange);

        const currentSelected = selectService.getSelected();
        watchSelectedModelChange(currentSelected);

        return () => {
            selectService.off(watchSelectedModelChange);
        };
    }, []);

    /** 注册快捷键 */
    useEffect(() => {
        document.onkeydown = function (e: KeyboardEvent) {
            let arrow: ECameraMoveDirection | undefined = undefined;
            switch (e.key) {
                case 'w':
                    arrow = ECameraMoveDirection.FRONT;
                    break;
                case 's':
                    arrow = ECameraMoveDirection.BACK;
                    break;
                case 'a':
                    arrow = ECameraMoveDirection.LEFT;
                    break;
                case 'd':
                    arrow = ECameraMoveDirection.RIGHT;
                    break;
                case 'q':
                    arrow = ECameraMoveDirection.UP;
                    break;
                case 'e':
                    arrow = ECameraMoveDirection.DOWN;
                    break;
            }
            if (arrow) {
                const cameraService = getApplication().getService(ModelCameraService);
                cameraService.moveCamera(arrow);
            }
        };
    }, []);

    return <AppLayout header={Header} footer={Footer} rightPanel={RightPanel} />;
}

export default connect(
    (state) => {
        return {};
    },
    (dispatch, props) => {
        return {
            actions: {
                onSelectionChange: async (selected: IExportModelData[]) => {
                    const fittingDesignService = getApplication().getService(FittingDesignService);
                    const modelId = selected.length ? selected[0].id : undefined;
                    // 获取当前选中的方案数据
                    const getSelectedFittingDesign = modelId
                        ? await fittingDesignService.getConnectedFittingDesign(modelId)
                        : await fittingDesignService.getFittingDesignData(modelId);

                    const selectedFittingDesign =
                        getSelectedFittingDesign !== null
                            ? getSelectedFittingDesign
                            : {
                                  grooves: {},
                                  hardwares: {},
                                  holes: {},
                                  hardwareGrooves: {},
                              };

                    const result: Partial<IAppSelection> = {
                        selected,
                        selectedFittingDesign,
                    };
                    dispatch(actionUpdateSelected(result));
                },
            },
        };
    }
)(Main);
