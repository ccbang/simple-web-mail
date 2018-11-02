import { addFrend, removeFrend, queryFrends, updateFrend, bulkRemoveFrend } from '@/services/api';
import { message } from 'antd';

export default {
  namespace: 'frend',

  state: {
    list: [],
    pagination: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryFrends, payload);
      if (response && response.results) {
        yield put({
          type: 'save',
          payload: response,
        });
      }
    },
    *addFrend({ payload }, { call, put }) {
      const response = yield call(addFrend, payload);
      if (response.id) {
        yield put({
          type: 'fetch',
        });
        message.success('添加成功');
      } else {
        Object.entries(response).forEach(r => {
          message.error(r.join(' '));
        });
      }
    },
    *update({ payload }, { call, put, select }) {
      const response = yield call(updateFrend, payload);
      if (response.id) {
        const newFrends = yield select(state =>
          state.frend.list.map(fr => (fr.id === response.id ? response : fr))
        );
        yield put({
          type: 'saveFrends',
          payload: newFrends,
        });
        message.success('更新成功');
      } else {
        message.error('更新失败');
      }
    },
    *remove({ payload }, { call, put }) {
      const response = yield call(removeFrend, payload);
      if (response.id) {
        message.success('删除成功');
        yield put({
          type: 'fetch',
        });
      } else {
        message.error('删除失败');
      }
    },
    *bulkRemove({ payload }, { call, put }) {
      const response = yield call(bulkRemoveFrend, payload);
      if (response.code === 200) {
        message.success('删除成功');
        yield put({
          type: 'fetch',
        });
      } else {
        message.error('删除失败');
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload.results,
        pagination: action.payload.pagination,
      };
    },
    saveFrends(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
  },
};
