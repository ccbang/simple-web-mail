import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Checkbox, Alert } from 'antd';
import Login from '@/components/Login';
import Link from 'umi/link';
import { stringify } from 'qs';
import styles from './Login.less';

const { Tab, UserName, Password, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  };

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/getWechat',
    });
  };

  onTabChange = type => {
    this.setState({ type });
  };

  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
        },
      });
    }
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { login, submitting } = this.props;
    const { type, autoLogin } = this.state;
    const wechatUrl = login.wechat
      ? `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?${stringify(login.wechat, {
          encode: false,
        })}`
      : '';
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab={formatMessage({ id: 'app.login.tab-login-credentials' })}>
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              this.renderMessage(formatMessage({ id: 'app.login.message-invalid-credentials' }))}
            <UserName name="username" placeholder="email address" />
            <Password
              name="password"
              placeholder="your account passwrod"
              onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
            />
            <div>
              <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
                <FormattedMessage id="app.login.remember-me" />
              </Checkbox>
              <Link style={{ float: 'right' }} to="/user/forgot">
                <FormattedMessage id="app.login.forgot-password" />
              </Link>
            </div>
            <Submit loading={submitting}>
              <FormattedMessage id="app.login.login" />
            </Submit>
          </Tab>
          <Tab key="weixin" tab={formatMessage({ id: 'app.login.tab-login-wechat' })}>
            <div>
              <iframe
                title="wechat"
                frameBorder="0"
                scrolling="no"
                height="400px"
                style={{ display: 'block', margin: '0 auto' }}
                sandbox="allow-scripts allow-same-origin allow-top-navigation"
                src={wechatUrl}
              />
            </div>
          </Tab>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
