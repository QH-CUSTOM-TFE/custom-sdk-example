import React, { PureComponent } from 'react';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import styles from '../index.module.scss';
import { Input, Icon, Tooltip } from 'antd';
import HoleBaseInfo from './hole';
import GrooveBaseInfo from './groove';
import { Divider } from 'antd';
import { IRightPanelProps } from '../';

export class HardwarePanel extends PureComponent<IRightPanelProps, never> {
    private onChange(value: string) {
        console.log('value', value);
    }
    // 基本属性
    protected renderBaseProperty() {
        return (
            <>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>基础属性</span>
                </div>
                <div className={styles.descItem}>
                    <span>真分类</span>
                    <span>背板</span>
                </div>
                <div className={styles.descItem}>
                    <span>商品名称</span>
                    <span>背板</span>
                </div>
                <div className={styles.descItem}>
                    <span>主图</span>
                    <span>
                        <img
                            src="//qhyxpicoss.kujiale.com/r/2017/11/23/L1D1DVC64RXPEJIMLMVQSL3WKUQ8_400x400.jpg@!pad400x400"
                            alt=""
                        />
                    </span>
                </div>
                <Divider />
            </>
        );
    }

    // 位置属性
    protected renderPositionProperty() {
        return (
            <>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>位置属性</span>
                </div>
                <div className={styles.descItem}>
                    <Tooltip title="右正左负">
                        <span>P.X</span>
                        <Icon type="question-circle" />
                    </Tooltip>
                    <Input
                        onBlur={(e: { target: { value: string } }) => this.onChange(e.target.value)}
                        size="small"
                        type="number"
                        style={{ width: 120 }}
                    />
                </div>
                <div className={styles.descItem}>
                    <Tooltip title="前正后负">
                        <span>P.Y</span>
                        <Icon type="question-circle" />
                    </Tooltip>
                    <Input
                        onBlur={(e: { target: { value: string } }) => this.onChange(e.target.value)}
                        size="small"
                        type="number"
                        style={{ width: 120 }}
                    />
                </div>
                <div className={styles.descItem}>
                    <Tooltip title="上正下负">
                        <span>P.Z</span>
                        <Icon type="question-circle" />
                    </Tooltip>
                    <Input
                        onBlur={(e: { target: { value: string } }) => this.onChange(e.target.value)}
                        size="small"
                        type="number"
                        style={{ width: 120 }}
                    />
                </div>
                <Divider />
            </>
        );
    }

    // 角度属性
    protected renderAngleProperty() {
        return (
            <>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>角度属性</span>
                </div>
                <div className={styles.descItem}>
                    <span>R.X</span>
                    <Input
                        onBlur={(e: { target: { value: string } }) => this.onChange(e.target.value)}
                        size="small"
                        type="number"
                        style={{ width: 120 }}
                    />
                </div>
                <div className={styles.descItem}>
                    <span>R.Y</span>
                    <Input
                        onBlur={(e: { target: { value: string } }) => this.onChange(e.target.value)}
                        size="small"
                        type="number"
                        style={{ width: 120 }}
                    />
                </div>
                <div className={styles.descItem}>
                    <span>R.Z</span>
                    <Input
                        onBlur={(e: { target: { value: string } }) => this.onChange(e.target.value)}
                        size="small"
                        type="number"
                        style={{ width: 120 }}
                    />
                </div>
            </>
        );
    }

    // 角度属性
    protected renderKongProperty() {
        return (
            <>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>角度属性</span>
                </div>
                <div className={styles.descItem}>
                    <span>X</span>
                    <Input
                        onBlur={(e: { target: { value: string } }) => this.onChange(e.target.value)}
                        size="small"
                        style={{ width: 120 }}
                    />
                </div>
                <div className={styles.descItem}>
                    <span>Y</span>
                    <Input
                        onBlur={(e: { target: { value: string } }) => this.onChange(e.target.value)}
                        size="small"
                        style={{ width: 120 }}
                    />
                </div>
                <div className={styles.descItem}>
                    <span>Z</span>
                    <Input
                        onBlur={(e: { target: { value: string } }) => this.onChange(e.target.value)}
                        size="small"
                        style={{ width: 120 }}
                    />
                </div>
                <Divider />
            </>
        );
    }

    render() {
        return (
            <Fragment>
                {/*
                 * 模型 1
                 * 五金 2
                 * 元件 3
                 * 虚拟模型 4
                 * 参数化组合模型 5
                 */}
                {/*{model.modelTypeId === 2 && this.renderBaseProperty()}
                {model.modelTypeId === 2 && this.renderPositionProperty()}
                {model.modelTypeId === 2 && this.renderAngleProperty()}*/}
                <HoleBaseInfo />
                <GrooveBaseInfo />
            </Fragment>
        );
    }
}

export default connect((state) => ({
    selection: state.selection.selected,
}))(HardwarePanel);
