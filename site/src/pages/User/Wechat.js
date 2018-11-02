import React, { Component } from 'react';
import { parse } from 'qs';
import { Spin } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import styles from './Login.less';

@connect(({ login, loading }) => ({ login, fetching: loading.effects['login/login'] }))
class Wechat extends Component {
  componentDidMount = () => {
    const {
      location: { search },
      dispatch,
    } = this.props;
    const params = parse(search, { ignoreQueryPrefix: true });
    dispatch({
      type: 'login/login',
      payload: {
        type: 'wechat',
        ...params,
      },
    });
  };

  render() {
    const {
      login: { errors },
      fetching,
    } = this.props;
    return (
      <div className={styles.main}>
        {errors && !fetching ? (
          <div style={{ margin: '0 auto', display: 'block', textAlign: 'center' }}>
            {Object.entries(errors).map((r, ind) => (
              <p key={ind}>{r.join(':')}</p>
            ))}
            <Link to="/user/login">重新认证</Link>
          </div>
        ) : (
          <Spin style={{ margin: '0 auto', display: 'block' }} tip="正在认证..." />
        )}
      </div>
    );
  }
}

export default Wechat;
