import { FittingDesignService, IFittingDesignData } from '@manycore/custom-sdk';
import React, { PureComponent } from 'react';
import { getApplication } from '../../../core/app';
import { actionUpdateSelected } from '../../../store/selection/action';
import { FittingData } from '../fittingData';
import { connect } from 'react-redux';
import Button from 'antd/lib/button';
import { IExportModelData } from '@manycore/custom-miniapp-sdk';
import { mockFittingDesignData } from '../../../util';

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
            let defaultValue: IFittingDesignData = mockFittingDesignData({ planeId: selected.id });
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
                    hardwareGrooves: {
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
