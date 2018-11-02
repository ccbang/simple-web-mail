import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
import router from 'umi/router';
import { Form, Input, Button, Select } from 'antd';
import styles from './Forgot.less';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

@connect(({ forgot, loading }) => ({
  forgot,
  submitting: loading.effects['forgot/submit'],
}))
@Form.create()
class Forgot extends Component {
  state = {
    prefix: '86',
  };

  componentDidUpdate() {
    const { form, forgot } = this.props;
    const account = form.getFieldValue('mail');
    if (forgot.status === 'ok') {
      router.push({
        pathname: '/user/forgot-result',
        state: {
          account,
        },
      });
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        const { prefix } = this.state;
        dispatch({
          type: 'forgot/submit',
          payload: {
            ...values,
            prefix,
          },
        });
      }
    });
  };

  changePrefix = value => {
    this.setState({
      prefix: value,
    });
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { prefix } = this.state;
    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            {getFieldDecorator('mail', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'validation.email.required' }),
                },
                {
                  type: 'email',
                  message: formatMessage({ id: 'validation.email.wrong-format' }),
                },
              ],
            })(
              <Input size="large" placeholder={formatMessage({ id: 'form.email.placeholder' })} />
            )}
          </FormItem>
          <FormItem>
            <InputGroup compact>
              <Select
                size="large"
                value={prefix}
                onChange={this.changePrefix}
                style={{ width: '20%' }}
              >
                <Option value="86">+86</Option>
                <Option value="87">+87</Option>
              </Select>
              {getFieldDecorator('mobile', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'validation.phone-number.required' }),
                  },
                  {
                    pattern: /^\d{11}$/,
                    message: formatMessage({ id: 'validation.phone-number.wrong-format' }),
                  },
                ],
              })(
                <Input
                  size="large"
                  style={{ width: '80%' }}
                  placeholder={formatMessage({ id: 'form.phone-number.placeholder' })}
                />
              )}
            </InputGroup>
          </FormItem>
          <FormItem>
            <Button
              size="large"
              loading={submitting}
              className={styles.submit}
              type="primary"
              htmlType="submit"
            >
              忘记密码
            </Button>
            <Link className={styles.login} to="/User/Login">
              <FormattedMessage id="app.register.sing-in" />
            </Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Forgot;
