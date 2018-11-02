import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { Card, Form, Button, Badge, Input, Icon } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './my.less';

const { Search } = Input;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

export const getBadge = item => {
  const result = [];
  if (!item || !item.flags) {
    return result;
  }
  if (item.flags.indexOf('\\Seen') !== -1) {
    result.push(<Badge key={`default-${item.id}`} status="default" />);
  } else {
    result.push(<Badge key={`success-${item.id}`} status="success" />);
  }
  if (item.flags.indexOf('\\Flagged') !== -1) {
    result.push(<Badge key={`error-${item.id}`} status="error" />);
  }
  if (item.flags.indexOf('Work') !== -1) {
    result.push(<Badge key={`warning-${item.id}`} status="warning" />);
  }
  return result;
};

/* eslint react/no-multi-comp:0 */
@connect(({ mailbox, loading }) => ({
  mailbox,
  loading: loading.models.mailbox,
}))
@Form.create()
class MailBox extends PureComponent {
  state = {
    selectedRows: [],
    formValues: {},
  };

  columns = [
    {
      title: '来至',
      dataIndex: 'from',
    },
    {
      title: '标题',
      dataIndex: 'subject',
      render: (text, record) => (
        <span>
          {getBadge(record)}
          {record.hasFile && <Icon type="link" theme="outlined" style={{ marginRight: 10 }} />}
          {text}
        </span>
      ),
    },
    {
      title: '时间',
      dataIndex: 'dateTime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => <Link to={`/mails/detail/INBOX/${record.id}`}>详情</Link>,
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mailbox/fetch',
    });
  }

  handleSearch = value => {
    const { dispatch } = this.props;
    dispatch({
      type: 'mailbox/fetch',
      payload: { s: value },
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'mailbox/fetch',
      payload: params,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleMoveToDelete = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const mailUids = selectedRows.map(row => row.id);
    dispatch({
      type: 'mail/remove',
      payload: { uid: mailUids, mailBox: 'INBOX' },
    });
  };

  handleAddSeenFlag = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const mailUids = selectedRows.map(row => row.id);
    dispatch({
      type: 'mail/addFlag',
      payload: { uid: mailUids, flag: '\\Seen', mailBox: 'INBOX' },
    });
  };

  render() {
    const { mailbox, loading } = this.props;
    const { selectedRows } = this.state;
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Search
                placeholder="搜索邮件"
                onSearch={value => this.handleSearch(value)}
                style={{ width: 200, marginRight: 10 }}
              />
              {selectedRows.length > 0 && (
                <span>
                  <Button onClick={() => this.handleMoveToDelete()}>删除</Button>
                  <Button onClick={() => this.handleAddSeenFlag()}>标记已读</Button>
                </span>
              )}
            </div>
            <StandardTable
              rowKey="id"
              selectedRows={selectedRows}
              loading={loading}
              data={mailbox}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MailBox;
