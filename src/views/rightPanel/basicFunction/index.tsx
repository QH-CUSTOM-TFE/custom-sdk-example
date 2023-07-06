import { MiniAppDesignFloorPlanService } from '@manycore/custom-miniapp-sdk';
import {
    ECameraMoveDirection,
    ESelectedType,
    ESetSelectType,
    IHintPlank,
    ModelCameraService,
    ModelHintService,
    ModelViewerSelectionService,
    ModelViewerService,
    EElementType,
    FittingHintService,
    IHintBase,
    IHintFitting, IPlankArea,
    ModelViewerSelectionV2Service,
    PlankPathService,
} from '@manycore/custom-sdk';
import Button from 'antd/es/button';
import Collapse from 'antd/es/collapse';
import Divider from 'antd/es/divider';
import Input from 'antd/es/input';
import Modal from 'antd/es/modal';
import Select from 'antd/es/select';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';

import { getApplication } from '../../../core/app';
import style from './index.module.scss';

const { Panel } = Collapse;
const { Option } = Select;

const MODEL_TYPE_OPTION = [
    {
        label: '模型',
        value: ESetSelectType.MODEL,
    },
    {
        label: '五金',
        value: ESetSelectType.CASBIN,
    },
];

let displayPlankAreaCash: IPlankArea | undefined = undefined; // 存储实际展示的轮廓数据，用于高亮一键清除
const colors = [
    '#ff0000',
    '#ff8400',
    '#fff200',
    '#2ba801',
    '#00ffa6',
    '#00ffff',
    '#0053ff',
    '#5900ff',
    '#bc00ff',
    '#ff0084',
];

interface IState {
    modelIdValue: string;
    setSelectType: ESetSelectType;
}

export class BasicFunction extends PureComponent<{}, IState> {
    state = {
        modelIdValue: '',
        setSelectType: ESetSelectType.MODEL,
    };
    /**
     * 通用能力相关api列表
     * 只需要提供btn对应的click方法即可
     * api的结果展示需要x显示调用 this.showApiResultInfo(result);
     * 当前也可以自定义按钮或者其他的元素
     */
    private commonApiList = [
        {
            text: '房间列表',
            onClick: () => this.getRoomList,
        },
        {
            text: '当前房间',
            onClick: () => this.getCurrRoomInfo,
        },
    ];

    /**
     * 获取方案中所有房间列表信息
     */
    private getRoomList = async () => {
        const floorPlanService = getApplication().getCustomMiniAppServiceUnSafe(
            MiniAppDesignFloorPlanService
        );
        const roomList = await floorPlanService.getDesignRoomList();
        this.showApiResultInfo(roomList);
    };

    /**
     * 获取当前所在房间信息
     */
    private getCurrRoomInfo = async () => {
        const floorPlanService = getApplication().getCustomMiniAppServiceUnSafe(
            MiniAppDesignFloorPlanService
        );
        const currRoomInfo = await floorPlanService.getDesignSelectedRoom();
        this.showApiResultInfo(currRoomInfo);
    };

    private hintSelectModel = (option: IHintPlank) => {
        const selectionService = getApplication().getService(ModelViewerSelectionService);
        const hintService = getApplication().getService(ModelHintService);
        return () => {
            const selected = selectionService.getSelected();
            if (selected && selected.type === ESelectedType.MODEL) {
                const m = selected.data[0];
                hintService.setModelHint({
                    [m.id]: option,
                });
            }
        };
    };

    private hintSelectFitting = (option: IHintFitting) => {
        const fittingHintService = getApplication().getService(FittingHintService);
        const selectionService = getApplication().getService(ModelViewerSelectionV2Service);
        return () => {
            const selected = selectionService.getSelected();
            if (
                selected.every((s) =>
                    [
                        EElementType.GROOVE,
                        EElementType.HOLE,
                        EElementType.HARDWARE_GROOVE,
                        EElementType.HARDWARE,
                    ].includes(s.type)
                )
            ) {
                selected.forEach((s) => {
                    fittingHintService.setFittingHint({
                        [s.id]: option,
                    });
                });
            }
        };
    };

/*    private hintSelectFittingHardware = (option: IHintBase) => {
        const fittingHintService = getApplication().getService(FittingHintService);
        const selectionService = getApplication().getService(ModelViewerSelectionV2Service);
        return () => {
            const selected = selectionService.getSelected();
            if (
                selected.every((s) =>
                    [
                        EElementType.GROOVE,
                        EElementType.HOLE,
                        EElementType.HARDWARE_GROOVE,
                        EElementType.HARDWARE,
                    ].includes(s.type)
                )
            ) {
                selected.forEach((s) => {
                    fittingHintService.setFittingHardwareHint({
                        [s.id]: option,
                    });
                });
            }
        };
    };

    /*private cancelFittingHardwareHint = () => {
        const fittingHintService = getApplication().getService(FittingHintService);
        fittingHintService.clearFittingHardwareHint();
    };*/

    private hintClear = () => {
        const hintService = getApplication().getService(ModelHintService);
        hintService.clearModelHint();
    };

    /**
     * 取消模型选中
     */
    unSelectModel = () => {
        const selectService = getApplication().getService(ModelViewerSelectionService);
        selectService.unSelect();
    };

    /**
     * 根据模型ID及type选中模型
     */
    selectModel = () => {
        const selectService = getApplication().getService(ModelViewerSelectionService);
        const { modelIdValue, setSelectType } = this.state;
        if (!modelIdValue) {
            return;
        }
        const selectOption = {
            id: modelIdValue,
            type: setSelectType,
        };
        selectService.select(selectOption);
    };

    handleModelIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            modelIdValue: e.target.value,
        });
    };

    handleMoveCamera = (dir: ECameraMoveDirection) => {
        const cameraService = getApplication().getService(ModelCameraService);
        cameraService.moveCamera(dir);
    };

    /**
     * api调用结果显示弹窗
     * @param data
     */
    showApiResultInfo = (result: any) => {
        Modal.info({
            title: 'API 执行结果',
            width: 600,
            mask: false,
            content: <section>{result ? JSON.stringify(result) : result + ''}</section>,
        });
    };
    /**
     * 获取json数据中的板件id、轮廓数据
     */
    private getPlankDataFromJson = (jsonData: any) => {
        // 板件是模型树的最后一级 没有children，所以需要不断的往下找subModels，直到当前层级没有subModels这个字段
        let plankModelData = jsonData;
        while (plankModelData.subModels) {
            plankModelData = plankModelData.subModels[0];
        }
        // console.log('plankModel.paramPlankPath',plankModelData.paramPlankPath);
        return {
            modelId: plankModelData.id,
            plankPathData: {
                path: plankModelData.paramPlankPath.path,
                holes: plankModelData.paramPlankPath.holes,
            },
        };
    };

    /**
     * 异形板件标识
     */
    private hintPlankModel = () => {
        const selectionService = getApplication().getService(ModelViewerSelectionService);
        const plankPathService = getApplication().getService(PlankPathService);
        return async () => {
            this.hintPlankClear(); // 清除上一次高亮，否则颜色会不断叠加
            const selected = selectionService.getSelected();
            if (selected && selected.type === ESelectedType.MODEL) {
                // #1.获取鼠标选中模型的json数据，取出轮廓数据和板件ID
                const jsonData = selected.data[0];
                const { modelId, plankPathData } = this.getPlankDataFromJson(jsonData);
                // #2.解析轮廓原始数据
                // modelID传顶层模型or其他非底层模型的id，最后都没有高亮效果
                const plankArea = plankPathService.parseModelPlankPath({
                    modelID: modelId,
                    data: plankPathData,
                });
                // #3.对轮廓原始数据进行计算，生成实际展示的轮廓数据 (原始数据中可能存在板件外轮廓和挖洞重合、挖洞与挖洞重合、非直角端点等情况)
                const displayPlankArea = plankArea.getRealPaths(); // @param force? 忽略缓存
                displayPlankAreaCash = displayPlankArea; // 记录当前高亮的数据，用于高亮清除
                console.log('plankArea.getRealPaths()', displayPlankArea);
                // #4.为轮廓下的所有点、线添加高亮配置
                displayPlankArea.paths.forEach((d) => {
                    // if (d.type === EPlankPathType.INNER) {  // 加了这个约束，可以实现仅高亮内部or外部洞
                    d.points.forEach((p, index) => {
                        p.setHint({
                            color: '#d5d5d5',
                            opacity: 1.0,
                        });
                    });
                    d.lines.forEach((l, index) => {
                        l.setHint({
                            color: colors[index % 10],
                            opacity: 1.0,
                        });
                    });
                    // }
                });
                // #5.将修改后的轮廓数据保存到渲染场景中
                plankPathService.syncModelPlankPath(displayPlankArea);
            }
        };
    };

    /**
     * 清空异形板面高亮
     */
    private hintPlankClear = () => {
        const plankPathService = getApplication().getService(PlankPathService);
        if (displayPlankAreaCash && displayPlankAreaCash.paths) {
            displayPlankAreaCash.paths.forEach((d) => {
                d.points.forEach((p) => {
                    p.clearHint();
                });
                d.lines.forEach((l) => {
                    l.clearHint();
                });
            });
            // 将修改后的轮廓数据保存到渲染场景中
            plankPathService.syncModelPlankPath(displayPlankAreaCash);
        }
        displayPlankAreaCash = undefined;
    };

    refreshModel = () => {
        const viewerService = getApplication().getService(ModelViewerService);
        viewerService.refreshModel();
    };

    render() {
        return (
            <Fragment>
                <Collapse defaultActiveKey={['model', 'api']}>
                    <Panel header="模型相关" key="model">
                        <section className={style.btnContainer}>
                            <Divider>模型自动选中</Divider>
                            <Input.Group compact style={{ paddingBottom: '5px' }}>
                                <Select
                                    value={this.state.setSelectType}
                                    style={{ width: '35%' }}
                                    onChange={(v: ESetSelectType) => {
                                        this.setState({ setSelectType: v });
                                    }}
                                >
                                    {MODEL_TYPE_OPTION.map((m) => {
                                        return <Option value={m.value}>{m.label}</Option>;
                                    })}
                                </Select>
                                <Input
                                    style={{ width: '65%' }}
                                    placeholder="输入模型/五金ID"
                                    value={this.state.modelIdValue}
                                    onChange={(e) => this.handleModelIdChange(e)}
                                />
                            </Input.Group>
                            <Button
                                type="primary"
                                onClick={() => this.selectModel()}
                                size="small"
                                ghost
                            >
                                选中模型
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => this.unSelectModel()}
                                size="small"
                                ghost
                            >
                                取消选中
                            </Button>
                        </section>
                    </Panel>
                    <Panel header="功能相关" key="api">
                        <section className={style.btnContainer}>
                            <Divider>房间信息</Divider>
                            {this.commonApiList.map((i) => {
                                return (
                                    // eslint-disable-next-line react/jsx-key
                                    <Button type="primary" onClick={i.onClick()} size="small" ghost>
                                        {i.text}
                                    </Button>
                                );
                            })}
                            <Divider>相机移动</Divider>
                            {Object.values(ECameraMoveDirection).map((item) => {
                                return (
                                    <Button
                                        type="primary"
                                        onClick={() => this.handleMoveCamera(item)}
                                        size="small"
                                        ghost
                                    >
                                        {item}
                                    </Button>
                                );
                            })}
                        </section>
                    </Panel>
                    <Panel header="选中-高亮相关" key="model-hint">
                        <section className={style.btnContainer}>
                            <Button
                                type="primary"
                                onClick={this.hintSelectModel({
                                    hintOutline: true,
                                    hintPlankFace: [
                                        {
                                            plankFaceId: 0,
                                        },
                                    ],
                                })}
                                size="small"
                                ghost
                            >
                                突出板面0
                            </Button>
                            <Button
                                type="primary"
                                onClick={this.hintSelectModel({
                                    hintPlankFace: [
                                        {
                                            plankFaceId: 0,
                                        },
                                        {
                                            plankFaceId: 1,
                                            color: '#d5ff18',
                                            opacity: 0.4,
                                        },
                                        {
                                            plankFaceId: 2,
                                            color: '#ff6918',
                                            opacity: 0.4,
                                        },
                                        {
                                            plankFaceId: [4, 5],
                                            color: '#18ff46',
                                            opacity: 0.4,
                                        },
                                    ],
                                })}
                                size="small"
                                ghost
                            >
                                突出多个板面
                            </Button>
                            <Button type="primary" onClick={this.hintClear} size="small" ghost>
                                清空突出展示
                            </Button>
                        </section>
                    </Panel>
                    {/*<Panel header="选中-高亮五金" key="model-fitting-hardware-hint">
                        <section className={style.btnContainer}>
                            <Button
                                type="primary"
                                onClick={this.hintSelectFittingHardware({
                                    color: '#FFB6C1',
                                    opacity: 1,
                                })}
                                size="small"
                                ghost
                            >
                                高亮当前选中五金
                            </Button>
                            <Button
                                type="primary"
                                onClick={this.cancelFittingHardwareHint}
                                size="small"
                                ghost
                            >
                                取消高亮
                            </Button>
                        </section>
                    </Panel>*/}
                    <Panel header="选中-孔槽高亮相关" key="model-fitting-hint">
                        <section className={style.btnContainer}>
                            <Button
                                type="primary"
                                onClick={this.hintSelectFitting({
                                    outline: {
                                        color: '#FFB6C1',
                                        opacity: 1,
                                    },
                                })}
                                size="small"
                                ghost
                            >
                                高亮当前选中孔槽
                            </Button>
                        </section>
                    </Panel>
                    <Panel header="选中-异形板件-高亮" key="model">
                        <section className={style.btnContainer}>
                            <Button
                                type="primary"
                                onClick={this.hintPlankModel()}
                                size="small"
                                ghost
                            >
                                高亮所有侧面
                            </Button>
                            <Button type="primary" onClick={this.hintPlankClear} size="small" ghost>
                                清空所有高亮
                            </Button>
                        </section>
                    </Panel>
                    <Panel header="模型刷新" key="model-refresh">
                        <section className={style.btnContainer}>
                            <Button type="primary" onClick={this.refreshModel} size="small" ghost>
                                刷新模型
                            </Button>
                        </section>
                    </Panel>
                </Collapse>
            </Fragment>
        );
    }
}

export default connect(() => {})(BasicFunction);
