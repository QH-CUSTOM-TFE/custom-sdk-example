import {
    EFittingType,
    FittingDesignService,
    IFittingDesignData,
} from '@manycore/custom-sdk';
import React, { PureComponent } from 'react';
import { getApplication } from '../../../core/app';
import { actionUpdateSelected } from '../../../store/selection/action';
import { FittingData } from '../fittingData';
import { connect } from 'react-redux';
import Button from 'antd/lib/button';
import { random } from 'lodash';
import { IExportModelData } from '@manycore/custom-miniapp-sdk';

const fittingDesignService = getApplication().getService(FittingDesignService);
const text = '新增';

export interface IPlateFittingDataWrapProps {
    selected: IExportModelData;
    selectedFittingDesign?: Partial<IFittingDesignData> | null;
    reloadFittingDesign: () => Promise<any>;
}

export interface IPlateFittingDataWrapState {
    fittingDesign?: Partial<IFittingDesignData> | null;
}

export class PlateFittingDataWrap extends PureComponent<
    IPlateFittingDataWrapProps,
    IPlateFittingDataWrapState
> {
    public state = {
        fittingDesign: undefined,
    };

    // 新增
    protected onAppend = async (fitting: Partial<IFittingDesignData>) => {
        await fittingDesignService.appendFittingDesign(fitting);
        // 重新获取完整五金信息，并反写到存储逻辑当中
        await this.props.reloadFittingDesign();
    };

    // 清空
    protected onClear = async () => {};

    // 生成随机默认数据
    protected generateRandomValue = (reset: boolean) => {
        return () => {
            const selected = this.props.selected;
            const holeId = random(1000000000, 10000000000).toString();
            const grooveId = random(1000000000, 10000000000).toString();
            let defaultValue: IFittingDesignData = {
                holes: {
                    [selected.id]: [
                        {
                            id: holeId,
                            fittingType: EFittingType.HOLE,
                            params: [],
                            depth: 20,
                            diameter: 20,
                            plankFaceId: 0,
                            start: {
                                x: -100,
                                y: 0,
                                z: 20,
                            },
                            end: {
                                x: 100,
                                y: 0,
                                z: 20,
                            },
                        },
                    ],
                },
                grooves: {
                    [selected.id]: [
                        {
                            id: grooveId,
                            fittingType: EFittingType.GROOVE,
                            params: [],
                            depth: 20,
                            width: 20,
                            plankFaceId: 0,
                            start: {
                                x: 300,
                                y: 0,
                                z: 20,
                            },
                            end: {
                                x: 100,
                                y: 0,
                                z: 20,
                            },
                        },
                    ],
                },
                hardwares: {
                    [selected.id]: [
                        {
                            id: random(1000000000, 10000000000).toString(),
                            position: {
                                x: 0,
                                y: -52,
                                z: 9,
                            },
                            rotate: {
                                x: 0,
                                y: 0,
                                z: 0,
                            },
                            scale: {
                                x: 1,
                                y: 1,
                                z: 1,
                            },
                            fittingType: EFittingType.HARDWARE,
                            brandGoodId: '3FO4GB757RQ1',
                            linkedIds: [grooveId],
                        },
                        {
                            id: random(1000000000, 10000000000).toString(),
                            position: {
                                x: 0,
                                y: -448,
                                z: 9,
                            },
                            rotate: {
                                x: 0,
                                y: 0,
                                z: 0,
                            },
                            scale: {
                                x: 1,
                                y: 1,
                                z: 1,
                            },
                            fittingType: EFittingType.HARDWARE,
                            brandGoodId: '3FO4GB757RQ1',
                            linkedIds: [holeId],
                        },
                    ],
                },
            };
            if (reset) {
                defaultValue = {
                    holes: {
                        [selected.id]: [],
                    },
                    grooves: {
                        [selected.id]: [],
                    },
                    hardwares: {
                        [selected.id]: [],
                    },
                };
            }
            this.setState({
                fittingDesign: defaultValue,
            });
        };
    };

    protected async getPlatFittingDesign() {
        const { selected } = this.props;
        const result = await fittingDesignService.getConnectedFittingDesign(selected.id);
        this.setState({
            fittingDesign: result,
        });
    }

    async componentDidMount() {
        this.getPlatFittingDesign();
    }

    componentDidUpdate(
        prevProps: Readonly<IPlateFittingDataWrapProps>,
        prevState: Readonly<IPlateFittingDataWrapState>,
        snapshot?: any
    ) {
        if (prevProps.selected !== this.props.selected && this.props.selected) {
            this.getPlatFittingDesign();
        }
    }

    render() {
        const { fittingDesign } = this.state;

        return (
            <div>
                <div>
                    <Button type="default" onClick={this.generateRandomValue(false)}>
                        生成随机数据
                    </Button>
                    <Button type="default" onClick={this.generateRandomValue(true)}>
                        重置
                    </Button>
                </div>
                <FittingData onSave={this.onAppend} value={fittingDesign as any} text={text} />
            </div>
        );
    }
}

export default connect(
    (state) => ({
        selected: state.selection.selected[0],
        selectedFittingDesign: state.selection.selectedFittingDesign,
    }),
    (dispatch, props) => {
        return {
            reloadFittingDesign: async () => {
                const design = await fittingDesignService.getConnectedFittingDesign();
                dispatch(
                    actionUpdateSelected({
                        fullFittingDesign: design,
                    })
                );
            },
        };
    }
)(PlateFittingDataWrap);
