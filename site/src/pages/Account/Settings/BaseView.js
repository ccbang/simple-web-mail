import React, { Component, Fragment } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { Form, Input, Upload, DatePicker, Button, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import styles from './BaseView.less';
// import { getTimeDistance } from '@/utils/utils';

const FormItem = Form.Item;

// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({ avatar }) => (
  <Fragment>
    <div className={styles.avatar_title}>
      <FormattedMessage id="app.settings.basic.avatar" defaultMessage="Avatar" />
    </div>
    <div className={styles.avatar}>
      <img src={avatar} alt="avatar" />
    </div>
    <Upload fileList={[]}>
      <div className={styles.button_view}>
        <Button icon="upload">
          <FormattedMessage id="app.settings.basic.change-avatar" defaultMessage="Change avatar" />
        </Button>
      </div>
    </Upload>
  </Fragment>
);

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
@Form.create()
class BaseView extends Component {
  getAvatarURL() {
    const { currentUser } = this.props;
    if (currentUser.avatar) {
      return currentUser.avatar;
    }
    const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
    return url;
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch, currentUser } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { date_of_birth } = values;
      const birth = moment(date_of_birth).format('YYYY-MM-DD');
      dispatch({
        type: 'user/update',
        payload: { ...values, id: currentUser.id, date_of_birth: birth },
      });
      message.success('更新成功');
      form.resetFields();
    });
  };

  getViewDom = ref => {
    this.view = ref;
  };

  render() {
    const {
      form: { getFieldDecorator },
      currentUser,
    } = this.props;
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
            <FormItem label={formatMessage({ id: 'app.settings.basic.email' })}>
              {getFieldDecorator('email', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'app.settings.basic.email-message' }, {}),
                  },
                ],
                initialValue: currentUser.email,
              })(<Input />)}
            </FormItem>
            <FormItem label={formatMessage({ id: 'app.settings.basic.nickname' })}>
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'app.settings.basic.nickname-message' }, {}),
                  },
                ],
                initialValue: currentUser.name,
              })(<Input />)}
            </FormItem>
            <FormItem label="生日">
              {getFieldDecorator('date_of_birth', {
                rules: [
                  {
                    required: true,
                    message: '必须填写生日',
                  },
                ],
                initialValue: moment(currentUser.date_of_birth),
              })(<DatePicker style={{ width: '100%' }} />)}
            </FormItem>
            <Button type="primary" onClick={e => this.handleSubmit(e)}>
              <FormattedMessage
                id="app.settings.basic.update"
                defaultMessage="Update Information"
              />
            </Button>
          </Form>
        </div>
        <div className={styles.right}>
          <AvatarView avatar={this.getAvatarURL()} />
        </div>
      </div>
    );
  }
}

export default BaseView;
