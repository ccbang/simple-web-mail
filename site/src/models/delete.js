import { queryMailBox } from '@/services/api';

export default {
  namespace: 'deleted',

  state: {
    list: [],
    pagination: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const newPayload = { ...payload };
      newPayload.mailBox = 'Delete';
      const response = yield call(queryMailBox, newPayload);
      if (response.code === 200 && Array.isArray(response.mails)) {
        yield put({
          type: 'queryList',
          payload: response,
        });
      }
    },
    *appendFetch({ payload }, { call, put }) {
      const newPayload = { ...payload };
      newPayload.mailBox = 'Delete';
      const response = yield call(queryMailBox, newPayload);
      yield put({
        type: 'appendList',
        payload: Array.isArray(response) ? response : [],
      });
    },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload.mails,
        pagination: action.payload.pagination,
      };
    },
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    appendList(state, action) {
      return {
        ...state,
        list: state.list.concat(action.payload),
      };
    },
  },
};
