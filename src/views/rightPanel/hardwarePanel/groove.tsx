import { IFittingDesignData, IGrooveData } from '@manycore/custom-sdk';
import React, { PureComponent } from 'react';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import styles from '../index.module.scss';
import { Icon } from 'antd';
import { Divider } from 'antd';
import { Tabs } from 'antd';
import { map } from 'lodash';

const { TabPane } = Tabs;

export interface IGrooveBaseInfoProps {
    selectedFittingDesign?: IFittingDesignData;
}

export class GrooveBaseInfo extends PureComponent<IGrooveBaseInfoProps> {
    protected renderKongInfo(value: IGrooveData[], id: string) {
        return value.map((groove) => {
            return (
                <>
                    <div className={styles.descItem}>
                        <span>板面</span>
                        <span>{groove.id}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>关联模型ID</span>
                        <span>{id}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>起点</span>
                        <span>
                            <span>X: {groove.start.x} </span>
                            <span>Y: {groove.start.y} </span>
                            <span>Z: {groove.start.z} </span>
                        </span>
                    </div>
                    <div className={styles.descItem}>
                        <span>终点</span>
                        <span>
                            <span>X: {groove.end.x} </span>
                            <span>Y: {groove.end.x} </span>
                            <span>Z: {groove.end.x} </span>
                        </span>
                    </div>
                    <div className={styles.descItem}>
                        <span>槽宽</span>
                        <span>{groove.width}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>槽深</span>
                        <span>{groove.depth}</span>
                    </div>
                </>
            );
        });
    }

    render() {
        const { selectedFittingDesign } = this.props;

        return (
            <Fragment>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>关联槽信息</span>
                </div>
                <Tabs defaultActiveKey="1" size="small" style={{ height: 200 }}>
                    {map(selectedFittingDesign?.grooves, (value, id) => (
                        <TabPane tab={`槽`} key={id}>
                            {this.renderKongInfo(value, id)}
                        </TabPane>
                    ))}
                </Tabs>
                <Divider />
            </Fragment>
        );
    }
}

export default connect((state) => ({
    selectedFittingDesign: state.selection.selectedFittingDesign!,
}))(GrooveBaseInfo);
