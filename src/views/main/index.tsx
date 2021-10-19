import { IExportModelData } from '@manycore/custom-miniapp-sdk';
import {
    ESelectedType,
    FittingDesignService,
    ISelected,
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
                    // 获取当前选中的方案数据
                    const getSelectedFittingDesign = await fittingDesignService.getConnectedFittingDesign(
                        selected.length ? selected[0].id : undefined
                    );

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
                        selected: selected,
                        selectedFittingDesign: selectedFittingDesign,
                    };
                    dispatch(actionUpdateSelected(result));
                },
            },
        };
    }
)(Main);
