import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PlatePanel from './platePanel';
import HardwarePanel from './hardwarePanel';
import styles from './index.module.scss';
import { Empty } from 'antd';
import BaseInfo from './baseInfo';
import Tabs from 'antd/lib/tabs';
import PlateFittingDataWrap from './platePanel/plateFittingDataWrap';
import { IExportModelData } from '@manycore/custom-miniapp-sdk';

const { TabPane } = Tabs;

export interface IRightPanelProps {
    selection: IExportModelData[];
}

export interface IRightPanelState {
    value?: string;
    activeKey?: string;
}

export enum ETabPane {
    // 模型基础信息面板
    MODEL_BASE_INFO = '1',
    // 属性面板
    PROPERTY = '2',
}

export class RightPanel extends PureComponent<IRightPanelProps, IRightPanelState> {
    state = {
        activeKey: ETabPane.MODEL_BASE_INFO,
    };

    componentDidUpdate(
        prevProps: Readonly<IRightPanelProps>,
        prevState: Readonly<IRightPanelState>,
        snapshot?: any
    ) {
        if (prevProps.selection.length !== this.props.selection.length) {
            const key = this.props.selection.length ? ETabPane.PROPERTY : ETabPane.MODEL_BASE_INFO;
            this.setState({ activeKey: key });
        }
    }

    private handleTabChange(key: string) {
        this.setState({ activeKey: key as ETabPane });
    }

    render() {
        const { selection } = this.props;
        const { activeKey } = this.state;

        return (
            <div className={styles.rightPanelContainer}>
                <Tabs
                    activeKey={activeKey}
                    tabBarGutter={20}
                    onChange={(key: string) => this.handleTabChange(key)}
                >
                    <TabPane tab="模型数据" key={ETabPane.MODEL_BASE_INFO}>
                        <BaseInfo />
                        {/* 模型孔槽数据 */}
                        {/* <HardwarePanel /> */}
                    </TabPane>
                    <TabPane tab="属性" key={ETabPane.PROPERTY}>
                        {selection.length !== 0 ? (
                            <>
                                <div className={styles.content}>
                                    <PlatePanel />
                                    {/* 选中的板件或者五金的孔槽数据 */}
                                    <HardwarePanel />
                                </div>
                                <PlateFittingDataWrap />
                            </>
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请选择模型" />
                        )}
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default connect((state) => ({
    selection: state.selection.selected,
}))(RightPanel);
