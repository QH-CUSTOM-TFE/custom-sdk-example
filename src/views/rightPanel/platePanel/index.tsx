import { Number3, IExportModelData } from '@manycore/custom-miniapp-sdk';
import Divider from 'antd/lib/divider';
import Icon from 'antd/lib/icon';
import React, { PureComponent } from 'react';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import { IRightPanelProps } from '../';
import styles from '../index.module.scss';
import Paragraph from 'antd/lib/typography/Paragraph';

export class PlatePanel extends PureComponent<IRightPanelProps, never> {
    // 基本属性
    protected renderBaseProperty(model: IExportModelData) {
        return (
            <>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>基础属性</span>
                </div>
                <div className={styles.descItem}>
                    <span>商品ID</span>
                    <Paragraph copyable={{ text: model.id }}>{model.id}</Paragraph>
                </div>
                <div className={styles.descItem}>
                    <span>名称</span>
                    <span>{model.modelName}</span>
                </div>
                <div className={styles.descItem}>
                    <span>宽度</span>
                    <span>{model.size.x}</span>
                </div>
                <div className={styles.descItem}>
                    <span>深度</span>
                    <span>{model.size.y}</span>
                </div>
                <div className={styles.descItem}>
                    <span>厚度</span>
                    <span>{model.size.z}</span>
                </div>
                <div className={styles.descItem}>
                    <span>材质</span>
                    <span>{model.textureName}</span>
                </div>
                <Divider />
            </>
        );
    }

    // 位置属性
    protected renderPositionProperty(pos: Number3) {
        return (
            <>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>位置属性</span>
                </div>
                <div className={styles.descItem}>
                    <span>P.X</span>
                    <span>{pos.x}</span>
                </div>
                <div className={styles.descItem}>
                    <span>P.Y</span>
                    <span>{pos.y}</span>
                </div>
                <div className={styles.descItem}>
                    <span>P.Z</span>
                    <span>{pos.z}</span>
                </div>
                <Divider />
            </>
        );
    }

    // 角度属性
    protected renderAngleProperty(rotation: Number3) {
        return (
            <>
                <div className={styles.descTitle}>
                    <Icon type="unordered-list" />
                    <span>角度属性</span>
                </div>
                <div className={styles.descItem}>
                    <span>R.X</span>
                    <span>{rotation.x}</span>
                </div>
                <div className={styles.descItem}>
                    <span>R.Y</span>
                    <span>{rotation.y}</span>
                </div>
                <div className={styles.descItem}>
                    <span>R.Z</span>
                    <span>{rotation.z}</span>
                </div>
                <Divider />
            </>
        );
    }

    render() {
        const { selection } = this.props;
        if (!selection.length) {
            return null;
        }
        const model = selection[0];
        const position = model.absPosition ?? { x: 0, y: 0, z: 0 };
        const rotation = model.absRotationDegree ?? { x: 0, y: 0, z: 0 };
        return (
            <Fragment>
                {this.renderBaseProperty(model)}
                {this.renderPositionProperty(position)}
                {this.renderAngleProperty(rotation)}
            </Fragment>
        );
    }
}

export default connect((state) => ({
    selection: state.selection.selected,
}))(PlatePanel);
