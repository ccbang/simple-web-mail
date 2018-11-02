import {
  query as queryUsers,
  updateUser,
  addVirtualUser,
  removeUser,
  bulkRemoveUser,
} from '@/services/user';
import { message } from 'antd';

export default {
  namespace: 'virtual',

  state: {
    list: [],
    pagination: {},
    currentUser: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryUsers, payload);
      if (response && response.results) {
        yield put({
          type: 'save',
          payload: response,
        });
      }
    },
    *add({ payload }, { call, put }) {
      const response = yield call(addVirtualUser, payload);
      if (response.id) {
        yield put({
          type: 'append',
          payload: response,
        });
        message.success('添加成功');
      } else {
        Object.entries(response).forEach(r => {
          message.error(r.join(' '));
        });
      }
    },
    *update({ payload }, { call, put, select }) {
      const response = yield call(updateUser, payload);
      if (response.id) {
        const newUsers = yield select(state =>
          state.virtual.list.map(fr => (fr.id === response.id ? response : fr))
        );
        yield put({
          type: 'saveUsers',
          payload: newUsers,
        });
        message.success('更新成功');
      } else {
        message.error('更新失败');
      }
    },
    *remove({ payload }, { call, put }) {
      const response = yield call(removeUser, payload);
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
      const response = yield call(bulkRemoveUser, payload);
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
    saveUsers(state, action) {
      return {
        ...state,
        list: action.payload,
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
