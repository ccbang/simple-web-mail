import { queryMailBoxDetail } from '@/services/api';
import { message } from 'antd';
import { routerRedux } from 'dva/router';

export default {
  namespace: 'profile',

  state: {
    current: {},
  },

  effects: {
    *detail({ payload }, { call, put }) {
      const response = yield call(queryMailBoxDetail, payload);
      if (response.code === 200) {
        yield put({
          type: 'save',
          payload: response.mail,
        });
      } else {
        message.error(response.message);
        yield put(routerRedux.push('/mails/mailbox'));
      }
    },
    *delete({ payload }, { call, put }) {
      const response = yield call(queryMailBoxDetail, payload);
      if (response.code === 200) {
        yield put({
          type: 'save',
          payload: response,
        });
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        current: payload,
      };
    },
  },
};
