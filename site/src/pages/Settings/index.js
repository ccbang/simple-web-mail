import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Form, Input, Button, InputNumber, DatePicker, Modal, Badge, Checkbox } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatBytes } from '@/utils/utils';

import styles from './my.less';

const { Search } = Input;

const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['default', 'processing', 'success', 'error'];
const status = ['关闭', '被重置', '正常', '异常'];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible, currentUser } = props;
  const splitDomain = currentUser.email.split('@');
  const domain = splitDomain[splitDomain.length - 1];
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      const birth = fieldsValue.date_of_birth.format('YYYY-MM-DD');
      const email = `${fieldsValue.email}@${domain}`;
      const formValues = { ...fieldsValue, date_of_birth: birth, email };
      handleAdd(formValues);
    });
  };
  return (
    <Modal
      destroyOnClose
      title="新建用户"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem key="name" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="名字">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入规则名称！' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem key="email" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名/email">
        {form.getFieldDecorator('email', {
          rules: [{ required: true, message: '请输入规则名称！' }],
        })(<Input placeholder="请输入" addonAfter={`@${domain}`} />)}
      </FormItem>
      <FormItem
        key="quota"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="可用空间"
        extra={formatBytes(form.getFieldValue('quota'))}
      >
        {form.getFieldDecorator('quota', {
          rules: [{ required: true, message: '请输入至少1024' }],
          initialValue: 1024,
        })(<InputNumber placeholder="请输入至少1024" min={1024} style={{ width: '100%' }} />)}
      </FormItem>
      <FormItem key="date_of_birth" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="生日">
        {form.getFieldDecorator('date_of_birth', {
          rules: [{ required: true, message: '请输入他的生日' }],
        })(<DatePicker placeholder="请输入他的生日" style={{ width: '100%' }} />)}
      </FormItem>
      <FormItem key="is_active" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="是否可用">
        {form.getFieldDecorator('is_active', {
          rules: [{ required: true, message: '请设置用户状态' }],
        })(<Checkbox placeholder="请设置用户状态" />)}
      </FormItem>
    </Modal>
  );
});

@Form.create()
class UpdateForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      formVals: {
        name: props.values.name,
        email: props.values.email,
        id: props.values.id,
        quota: props.values.quota,
        date_of_birth: props.values.date_of_birth,
        is_active: props.values.is_active,
      },
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  handleNext = () => {
    const { form, handleUpdate } = this.props;
    const { formVals: oldValue } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const formVals = { ...oldValue, ...fieldsValue };
      const birth = formVals.date_of_birth.format('YYYY-MM-DD');
      this.setState(
        {
          formVals: { ...formVals, date_of_birth: birth },
        },
        () => {
          handleUpdate({ ...formVals, date_of_birth: birth });
        }
      );
    });
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, form } = this.props;
    const { formVals } = this.state;
    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="规则配置"
        visible={updateModalVisible}
        footer={[
          <Button key="cancel" onClick={() => handleUpdateModalVisible()}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => this.handleNext()}>
            完成
          </Button>,
        ]}
        onCancel={() => handleUpdateModalVisible()}
      >
        <FormItem key="name" {...this.formLayout} label="名字">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入规则名称！' }],
            initialValue: formVals.name,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem key="email" {...this.formLayout} label="用户名/email">
          {form.getFieldDecorator('email', {
            rules: [{ required: true, message: '请输入规则名称！' }],
            initialValue: formVals.email,
          })(<Input placeholder="请输入" disabled />)}
        </FormItem>
        <FormItem
          key="quota"
          {...this.formLayout}
          label="可用空间"
          extra={formatBytes(form.getFieldValue('quota') || formVals.quota)}
        >
          {form.getFieldDecorator('quota', {
            rules: [{ required: true, message: '请输入至少1024' }],
            initialValue: formVals.quota,
          })(<InputNumber placeholder="请输入至少1024" min={1024} style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem key="date_of_birth" {...this.formLayout} label="生日">
          {form.getFieldDecorator('date_of_birth', {
            rules: [{ required: true, message: '请输入他的生日' }],
            initialValue: moment(formVals.date_of_birth),
          })(<DatePicker placeholder="请输入他的生日" style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem key="is_active" {...this.formLayout} label="是否可用">
          {form.getFieldDecorator('is_active', {
            rules: [{ required: true, message: '请设置用户状态' }],
            initialValue: formVals.is_active,
          })(<Checkbox placeholder="请设置用户状态" />)}
        </FormItem>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ virtual, user, loading }) => ({
  virtual,
  currentUser: user.currentUser,
  loading: loading.models.virtual,
}))
@Form.create()
class ManageView extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    selectedRows: [],
    search: {},
    stepFormValues: {},
  };

  columns = [
    {
      title: '用户名称',
      dataIndex: 'email',
    },
    {
      title: '名字',
      dataIndex: 'name',
    },
    {
      title: '可用空间',
      dataIndex: 'quota',
      sorter: true,
      align: 'right',
      render: value => formatBytes(value),
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      filters: [
        {
          text: status[0],
          value: 0,
        },
        {
          text: status[1],
          value: 1,
        },
        {
          text: status[2],
          value: 2,
        },
        {
          text: status[3],
          value: 3,
        },
      ],
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '上次登录时间',
      dataIndex: 'last_login',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <a onClick={() => this.handleUpdateModalVisible(true, record)}>修改</a>
      ),
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'virtual/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { search } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      search,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'virtual/fetch',
      payload: params,
    });
  };

  handleDelete = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;
    dispatch({
      type: 'virtual/remove',
      payload: {
        key: selectedRows.map(row => row.id),
      },
      callback: () => {
        this.setState({
          selectedRows: [],
        });
      },
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = value => {
    const { dispatch } = this.props;

    dispatch({
      type: 'virtual/fetch',
      payload: { search: value },
    });
    this.setState({ search: value });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      stepFormValues: record || {},
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'virtual/add',
      payload: fields,
    });

    this.handleModalVisible();
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'virtual/update',
      payload: fields,
    });

    this.handleUpdateModalVisible();
  };

  render() {
    const { virtual, loading, currentUser } = this.props;
    const { selectedRows, modalVisible, updateModalVisible, stepFormValues } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <PageHeaderWrapper title="用户管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              <Search
                placeholder="搜索"
                onSearch={value => this.handleSearch(value)}
                style={{ width: 200, marginRight: 10 }}
              />
              {selectedRows.length > 0 && <Button onClick={this.handleDelete}>删除</Button>}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              rowKey="id"
              loading={loading}
              data={virtual}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} currentUser={currentUser} />
        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default ManageView;
