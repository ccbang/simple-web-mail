import { addTrash, removeTrash, queryTrashs } from '@/services/api';
import { message } from 'antd';

export default {
  namespace: 'trash',

  state: {
    list: [],
    pagination: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryTrashs);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *addFrend({ payload }, { call, put }) {
      const response = yield call(addTrash, payload);
      if (response.id) {
        yield put({
          type: 'append',
          payload: response,
        });
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
    },
    *remove({ payload }, { call, put }) {
      const response = yield call(removeTrash, payload);
      if (response.id) {
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
    append(state, action) {
      return {
        ...state,
        list: state.list.concat(action.payload),
      };
    },
  },
};
