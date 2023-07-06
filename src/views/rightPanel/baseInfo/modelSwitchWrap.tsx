import Avatar from 'antd/es/avatar';
import Button from 'antd/es/button';
import Divider from 'antd/es/divider';
import message from 'antd/es/message';
import Pagination from 'antd/es/pagination';
import Select from 'antd/es/select';
import Paragraph from 'antd/es/typography/Paragraph';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { IParamModelPhotoResponse } from '@manycore/custom-miniapp-sdk';
import {
    FittingDesignService,
    IFittingDesignData,
    ITopParamModelDataResponse,
    ITopParamModelList,
    ModelService,
    ModelViewerService,
} from '@manycore/custom-sdk';

import { getApplication } from '../../../core/app';
import { getSubModels, mockFittingDesignData } from '../../../util';

const { Option } = Select;
const fittingDesignService = getApplication().getService(FittingDesignService);
const modelService = getApplication().getService(ModelService);

interface IModelSwitchProps {
    onChange: (id: string) => void;
}

interface IModelSwitchState {
    models: ITopParamModelList[];
    selectedModelIds: string[];
    jsons: string;
    intersected: string;
    fittingData: string;
    modelsResult: ITopParamModelDataResponse;
    pageNum: number;
    pageSize: number;
    selectedModelImgData: IParamModelPhotoResponse[];
}

export class ModelSwitchWrap extends Component<IModelSwitchProps, IModelSwitchState> {
    state: IModelSwitchState = {
        models: [],
        selectedModelIds: [],
        jsons: '',
        intersected: '',
        fittingData: '',
        pageNum: 1,
        pageSize: 2,
        modelsResult: {
            count: 0,
            currPage: 0,
            hasMore: false,
            result: [],
            totalPage: 0,
        },
        selectedModelImgData: [],
    };

    componentDidMount() {
        const { pageNum, pageSize } = this.state;
        this.getAllTopModelsList();
        this.getTopModels(pageNum, pageSize);
    }

    /**
     * 获取方案中所有顶层模型
     */
    protected getAllTopModelsList = async () => {
        let num = 1;
        const size = 2;
        let models: ITopParamModelList[] = [];
        const getModels = async (pageNum: number, pageSize: number) => {
            const modelData = await modelService.getTopParamModels({ pageNum, pageSize });
            models = [...models, ...modelData.result];
            if (modelData.hasMore) {
                num++;
                getModels(num, size);
            } else {
                this.setState({
                    models,
                });
            }
        };
        getModels(num, size);
    };

    private getTopModels = async (pageNum: number, pageSize: number) => {
        const modelData = await modelService.getTopParamModels({ pageNum, pageSize });
        this.setState({
            modelsResult: modelData,
        });
    };

    /**
     * 模型切换选择框回调
     * @param id
     */
    handleModelChange = async (id: string) => {
        const modelViewerService = getApplication().getService(ModelViewerService);
        await modelViewerService.viewModelById(id);
        this.props.onChange(id);
    };

    /**
     * 批量获取模型数据选择框change回调
     */
    handleMultipleModelChange = (ids: string[]) => {
        this.setState({
            selectedModelIds: ids,
        });
    };

    /**
     * 批量获取多个模型的数据
     */
    batchGetModelData = async () => {
        const { selectedModelIds } = this.state;
        const jsonData: any[] = [];
        const intersectedData: any[] = [];

        if (!selectedModelIds.length) {
            message.error('请选择模型!');
            return;
        }
        const modelsInfo = selectedModelIds.map(async (sm, idx) => {
            const json = await modelService.getParamData({ modelId: sm }).catch((e) => '');
            const intersected = await modelService
                .getParamIntersected({ modelId: sm })
                .catch((e) => '');
            return {
                json: {
                    [sm]: json,
                },
                intersected: {
                    [sm]: intersected,
                },
            };
        });
        const jsonAndIntersectedData = await Promise.allSettled(modelsInfo);
        jsonAndIntersectedData.map((d) => {
            if (d.status === 'fulfilled') {
                jsonData.push(d.value.json);
                intersectedData.push(d.value.intersected);
            }
        });
        this.setState({
            jsons: jsonData.length ? JSON.stringify(jsonData) : '',
            intersected: intersectedData.length ? JSON.stringify(intersectedData) : '',
        });
    };

    /**
     * 批量生成模型孔槽数据
     */
    batchSplit = async () => {
        const { selectedModelIds } = this.state;
        if (!selectedModelIds.length) {
            message.error('请选择模型!');
            return;
        }
        const batchSplitData = await Promise.all(
            selectedModelIds.map(async (m) => {
                const json = await modelService.getParamData({ modelId: m }).catch((e) => '');
                if (!json.paramModel.length) {
                    return;
                }
                const paramModel = getSubModels(json.paramModel);
                let allFittingDesign: IFittingDesignData = {
                    id: m,
                    holes: {},
                    grooves: {},
                    hardwares: {},
                    hardwareGrooves: {},
                };
                paramModel.forEach((sm) => {
                    allFittingDesign = mockFittingDesignData({
                        modelId: m,
                        fittingDesignData: allFittingDesign,
                        planeId: sm.id,
                    });
                });
                return allFittingDesign;
            })
        );

        await Promise.all(
            batchSplitData.map((it) => {
                return fittingDesignService.saveDesign(it);
            })
        );

        const result = await Promise.all(
            batchSplitData.map((it) => {
                return fittingDesignService.getFittingDesignData(it!.id);
            })
        );

        message.success('批量拆单完成!');
        this.setState({
            fittingData: result.length ? JSON.stringify(result) : '',
        });
    };

    /**
     * 批量清空孔槽数据
     */
    batchSplitClear = () => {
        const { selectedModelIds } = this.state;
        if (!selectedModelIds.length) {
            message.error('请选择模型!');
            return;
        }
        selectedModelIds.map(async (m) => {
            await fittingDesignService.clearDesign({ modelId: m });
        });
        message.success('所有数据清空完成!');
    };

    /**
     * pageSize切换回调
     * @param current
     * @param size
     */
    handleShowSizeChange = (current: number, size: number) => {
        this.setState({
            pageSize: size,
        });
        this.getTopModels(1, size);
    };

    /**
     * 页码change回调
     * @param page
     */
    handelPageChange = (page: number) => {
        this.setState({
            pageNum: page,
        });
        this.getTopModels(page, this.state.pageSize);
    };

    /**
     * 获取模型缩略图
     */
    getModelImg = async () => {
        const { selectedModelIds } = this.state;
        const selectedModelImgData = await modelService.getParamModelPhotoById(selectedModelIds);
        this.setState({ selectedModelImgData });
    };

    render() {
        const {
            models,
            jsons,
            intersected,
            fittingData,
            pageSize,
            modelsResult,
            selectedModelImgData,
        } = this.state;
        return (
            <Fragment>
                <Divider orientation="left">切换渲染模型</Divider>
                <Select
                    placeholder="选择模型"
                    style={{ width: 200 }}
                    onChange={this.handleModelChange}
                >
                    {modelsResult.result.map((m: ITopParamModelList, index) => {
                        return (
                            <Option value={m.id} key={index}>
                                {m.name}
                            </Option>
                        );
                    })}
                </Select>
                <Paragraph
                    disabled={!!modelsResult}
                    copyable={modelsResult ? { text: JSON.stringify(modelsResult) } : false}
                >
                    复制当前获取结果
                </Paragraph>
                <Pagination
                    defaultCurrent={1}
                    size="small"
                    defaultPageSize={pageSize}
                    total={modelsResult.count}
                    pageSizeOptions={['1', '2', '3', '5', '10']}
                    onShowSizeChange={this.handleShowSizeChange}
                    onChange={this.handelPageChange}
                    showSizeChanger
                />
                <Divider orientation="left">批量模型操作</Divider>
                <Select
                    placeholder="选择模型"
                    mode="multiple"
                    style={{ width: 200 }}
                    allowClear
                    onChange={this.handleMultipleModelChange}
                >
                    {models.map((m: ITopParamModelList, index) => {
                        return (
                            <Option value={m.id} key={index}>
                                {m.name}
                            </Option>
                        );
                    })}
                </Select>
                <Paragraph disabled={!!jsons} copyable={jsons ? { text: jsons } : false}>
                    复制JSON数据
                </Paragraph>
                <Paragraph
                    disabled={!!intersected}
                    copyable={intersected ? { text: intersected } : false}
                >
                    复制交界面数据
                </Paragraph>
                <Paragraph
                    disabled={!!fittingData}
                    copyable={fittingData ? { text: fittingData } : false}
                >
                    复制孔槽数据
                </Paragraph>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                    }}
                >
                    <Button type="primary" onClick={this.batchGetModelData} size="small">
                        批量获取
                    </Button>
                    <Button type="primary" onClick={this.batchSplit} size="small" ghost>
                        批量拆单
                    </Button>
                    <Button type="danger" onClick={this.batchSplitClear} size="small">
                        批量清空
                    </Button>
                </div>
                <div>
                    <Button type="primary" onClick={this.getModelImg} size="small">
                        获取缩略图
                    </Button>
                </div>
                <p>模型缩略图：</p>
                {selectedModelImgData.map((i: IParamModelPhotoResponse, index) => {
                    return (
                        <Avatar
                            shape="square"
                            size={64}
                            alt="No Image"
                            src={i.imgData}
                            key={index}
                        />
                    );
                })}
            </Fragment>
        );
    }
}

export default connect((state) => {})(ModelSwitchWrap);
