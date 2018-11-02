import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { fakeAccountLogin, fakeAccountInfo, fakeChangePassword } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import { message } from 'antd';

export default {
  namespace: 'login',

  state: {
    status: undefined,
    errors: {},
    wechat: {},
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      const data = response.status
        ? response
        : {
            status: 'error',
            type: 'account',
            currentAuthority: {},
            errors: response,
          };
      yield put({
        type: 'changeLoginStatus',
        payload: data,
      });
      // Login successfully
      if (response.status === 'ok') {
        reloadAuthorized();
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.startsWith('/#')) {
              redirect = redirect.substr(2);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      }
    },

    *getWechat({ payload }, { call, put }) {
      const response = yield call(fakeAccountInfo, payload);
      if (response.appid && response.agentid) {
        yield put({
          type: 'saveWechat',
          payload: response,
        });
      }
    },

    *changePassword({ payload }, { call, put }) {
      const response = yield call(fakeChangePassword, payload);
      if (response.message === 'success') {
        yield put({
          type: 'logout',
        });
      } else {
        Object.entries(response).forEach(r => {
          message.error(r.join(' '));
        });
      }
    },

    *logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: 'guest',
        },
      });
      reloadAuthorized();
      yield put(
        routerRedux.push({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
        errors: payload.errors || {},
      };
    },
    saveWechat(state, { payload }) {
      return {
        ...state,
        wechat: payload,
      };
    },
  },
};
