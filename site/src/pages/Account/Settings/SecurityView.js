import React, { Component, Fragment } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { List } from 'antd';
import { connect } from 'dva';
// import { getTimeDistance } from '@/utils/utils';
import CollectionCreateForm from './ChangeModelForm';

const passwordStrength = {
  strong: (
    <font className="strong">
      <FormattedMessage id="app.settings.security.strong" defaultMessage="Strong" />
    </font>
  ),
  medium: (
    <font className="medium">
      <FormattedMessage id="app.settings.security.medium" defaultMessage="Medium" />
    </font>
  ),
  weak: (
    <font className="weak">
      <FormattedMessage id="app.settings.security.weak" defaultMessage="Weak" />
      Weak
    </font>
  ),
};

@connect()
class SecurityView extends Component {
  state = {
    visible: false,
    title: '',
    name: '',
  };

  showModal = (title, name) => {
    this.setState({ visible: true, title, name });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      dispatch({
        type: 'login/changePassword',
        payload: values,
      });
      form.resetFields();
      this.setState({ visible: false });
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  getData = () => [
    {
      title: formatMessage({ id: 'app.settings.security.password' }, {}),
      description: (
        <Fragment>
          {formatMessage({ id: 'app.settings.security.password-description' })}：
          {passwordStrength.strong}
        </Fragment>
      ),
      actions: [
        <a onClick={() => this.showModal('修改密码', 'forgot')}>
          <FormattedMessage id="app.settings.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'app.settings.security.phone' }, {}),
      description: `${formatMessage(
        { id: 'app.settings.security.phone-description' },
        {}
      )}：1**********`,
      actions: [
        <a>
          <FormattedMessage id="app.settings.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'app.settings.security.question' }, {}),
      description: formatMessage({ id: 'app.settings.security.question-description' }, {}),
      actions: [
        <a>
          <FormattedMessage id="app.settings.security.set" defaultMessage="Set" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'app.settings.security.email' }, {}),
      description: `${formatMessage(
        { id: 'app.settings.security.email-description' },
        {}
      )}：******.com`,
      actions: [
        <a>
          <FormattedMessage id="app.settings.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'app.settings.security.mfa' }, {}),
      description: formatMessage({ id: 'app.settings.security.mfa-description' }, {}),
      actions: [
        <a>
          <FormattedMessage id="app.settings.security.bind" defaultMessage="Bind" />
        </a>,
      ],
    },
  ];

  render() {
    const { visible, title, name } = this.state;
    return (
      <Fragment>
        <List
          itemLayout="horizontal"
          dataSource={this.getData()}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={visible}
          title={title}
          name={name}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </Fragment>
    );
  }
}

export default SecurityView;
