import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Link from 'umi/link';
import { Card, Form, Button, Input, Icon } from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { getBadge } from '@/pages/Mails/MailBox';

import styles from './my.less';

const { Search } = Input;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

/* eslint react/no-multi-comp:0 */
@connect(({ sent, loading }) => ({
  sent,
  loading: loading.models.sent,
}))
@Form.create()
class SendView extends PureComponent {
  state = {
    selectedRows: [],
  };

  columns = [
    {
      title: '发至',
      dataIndex: 'to',
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
      title: '发送时间',
      dataIndex: 'dateTime',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => <Link to={`/mails/detail/Sent/${record.id}`}>详情</Link>,
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sent/fetch',
    });
  }

  handleSearch = value => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sent/fetch',
      payload: { s: value },
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'sent/fetch',
      payload: params,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleDelete = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const mailUids = selectedRows.map(row => row.id);
    dispatch({
      type: 'mail/remove',
      payload: { uid: mailUids, mailBox: 'Sent' },
    });
  };

  handleRetrieve = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const mailUids = selectedRows.map(row => row.id);
    dispatch({
      type: 'mail/retrieve',
      payload: { uid: mailUids, mailBox: 'Sent' },
    });
  };

  render() {
    const { sent, loading } = this.props;
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
                  <Button onClick={() => this.handleDelete()}>删除</Button>
                  <Button onClick={() => this.handleRetrieve()}>再次发送</Button>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              rowKey="id"
              loading={loading}
              data={sent}
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

export default SendView;
