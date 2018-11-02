import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Icon, List } from 'antd';

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
class BindingView extends Component {
  getData = () => {
    const { currentUser } = this.props;
    return [
      {
        title: '绑定微信',
        description: currentUser.wechat_id
          ? `已经关联微信${currentUser.wechat_id}`
          : '当前账号未绑定微信',
        actions: [currentUser.wechat_id ? <a>解绑</a> : <a>绑定</a>],
        avatar: <Icon type="wechat" theme="outlined" className="taobao" />,
      },
    ];
  };

  render() {
    return (
      <Fragment>
        <List
          itemLayout="horizontal"
          dataSource={this.getData()}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta
                avatar={item.avatar}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Fragment>
    );
  }
}

export default BindingView;
