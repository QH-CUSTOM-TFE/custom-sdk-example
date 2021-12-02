import {
    ModelService,
    IntersectedService,
    FittingDesignService,
    IFittingDesignData,
} from '@manycore/custom-sdk';
import React, { PureComponent } from 'react';
import { getApplication } from '../../../core/app';
import { actionUpdateSelected } from '../../../store/selection/action';
import styles from '../index.module.scss';
import Icon from 'antd/lib/icon';
import Divider from 'antd/lib/divider';
import Paragraph from 'antd/lib/typography/Paragraph';
import Radio, { RadioChangeEvent } from 'antd/lib/radio';
import Button from 'antd/lib/button/button';
import { connect } from 'react-redux';
import FittingDataWrap from './fittingDataWrap';
import Checkbox from 'antd/lib/checkbox';
import { times } from 'lodash';
import { IExportModelData, IParamModelPhotoResponse } from '@manycore/custom-miniapp-sdk';
import { ModelSwitchWrap } from './modelSwitchWrap';
import { Avatar } from 'antd';

export interface IBaseInfoState {
    json: string;
    // 交接面信息
    intersected: string;
    /**
     * 是否显示交接面
     */
    showIntersected: boolean;
    /**
     * 当为false，即显示第一组数据，为true，则显示第二组数据
     */
    lastView: boolean;

    plankFaceIds: number[];
    /**
     * 当前选中模型缩略图
     */
    modelImgData: IParamModelPhotoResponse[];
}

export interface IBaseInfoProps {
    fittingDesign?: string;
    loadFittingDesignSuccess(fitting: IFittingDesignData): void;
}

const availableOptions = times(7, (i) => {
    return {
        label: i === 6 ? '空板面' : i,
        value: i,
    };
});
const fullFilled: Array<number> = times(7);

export class BaseInfo extends PureComponent<IBaseInfoProps, IBaseInfoState> {
    state = {
        json: '',
        intersected: '',
        showIntersected: false,
        lastView: false,
        plankFaceIds: fullFilled,
        modelImgData: [],
    };

    private init = async (mId?: string) => {
        const modelService = getApplication().getService(ModelService);
        const json = await modelService.getParamData({ modelId: mId }).catch((e) => {
            return {
                designData: []
            }
        });
        const intersected = await modelService
            .getParamIntersected({ modelId: mId })
            .catch((e) => '');
        this.setState({
            json: json ? JSON.stringify(json) : '',
            intersected: intersected ? JSON.stringify(intersected) : '',
        });

        // 加载孔槽数据
        const fittingDesignService = getApplication().getService(FittingDesignService);
        const fittingResult = await fittingDesignService.getFittingDesignData();

        const modelId = json.designData.paramModelIds;
        const modelImgData = await modelService.getParamModelPhotoById(modelId);
        this.setState({
            modelImgData: modelImgData,
        });
        if (fittingResult) {
            this.props.loadFittingDesignSuccess(fittingResult);
        }
    };

    componentDidMount() {
        this.init();
    }

    /**
     * 显示或隐藏交接面信息
     * @param event
     */
    protected toggleViewIntersected = (event: RadioChangeEvent) => {
        const viewService = getApplication().getService(IntersectedService);
        viewService.toggleModelViewIntersected(event.target.value);
        this.setState({
            showIntersected: event.target.value,
        });
    };

    /**
     *
     * @param event
     */
    protected toggleViewIntersectIndex = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        const viewService = getApplication().getService(IntersectedService);
        let { lastView, plankFaceIds } = this.state;
        lastView = !lastView;
        viewService.toggleModelViewedIntersected({
            references: lastView,
            plankFaceIds: plankFaceIds.map((i) => {
                if (i === 6) {
                    return null;
                }
                return i;
            }),
        });
        this.setState({
            lastView,
        });
    };

    protected filterIntersectedByPlankFace = (plankFaceIds: number[]) => {
        const { lastView } = this.state;
        this.setState({
            plankFaceIds,
        });
        const viewService = getApplication().getService(IntersectedService);
        viewService.toggleModelViewedIntersected({
            references: lastView,
            plankFaceIds: plankFaceIds.map((i) => {
                if (i === 6) {
                    return null;
                }
                return i;
            }),
        });
    };

    /**
     * 模型基础数据渲染
     */
    protected renderModelBaseInfo() {
        const { json, modelImgData } = this.state;
        if (!json) {
            return null;
        }
        const models = JSON.parse(json).paramModel ?? [];
        if (!models.length) {
            return null;
        }
        return models.map((m: IExportModelData) => {
            const {
                modelName,
                id,
                size: { x, y, z },
                textureName,
            } = m;
            return (
                <>
                    <div className={styles.descItem}>
                        <span>名称</span>
                        <span>{modelName}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>模型ID</span>
                        <span>{id}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>宽</span>
                        <span>{x}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>高</span>
                        <span>{y}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>深</span>
                        <span>{z}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>材质</span>
                        <span>{textureName}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>缩略图</span>
                        <Avatar
                            shape="square"
                            size={64}
                            alt="No Image"
                            src={this.getImgDataById(modelImgData, id)}
                        />
                    </div>
                    <Divider />
                </>
            );
        });
    }

    protected renderIntersectedAction = () => {
        const { lastView, plankFaceIds } = this.state;

        return (
            <div style={{ marginBottom: 10 }}>
                <Button type="default" onClick={this.toggleViewIntersectIndex}>
                    切换数据源展示({lastView ? '第二组' : '第一组'})
                </Button>
                <Checkbox.Group
                    value={plankFaceIds}
                    options={availableOptions}
                    onChange={this.filterIntersectedByPlankFace as any}
                />
            </div>
        );
    };

    /**
     * 模型切换回调
     * @param id
     */
    handelModelChange = async (id: string) => {
        this.init(id);
    };

    /**
     * 获取指定模型的缩略图
     * @param modelImgData
     * @param id
     * @returns
     */
    private getImgDataById = (modelImgData: IParamModelPhotoResponse[], id: string) => {
        const modelData: IParamModelPhotoResponse | undefined = modelImgData.find(
            (m: IParamModelPhotoResponse) => m.modelId === id
        );
        if (modelData) {
            return (modelData as IParamModelPhotoResponse).imgData;
        }
        return;
    };

    render() {
        const { fittingDesign } = this.props;
        const { json, intersected, showIntersected } = this.state;

        return (
            <div>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>模型批量操作</span>
                </div>
                <ModelSwitchWrap onChange={this.handelModelChange} />
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>模型基础信息</span>
                </div>
                {this.renderModelBaseInfo()}
                <div>
                    <Paragraph disabled={!!json} copyable={json ? { text: json } : false}>
                        复制JSON数据
                    </Paragraph>
                    <Radio.Group onChange={this.toggleViewIntersected} value={showIntersected}>
                        <Radio value={false}>隐藏交接面/体</Radio>
                        <Radio value={true}>显示交接面/体</Radio>
                    </Radio.Group>
                    {showIntersected && this.renderIntersectedAction()}
                    <Paragraph
                        disabled={!!intersected}
                        copyable={intersected ? { text: intersected } : false}
                    >
                        复制交接面信息
                    </Paragraph>
                    <Paragraph
                        disabled={!!fittingDesign}
                        copyable={fittingDesign ? { text: fittingDesign } : false}
                    >
                        复制孔槽方案数据
                    </Paragraph>
                </div>
                <Divider />
                <FittingDataWrap />
            </div>
        );
    }
}

export default connect(
    (state) => {
        const fittingDesign = state.selection.fullFittingDesign;
        return {
            fittingDesign: fittingDesign ? JSON.stringify(fittingDesign) : '',
        };
    },
    (dispatch, props) => {
        return {
            loadFittingDesignSuccess(fitting: IFittingDesignData) {
                dispatch(
                    actionUpdateSelected({
                        fullFittingDesign: fitting,
                    })
                );
            },
        };
    }
)(BaseInfo);
