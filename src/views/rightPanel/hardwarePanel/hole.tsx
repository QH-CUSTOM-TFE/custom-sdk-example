import { IFittingDesignData, IHoleData } from '@manycore/custom-sdk';
import Divider from 'antd/es/divider';
import Icon from 'antd/es/icon';
import Tabs from 'antd/es/tabs';
import { map } from 'lodash';
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import styles from '../index.module.scss';

const { TabPane } = Tabs;

export interface IHoleBaseInfoProps {
    selectedFittingDesign?: IFittingDesignData;
}

export class HoleBaseInfo extends PureComponent<IHoleBaseInfoProps> {
    protected renderHoleInfo(value: IHoleData[], id: string) {
        return value.map((hole) => {
            const { start, end } = hole;
            return (
                <>
                    <div className={styles.descItem}>
                        <span>板面</span>
                        <span>{hole.id}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>关联模型ID</span>
                        <span>{id}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>起点</span>
                        <span>
                            <span>X: {start.x} </span>
                            <span>Y: {start.y} </span>
                            <span>Z: {start.z} </span>
                        </span>
                    </div>
                    <div className={styles.descItem}>
                        <span>终点</span>
                        <span>
                            <span>X: {end.x} </span>
                            <span>Y: {end.x} </span>
                            <span>Z: {end.x} </span>
                        </span>
                    </div>
                    <div className={styles.descItem}>
                        <span>深度</span>
                        <span>{hole.depth}</span>
                    </div>
                    <div className={styles.descItem}>
                        <span>直径</span>
                        <span>{hole.diameter}</span>
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
                    <span>关联孔信息</span>
                </div>
                <Tabs defaultActiveKey="1" size="small" style={{ height: 200 }}>
                    {map(selectedFittingDesign!.holes, (value, id) => (
                        <TabPane tab={`孔`} key={id}>
                            {this.renderHoleInfo(value, id)}
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
}))(HoleBaseInfo);
