import React, { Component, Fragment } from 'react';
import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

const CollectionCreateForm = Form.create()(
  class extends Component {
    state = {
      confirmDirty: false,
    };

    handleConfirmBlur = e => {
      const { value } = e.target;
      const { confirmDirty } = this.state;
      this.setState({ confirmDirty: confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
      const { form } = this.props;
      if (value && value !== form.getFieldValue('new_password')) {
        callback('Two passwords that you enter is inconsistent!');
      } else {
        callback();
      }
    };

    validateToNextPassword = (rule, value, callback) => {
      const { form } = this.props;
      const { confirmDirty } = this.state;
      if (value && confirmDirty) {
        form.validateFields(['confirm'], { force: true });
      }
      callback();
    };

    render() {
      const { visible, onCancel, onCreate, form, title, name } = this.props;
      const { getFieldDecorator } = form;
      const formContent = () => {
        if (name === 'forgot') {
          return (
            <Fragment>
              <FormItem label="旧密码">
                {getFieldDecorator('old_password', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                  ],
                })(<Input type="password" />)}
              </FormItem>
              <FormItem label="新密码">
                {getFieldDecorator('new_password', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                    {
                      validator: this.validateToNextPassword,
                    },
                  ],
                })(<Input type="password" />)}
              </FormItem>
              <FormItem label="重复一次新密码">
                {getFieldDecorator('confirm', {
                  rules: [
                    {
                      required: true,
                      message: 'Please confirm your password!',
                    },
                    {
                      validator: this.compareToFirstPassword,
                    },
                  ],
                })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
              </FormItem>
            </Fragment>
          );
        }
        return null;
      };
      return (
        <Modal visible={visible} title={title} okText="Create" onCancel={onCancel} onOk={onCreate}>
          <Form layout="vertical">{formContent()}</Form>
        </Modal>
      );
    }
  }
);

export default CollectionCreateForm;
