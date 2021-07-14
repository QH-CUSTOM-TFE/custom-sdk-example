import { IFittingDesignData } from '@manycore/custom-sdk';
import React, { PureComponent } from 'react';
import TextArea from 'antd/lib/input/TextArea';
import Button from 'antd/lib/button';
import styles from './index.module.scss';
import { message } from 'antd';

export interface IFittingDataState {
    value: string;
}

export interface IRightPanelProps<T = IFittingDesignData> {
    /**
     * 表示当中展示内容
     */
    value?: T | null;

    /**
     * 当变更时内容
     * @param value
     */
    onChange?: (value: T) => any;
    // 保存
    onSave?: (value: T) => any;
    // 清空某个方案的模型
    onClear?: () => any;
    text: string;
}

export class FittingData extends PureComponent<IRightPanelProps, IFittingDataState> {
    state = {
        value: '{}',
    };

    protected transformValueToState() {
        const { value } = this.props;
        this.setState({
            value: JSON.stringify(value ?? {}),
        });
    }

    componentDidMount() {
        this.transformValueToState();
    }

    componentDidUpdate(
        prevProps: Readonly<IRightPanelProps>,
        prevState: Readonly<IFittingDataState>,
        snapshot?: any
    ) {
        if (prevProps.value !== this.props.value) {
            this.transformValueToState();
        }
    }

    protected onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            value: e.target.value,
        });

        if (this.props.onChange) {
            this.props.onChange(this.parseValue());
        }
    };

    protected parseValue(userValue?: string) {
        const { value } = this.state;

        try {
            return JSON.parse(userValue ?? value);
        } catch (e) {
            message.error('输入信息格式存在问题!');
            throw e;
        }
    }

    public onSave = () => {
        if (this.props.onSave) {
            this.props.onSave(this.parseValue());
        }
    };

    public onClear = () => {
        if (this.props.onClear) {
            this.props.onClear();
        }
    };

    render() {
        const { text, onSave, onClear } = this.props;
        const { value } = this.state;

        return (
            <div>
                <TextArea
                    value={value}
                    onChange={this.onChange}
                    placeholder="Autosize height based on content lines"
                    autoSize={{ minRows: 6, maxRows: 40 }}
                />
                <div className={styles.btnContainer}>
                    {onClear && (
                        <Button type="default" onClick={this.onClear}>
                            清空
                        </Button>
                    )}
                    <span>&nbsp;&nbsp;</span>
                    {onSave && (
                        <Button onClick={this.onSave} type="primary">
                            {text}
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}
