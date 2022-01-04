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
                    <Panel header="选中-高亮相关" key="model">
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
                    <Panel header="模型刷新" key="model">
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
