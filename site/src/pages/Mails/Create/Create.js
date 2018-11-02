import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Card, Upload, Icon, Layout } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import QuillEditor from '@/components/Editor/QuillEditor';
import RightFrend from './RightFrend';

const FormItem = Form.Item;
const emailRe = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?$/;

@connect(({ frend, mail, loading }) => ({
  frend,
  current: mail.current,
  submitting: loading.effects['mail/sendMail'],
}))
@Form.create()
class MailCreate extends PureComponent {
  state = {
    canPost: false,
    fileList: [],
    currentFrend: 'to',
    content_html: '',
    content_text: '',
    data:
      '<br /><br /><br /><br /><br /><br /><br /><br /><br /><p><span style="color: rgb(187, 187, 187);">来自Mail Box Web</span></p>',
  };

  handleSubmit = e => {
    const { dispatch, form } = this.props;
    const { fileList, content_html, content_text } = this.state;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      dispatch({
        type: 'mail/sendMail',
        payload: { ...values, file_list: fileList, content_html, content_text },
      });
    });
  };

  handleChangeTo = (value, key) => {
    const { form } = this.props;
    const { currentFrend } = this.state;
    const { setFieldsValue, getFieldValue } = form;
    const oldTo = getFieldValue(currentFrend) || [];
    if (emailRe.test(value)) {
      let newTo = oldTo;
      if (key === 'add') {
        if (Array.isArray(value)) {
          newTo = [...oldTo, ...value];
        } else {
          newTo = [...oldTo, value];
        }
      } else if (key === 'del') {
        if (Array.isArray(value)) {
          newTo = oldTo.filter(old => value.indexOf(old) === -1);
        } else {
          newTo = oldTo.filter(old => old !== value);
        }
      }
      const uniqueTo = newTo.filter((v, i, a) => a.indexOf(v) === i);
      if (currentFrend === 'to') {
        setFieldsValue({ to: uniqueTo });
      } else if (currentFrend === 'cc') {
        setFieldsValue({ cc: uniqueTo });
      }
    }
  };

  handleCanPost = value => {
    this.setState({ canPost: value });
  };

  handleChangeContent = (content_html, content_text) => {
    this.setState({ content_html, content_text });
  };

  handleSaveDraft = () => {
    const { dispatch, form } = this.props;
    const { fileList, content_html, content_text } = this.state;
    const values = form.getFieldsValue();
    dispatch({
      type: 'mail/saveDraft',
      payload: { ...values, file_list: fileList, content_html, content_text },
    });
  };

  handleChange = info => {
    let { fileList } = info;

    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.file;
      }
      return file;
    });

    // // 3. Filter successfully uploaded files according to response from server
    fileList = fileList.filter(file => {
      if (file.response) {
        return file.response.status !== 'error';
      }
      return true;
    });
    this.setState({ fileList });
  };

  render() {
    const { form, current } = this.props;
    const { getFieldDecorator } = form;

    const { canPost, data } = this.state;
    const uploadSetting = {
      name: 'file',
      action: '/api/upload/',
      headers: {
        authorization: 'authorization-text',
      },
      onChange: this.handleChange,
    };
    return (
      <PageHeaderWrapper>
        <Layout>
          <Layout.Content>
            <Card bordered={false} style={{ minHeight: 600 }}>
              <Form onSubmit={this.handleSubmit}>
                <FormItem label="收件人" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                  {getFieldDecorator('to', {
                    rules: [
                      { required: true, message: '必须有1个收件人' },
                      { max: 50, type: 'array', message: '最多只能同时发给50个人' },
                      (rule, value, callback) => {
                        const errors = [];
                        if (value) {
                          value.every(v => {
                            if (!emailRe.test(v)) {
                              errors.push(new Error(`${v}不是合法email`, rule.field));
                              return false;
                            }
                            return true;
                          });
                        }
                        callback(errors);
                      },
                    ],
                    initialValue: current.to,
                  })(
                    <Select
                      mode="tags"
                      placeholder="收件人email"
                      style={{ width: '100%' }}
                      tokenSeparators={[',']}
                      onFocus={() => this.setState({ currentFrend: 'to' })}
                    />
                  )}
                </FormItem>
                <FormItem label="抄送给" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                  {getFieldDecorator('cc', {
                    rules: [
                      (rule, value, callback) => {
                        const errors = [];
                        if (value) {
                          value.every(v => {
                            if (!emailRe.test(v)) {
                              errors.push(new Error(`${v}不是合法email`, rule.field));
                              return false;
                            }
                            return true;
                          });
                        }
                        callback(errors);
                      },
                    ],
                    initialValue: current.cc,
                  })(
                    <Select
                      mode="tags"
                      placeholder="收件人email"
                      style={{ width: '100%' }}
                      tokenSeparators={[',']}
                      onFocus={() => this.setState({ currentFrend: 'cc' })}
                    />
                  )}
                </FormItem>
                <FormItem label="主题" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                  {getFieldDecorator('subject', {
                    rules: [{ required: true, message: '请填写主题' }],
                    initialValue: current.subject,
                  })(<Input placeholder="邮件主题" />)}
                </FormItem>
                <FormItem label="内容" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
                  {getFieldDecorator('content_html', {
                    rules: [{ required: true, message: '请填写邮件内容' }],
                  })(
                    <QuillEditor
                      data={current.content_html || data}
                      isEditor
                      onCanPost={this.handleCanPost}
                      canPost={canPost}
                      onChange={this.handleChangeContent}
                    />
                  )}
                </FormItem>
                <FormItem wrapperCol={{ span: 22, offset: 2 }}>
                  <Upload {...uploadSetting}>
                    <Button>
                      <Icon type="link" theme="outlined" />
                      增加附件
                    </Button>
                  </Upload>
                </FormItem>
                <FormItem wrapperCol={{ span: 22, offset: 2 }}>
                  <Button type="primary" htmlType="submit">
                    发送
                  </Button>
                  <Button onClick={this.handleSaveDraft} style={{ marginLeft: 20 }}>
                    存草稿
                  </Button>
                </FormItem>
              </Form>
            </Card>
          </Layout.Content>
          <Layout.Sider theme="light" width={240}>
            <RightFrend handleChangeTo={this.handleChangeTo} />
          </Layout.Sider>
        </Layout>
      </PageHeaderWrapper>
    );
  }
}

export default MailCreate;
