import { addFlags, mailDelete, mailRetrieve, sendMail } from '@/services/api';
import { message } from 'antd';
import { routerRedux } from 'dva/router';

export default {
  namespace: 'mail',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    current: {},
  },

  effects: {
    *addFlag({ payload }, { call, select, put }) {
      const response = yield call(addFlags, payload);
      if (response.code === 200) {
        message.success(response.message);
        const newMails = yield select(state =>
          state.mailbox.list.map(mail => {
            if (payload.uid.indexOf(mail.id) !== -1) {
              const newMail = { ...mail };
              newMail.flags.push(payload.flag);
              return newMail;
            }
            return mail;
          })
        );
        yield put({
          type: 'mailbox/save',
          payload: newMails,
        });
      } else {
        message.error(response.message);
      }
    },
    *remove({ payload }, { call, put }) {
      const response = yield call(mailDelete, payload);
      if (response.code === 200) {
        message.success(response.message);
        if (payload.mailBox === 'Delete') {
          yield put({
            type: 'deleted/fetch',
          });
        } else {
          yield put({
            type: 'mailbox/fetch',
          });
        }
      } else {
        message.error(response.message);
      }
    },
    *retrieve({ payload }, { call, put }) {
      const response = yield call(mailRetrieve, payload);
      if (response.code === 200) {
        message.success(response.message);
        yield put({
          type: 'deleted/fetch',
        });
      } else {
        message.error(response.message);
      }
    },
    *sendMail({ payload }, { call, put }) {
      const response = yield call(sendMail, payload);
      if (response.code === 200) {
        message.success(response.message);
        yield put(routerRedux.push('/mails/send'));
      } else {
        message.error(response.message);
      }
    },
    *saveDraft({ payload }, { call }) {
      const newPlayload = { ...payload, draft: true };
      const response = yield call(sendMail, newPlayload);
      if (response.code === 200) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveCurrent(state, action) {
      return {
        ...state,
        current: action.payload,
      };
    },
  },
};
