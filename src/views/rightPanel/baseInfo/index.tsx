import { IExportModelData, IParamModelPhotoResponse } from '@manycore/custom-miniapp-sdk';
import {
    ModelService,
    IntersectedService,
    FittingDesignService,
    IFittingDesignData,
    IGetModelIntersectedOption,
    IParamModelLite,
    CustomModelService,
    EIntersectModelType,
    EProductDirection,
} from '@manycore/custom-sdk';
import Avatar from 'antd/es/avatar';
import Button from 'antd/es/button/button';
import Checkbox from 'antd/es/checkbox';
import Divider from 'antd/es/divider';
import Icon from 'antd/es/icon';
import Radio, { RadioChangeEvent } from 'antd/es/radio';
import Paragraph from 'antd/es/typography/Paragraph';
import { times } from 'lodash';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getApplication } from '../../../core/app';
import { actionUpdateSelected } from '../../../store/selection/action';
import styles from '../index.module.scss';
import FittingDataWrap from './fittingDataWrap';
import { ModelSwitchWrap } from './modelSwitchWrap';
import { InputNumber, Select } from 'antd';
import { memoize } from 'lodash';

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
    /**
    * 交接面基础配置
    */
    intersectedBaseConfig: Omit<IGetModelIntersectedOption, 'modelId'>;
    /**
     * 模型数据
     */
    modelData?: IParamModelLite;
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
const fullFilled: number[] = times(7);

export class BaseInfo extends PureComponent<IBaseInfoProps, IBaseInfoState> {
    state: IBaseInfoState= {
        json: '',
        intersected: '',
        showIntersected: false,
        lastView: false,
        plankFaceIds: fullFilled,
        modelImgData: [],
        intersectedBaseConfig: {},
    };


    private requestIntersected = async (option: IGetModelIntersectedOption) => {
        const modelService = getApplication().getService(ModelService);
        const intersected = await modelService.getParamIntersected({ ...option }).catch((e) => '');
        this.setState({
            intersected: intersected ? JSON.stringify(intersected) : '',
        });
    };

    private init = async (mId?: string) => {
        if (mId) {
            const customModelService = getApplication().getService(CustomModelService);
            const model = await customModelService.getCustomModelById(mId);
            this.setState({
                modelData: model,
            });
        }
        const modelService = getApplication().getService(ModelService);
        const json = await modelService.getParamData({ modelId: mId }).catch((e) => '');

        this.setState({
            json: json ? JSON.stringify(json) : '',
        });

        // 加载孔槽数据
        const fittingDesignService = getApplication().getService(FittingDesignService);
        const fittingResult = await fittingDesignService.getConnectedFittingDesign(
            undefined,
            false
        );
        const modelId = json.designData.paramModelIds;
        const modelImgData = await modelService.getParamModelPhotoById(modelId);
        this.setState({
            modelImgData,
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

    private mergeIntersectedConfigState = (
        newConfig: Partial<IBaseInfoState['intersectedBaseConfig']>
    ) => {
        this.setState((prevState) => {
            const { intersectedBaseConfig } = prevState;
            return {
                intersectedBaseConfig: {
                    ...intersectedBaseConfig,
                    ...newConfig,
                },
            };
        });
    };

    memGetFlattenModelList = memoize(this.getFlattenModelList);

    private getFlattenModelList(model: IParamModelLite) {
        const list: IParamModelLite[] = [];
        const modelQueue = [model];
        while (modelQueue.length) {
            const currentModel = modelQueue.shift()!;
            list.push(currentModel);
            modelQueue.push(...currentModel.getChild(), ...currentModel.getAccessory());
        }
        return list;
    }

    private getUniqueCategoryList(model: IParamModelLite) {
        const modelList = this.memGetFlattenModelList(model);
        return Array.from(new Set(modelList.filter((m) => true).map((m) => m.category)));
    }

    private getButtonType = (modelType: EIntersectModelType) => {
        return this.state.intersectedBaseConfig.computeModelTypes?.includes(modelType)
            ? 'primary'
            : 'default';
    };

    private onModelTypeButtonClick = (modelType: EIntersectModelType) => {
        const computeModelTypes = this.state.intersectedBaseConfig.computeModelTypes || [];
        const newModelType = [...computeModelTypes];
        const index = newModelType.indexOf(modelType);
        if (index > -1) {
            newModelType.splice(index, 1);
        } else {
            newModelType.push(modelType);
        }
        return this.mergeIntersectedConfigState({
            computeModelTypes: newModelType.length ? newModelType : undefined,
        });
    };

    private onClickModelDirection = (clickDirection: EProductDirection) => {
        const {
            intersectedBaseConfig: { direction },
        } = this.state;
        let newDirection: EProductDirection | undefined = clickDirection;
        if (newDirection === direction) {
            newDirection = undefined;
        }
        this.mergeIntersectedConfigState({ direction: newDirection });
    };

    private renderIntersectConfig = () => {
        const {
            modelData,
            intersectedBaseConfig: {
                faceDistTol,
                bodyDistTol,
                thicknessFilter,
                products = [],
                direction,
            },
        } = this.state;
        const style = { marginBottom: '5px' };
        return (
            <>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>交接面/体 输入参数</span>
                </div>
                <div style={{ fontWeight: 'bold' }}>交接对象配置</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px' }}>
                    <Button
                        size="small"
                        onClick={() => this.onModelTypeButtonClick(EIntersectModelType.PLANK)}
                        type={this.getButtonType(EIntersectModelType.PLANK)}
                    >
                        板件
                    </Button>
                    <Button
                        size="small"
                        onClick={() => this.onModelTypeButtonClick(EIntersectModelType.HARDWARE)}
                        type={this.getButtonType(EIntersectModelType.HARDWARE)}
                    >
                        五金
                    </Button>
                    <Button
                        size="small"
                        onClick={() => this.onModelTypeButtonClick(EIntersectModelType.PRODUCT)}
                        type={this.getButtonType(EIntersectModelType.PRODUCT)}
                    >
                        商品
                    </Button>
                </div>
                <div style={style}>
                    输入商品真分类:
                    <InputNumber
                        size="small"
                        style={{ width: '50%', marginLeft: '5px' }}
                        value={products[0] ? products[0].category : undefined}
                        onChange={(e) =>
                            this.mergeIntersectedConfigState({
                                products: e ? [{ category: e }] : undefined,
                            })
                        }
                    />
                </div>
                <div>
                    参与计算商品(多选):
                    <Select
                        size="small"
                        style={{ width: '50%', marginLeft: '5px' }}
                        mode="multiple"
                        allowClear
                        value={products?.map((p) => p.category)}
                        onChange={(value: number[]) =>
                            this.mergeIntersectedConfigState({
                                products: value.length
                                    ? value.map((v) => ({ category: v }))
                                    : undefined,
                            })
                        }
                    >
                        {modelData &&
                            this.getUniqueCategoryList(modelData).map((category) => (
                                <Select.Option key={category} value={category}>
                                    {category}
                                </Select.Option>
                            ))}
                    </Select>
                </div>
                <div style={style}>
                    选择商品建模方向
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            margin: '5px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div
                            className={styles.imgContainer}
                            onClick={() => this.onClickModelDirection(EProductDirection.XY)}
                        >
                            <Checkbox
                                className={styles.checkBox}
                                checked={direction === EProductDirection.XY}
                            />
                            <img src="https://qhstaticssl.kujiale.com/image/png/1654853270425/F4A5F2E4DFE9C800C630EBA2B371BCBB.png" />
                        </div>
                        <div
                            className={styles.imgContainer}
                            onClick={() => this.onClickModelDirection(EProductDirection.YZ)}
                        >
                            <Checkbox
                                className={styles.checkBox}
                                checked={direction === EProductDirection.YZ}
                            />
                            <img src="https://qhstaticssl.kujiale.com/image/png/1654853811817/373186B3E0526320E0E074526F014D13.png" />
                        </div>
                        <div
                            className={styles.imgContainer}
                            onClick={() => this.onClickModelDirection(EProductDirection.XZ)}
                        >
                            <Checkbox
                                className={styles.checkBox}
                                checked={direction === EProductDirection.XZ}
                            />
                            <img src="https://qhstaticssl.kujiale.com/image/png/1654853790413/A0B6281548E5BD6DE5FF9E84B103A395.png" />
                        </div>
                    </div>
                </div>

                <div style={{ fontWeight: 'bold', ...style }}>判断逻辑配置</div>
                <div style={style}>
                    不足板厚的交接面是否输出
                    <Radio.Group
                        onChange={(v) =>
                            this.mergeIntersectedConfigState({ thicknessFilter: v.target.value })
                        }
                        value={thicknessFilter}
                    >
                        <Radio value={true}>否</Radio>
                        <Radio value={false}>是</Radio>
                    </Radio.Group>
                </div>
                <div style={{ fontWeight: 'bold', ...style }}>计算阈值配置</div>
                <div style={style}>
                    交接面阈值(mm):
                    <InputNumber
                        size="small"
                        placeholder="0.1mm"
                        step={0.1}
                        min={0}
                        value={faceDistTol}
                        onChange={(e) =>
                            this.mergeIntersectedConfigState({ faceDistTol: e ? e : undefined })
                        }
                    />
                </div>
                <div style={style}>
                    交接体阈值(mm):
                    <InputNumber
                        size="small"
                        placeholder="0.1mm"
                        step={0.1}
                        min={0}
                        value={bodyDistTol}
                        onChange={(e) =>
                            this.mergeIntersectedConfigState({ bodyDistTol: e ? e : undefined })
                        }
                    />
                </div>
                <Button
                    type="primary"
                    size="small"
                    onClick={() =>
                        this.requestIntersected({
                            ...this.state.intersectedBaseConfig,
                            modelId: modelData?.id,
                        })
                    }
                >
                    计算交接体/面
                </Button>
                <Divider />
            </>
        );
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
                {this.renderIntersectConfig()}
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
