import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Form, Input, Button, Modal } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './my.less';

const { Search } = Input;

const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      destroyOnClose
      title="新建联系人"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="名字">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入联系人名称！' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="email">
        {form.getFieldDecorator('email', {
          rules: [{ required: true, message: '请输入联系人email！' }],
        })(<Input placeholder="请输入" />)}
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
        id: props.values.id,
        email: props.values.email,
      },
    };

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 13 },
    };
  }

  handleSave = () => {
    const { form, handleUpdate } = this.props;
    const { formVals: oldValue } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const formVals = { ...oldValue, ...fieldsValue };
      this.setState(
        {
          formVals,
        },
        () => {
          handleUpdate(formVals);
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
        title="修改联系人"
        visible={updateModalVisible}
        footer={[
          <Button key="cancel" onClick={() => handleUpdateModalVisible()}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => this.handleSave()}>
            保存
          </Button>,
        ]}
        onCancel={() => handleUpdateModalVisible()}
      >
        <FormItem key="name" {...this.formLayout} label="名字">
          {form.getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入名字！' }],
            initialValue: formVals.name,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem key="email" {...this.formLayout} label="email">
          {form.getFieldDecorator('email', {
            initialValue: formVals.email,
          })(<Input placeholder="请输入" />)}
        </FormItem>
      </Modal>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ frend, loading }) => ({
  frend,
  loading: loading.models.frend,
}))
@Form.create()
class FrendList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    selectedRows: [],
    formValues: {},
    search: '',
  };

  columns = [
    {
      title: '名字',
      dataIndex: 'name',
    },
    {
      title: 'email',
      dataIndex: 'email',
    },
    {
      title: '发送次数',
      dataIndex: 'times',
      sorter: true,
      align: 'right',
      // mark to display a total number
      needTotal: true,
    },
    {
      title: '上次联系时间',
      dataIndex: 'notice_time',
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
      type: 'frend/fetch',
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
      ...filters,
      search,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'frend/fetch',
      payload: params,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      formValues: record || {},
    });
  };

  handleDelete = () => {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    const deleteList = selectedRows.map(s => s.id);
    dispatch({
      type: 'frend/bulkRemove',
      payload: { deleteList },
    });
    this.setState({ selectedRows: [] });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'frend/addFrend',
      payload: fields,
    });

    this.handleModalVisible();
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'frend/update',
      payload: fields,
    });

    this.handleUpdateModalVisible();
  };

  handleSearch = value => {
    const { dispatch } = this.props;
    this.setState({ search: value });
    dispatch({
      type: 'frend/fetch',
      payload: { search: value },
    });
  };

  render() {
    const { frend, loading } = this.props;
    const { selectedRows, modalVisible, updateModalVisible, formValues } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    return (
      <PageHeaderWrapper>
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
              data={frend}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
        {formValues && Object.keys(formValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={formValues}
          />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default FrendList;
