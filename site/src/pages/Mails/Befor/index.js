import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import { Card, Popconfirm, Input, List } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './my.less';

const { Search } = Input;

/* eslint react/no-multi-comp:0 */
@connect(({ draft, loading }) => ({
  draft,
  loading: loading.models.draft,
}))
class Befor extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'draft/fetch',
    });
  }

  handleSearch = value => {
    const { dispatch } = this.props;
    dispatch({
      type: 'draft/fetch',
      payload: { s: value },
    });
  };

  handleDelete = item => {
    const { dispatch } = this.props;
    dispatch({
      type: 'mail/remove',
      payload: { uid: item.id, mailBox: 'Drafts' },
    });
  };

  handleEditMail = item => {
    const { dispatch } = this.props;
    dispatch({
      type: 'mail/saveCurrent',
      payload: item,
    });
    router.push('/mails/create');
  };

  render() {
    const {
      draft: { list },
      loading,
    } = this.props;
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
            </div>
            <List
              className="demo-loadmore-list"
              loading={loading}
              itemLayout="horizontal"
              dataSource={list}
              renderItem={item => (
                <List.Item
                  actions={[
                    <a onClick={() => this.handleEditMail(item)}>编辑</a>,
                    <Popconfirm
                      title="是否删除?"
                      onConfirm={() => this.handleDelete(item)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <a>删除</a>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.subject || '(无主题)'}
                    description={`保存时间: ${moment(item.dateTime).format('YYYY-MM-DD HH:mm:ss')}`}
                  />
                </List.Item>
              )}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Befor;
