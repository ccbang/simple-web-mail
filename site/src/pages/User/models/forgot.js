import { fakeForgot } from '@/services/api';

export default {
  namespace: 'forgot',

  state: {
    status: undefined,
  },

  effects: {
    *submit({ payload }, { call, put }) {
      const response = yield call(fakeForgot, payload);
      yield put({
        type: 'forgotHandle',
        payload: response,
      });
    },
  },

  reducers: {
    forgotHandle(state, { payload }) {
      return {
        ...state,
        status: payload.status,
      };
    },
  },
};
