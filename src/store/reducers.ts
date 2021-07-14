import { combineReducers } from 'redux';
import { selectionReducers as selection } from './selection/reducers';

const allState = {
    selection,
};

// 初始状态值
export const reducers = combineReducers(allState);

type RootStateType = typeof allState;
type RootStateKeys = keyof RootStateType;

/**
 * 全局的State的内容
 */
export type IRootState = {
    [P in RootStateKeys]: ReturnType<RootStateType[P]>;
};

declare module 'react-redux' {
    interface DefaultRootState extends IRootState {}
}
