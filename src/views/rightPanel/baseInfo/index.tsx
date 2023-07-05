import {
    ModelService,
    IntersectedService,
    FittingDesignService,
    IFittingDesignData, IModelValidateResult, ModelValidateService, ModelHintService, IHintPlank,IGetModelIntersectedOption,EIntersectModelType,
    EProductDirection,
    EIntersectedInfoType
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
import { times, fromPairs } from 'lodash';
import { IExportModelData, IParamModelPhotoResponse } from '@manycore/custom-miniapp-sdk';
import { ModelSwitchWrap } from './modelSwitchWrap';
import {Avatar, Input,InputNumber, Select} from 'antd';
import { memoize } from 'lodash';

export interface IBaseInfoState {
    json: string;
    jsonData: IExportModelData[];
    // 元件稳定信息
    stableMap: Record<string, IModelValidateResult>;
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
    // 交接面/体阈值
    threshold: string;
    /**
    * 交接面基础配置
    */
    intersectedBaseConfig: Omit<IGetModelIntersectedOption, 'modelId'>;
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
    state: IBaseInfoState = {
        json: '',
        jsonData: [],
        intersected: '',
        showIntersected: false,
        lastView: false,
        plankFaceIds: fullFilled,
        modelImgData: [],
        stableMap: {},
        threshold:'0.1',
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
        const modelService = getApplication().getService(ModelService);
        const json = await modelService.getParamData({ modelId: mId }).catch((e) => {
            return {
                designData: []
            }
        });
        await this.requestIntersected({ modelId: mId }).catch((e) => '');
        const jsonData = json ? json.paramModel || [] : [];
        this.setState({
            stableMap: {},
            json: json ? JSON.stringify(json) : '',
            jsonData,
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

        // 检测模型稳定
        if (jsonData.length) {
            const modelValidateService = getApplication().getService(ModelValidateService);
            const result = (await Promise.all(
                jsonData.map((it: IExportModelData) =>
                    modelValidateService.stable({ modelId: it.id }).then((value) => {
                        return [it.id, value];
                    })
                )
            )) as Array<[string, IModelValidateResult]>;
            const data = fromPairs(result) as Record<string, IModelValidateResult>;
            this.setState({
                stableMap: data,
            });
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
        const { lastView, plankFaceIds } = this.state;

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
            lastView: !lastView,
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
        const { jsonData, modelImgData, stableMap } = this.state;
        if (!jsonData.length) {
            return null;
        }
        return jsonData.map((m: IExportModelData) => {
            const {
                modelName,
                id,
                size: { x, y, z },
                textureName,
            } = m;
            const stable = stableMap[id];
            let stableText = '--';
            if (stable) {
                stableText = `共${stable.total}个元件，有${stable.invalidateTotal}个元件ID不稳定;`;
            }
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
                    <div className={styles.descItem}>
                        <span>元件稳定</span>
                        <span>{stableText}</span>
                    </div>
                    <div>
                        <Button type="primary" size="small" style={{marginRight: '10px'}} onClick={ () => {this.hintUnStablePlank(id)}}>
                            高亮不稳定ID面
                        </Button>
                        <Button type="primary" size="small" ghost onClick={ () => {this.clearHintUnStablePlank()}}>
                            清除高亮
                        </Button>
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
     * 如果元件不稳定，点击可以高亮不稳定的元件ID
     * @param id
     */
    public hintUnStablePlank(id: string) {
        console.log('start hint',id);
        const state = this.state.stableMap[id];
        if (state && state.invalidateList.length) {
            const hintService = getApplication().getService(ModelHintService);
            const result = state.invalidateList.map((modelId) => {
                return [
                    modelId,
                    {
                        hintPlankFace: [
                            {
                                plankFaceId: Array.from({ length: 6 }).map((i, index) => index),
                                color: '#ffd400',
                                opacity: 0.3,
                            },
                        ],
                    },
                ] as [string, IHintPlank];
            });
            console.log('result',result);
            hintService.setModelHint(fromPairs(result));
        }
    }
    /**
     * 清空不稳定ID对应的板件高亮
     */
    public clearHintUnStablePlank() {
            const hintService = getApplication().getService(ModelHintService);
            hintService.clearModelHint();
    }

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

    handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            threshold: e.target.value,
        });
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

    private getFlattenModelList(models: IExportModelData[]) {
        const list: IExportModelData[] = [];
        const modelQueue = [...models];
        while (modelQueue.length) {
            const currentModel = modelQueue.shift()!;
            list.push(currentModel);
            if (currentModel.subModels && currentModel.subModels.length) {
                modelQueue.push(...currentModel.subModels);
            }
        }
        return list;
    }

    private getUniqueCategoryList(models: IExportModelData[]) {
        const modelList = this.memGetFlattenModelList(models);
        return [...new Set(modelList.map((m) => m.prodCatId).filter((cat) => !!cat))];
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

    
    private onInfoTypeChange = (checkedValues: EIntersectedInfoType[]) => {
        this.mergeIntersectedConfigState({ intersectedInfoType: checkedValues });
    };

    private renderIntersectConfig = () => {
        const {
            jsonData,
            intersectedBaseConfig: {
                faceDistTol,
                bodyDistTol,
                thicknessFilter,
                products = [],
                direction,
                tolerance,
                intersectedInfoType = [EIntersectedInfoType.SHELL],
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
                        {jsonData &&
                            this.getUniqueCategoryList(jsonData).map((category) => (
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
                <div style={{ fontWeight: 'bold', ...style }}>交接面</div>
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
                <div style={{ fontWeight: 'bold', ...style }}>交接体</div>
                <div style={style}>
                    交接体输出类型
                    <Checkbox.Group value={intersectedInfoType} onChange={this.onInfoTypeChange as any}>
                        <Checkbox value={EIntersectedInfoType.SHELL}>交接体</Checkbox>
                        <Checkbox value={EIntersectedInfoType.THROUGH_SHELL}>贯穿交接体</Checkbox>
                    </Checkbox.Group>
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
                <div style={style}>
                    通用阈值(废弃):
                    <InputNumber
                        size="small"
                        placeholder="0.1mm"
                        step={0.1}
                        min={0}
                        value={tolerance}
                        onChange={(e) =>
                            this.mergeIntersectedConfigState({ tolerance: e ? e : undefined })
                        }
                    />
                </div>
                <Button
                    type="primary"
                    size="small"
                    onClick={() =>
                        this.requestIntersected({
                            ...this.state.intersectedBaseConfig
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
                    交接面阈值(mm):
                    <Input
                        style={{ width: '25%', marginLeft: '5px' }}
                        placeholder="0.1mm"
                        value={ this.state.threshold }
                        onChange={(e) => this.handleThresholdChange(e)}
                    />
                    <Button
                        type="primary"
                        onClick={() => this.handelModelChange}
                        size="small"
                        style={{marginLeft: '10px'}}
                    >
                        保存
                    </Button>
                    <div>注意：保存后需要”切换渲染模型“生效</div>
                    <Divider></Divider>
                    <Paragraph
                        disabled={!!fittingDesign}
                        copyable={fittingDesign ? { text: fittingDesign } : false}
                    >
                        复制孔槽方案数据
                    </Paragraph>
                </div>
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
