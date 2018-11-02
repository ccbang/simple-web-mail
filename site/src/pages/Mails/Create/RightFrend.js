import React from 'react';
import { connect } from 'dva';
import { Tree, Icon, AutoComplete } from 'antd';

const { TreeNode } = Tree;

@connect(({ frend, loading }) => ({
  frend,
  fetching: loading.models.frend,
}))
class RightFrend extends React.Component {
  state = {
    checkedKeys: [],
    selectedKeys: [],
    searchData: [],
  };

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'frend/fetch',
      payload: { pageSize: 100 },
    });
  };

  onCheck = checkedKeys => {
    const {
      handleChangeTo,
      frend: { list },
    } = this.props;
    const { checkedKeys: oldCheck } = this.state;
    const addMailID = checkedKeys.filter(n => oldCheck.indexOf(n) === -1);
    const delMailID = oldCheck.filter(n => checkedKeys.indexOf(n) === -1);
    const addEmails = list.filter(l => addMailID.indexOf(l.id.toString()) !== -1).map(f => f.email);
    const delEmails = list.filter(l => delMailID.indexOf(l.id.toString()) !== -1).map(f => f.email);
    handleChangeTo(addEmails, 'add');
    handleChangeTo(delEmails, 'del');
    this.setState({ checkedKeys });
  };

  onSelect = (selectedKeys, info) => {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode
            icon={<Icon type="team" theme="outlined" />}
            title={item.name}
            key={item.id}
            dataRef={item}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          icon={<Icon type="user" theme="outlined" />}
          title={item.name}
          key={item.id}
          dataRef={item}
        />
      );
    });
  };

  handleSearch = value => {
    const {
      frend: { list },
    } = this.props;
    const listData = list.filter(frend => frend.name.indexOf(value) > -1);
    const searchData = listData.map(d => d.email);
    this.setState({
      searchData,
    });
  };

  handleSelectSearch = value => {
    const {
      frend: { list },
      handleChangeTo,
    } = this.props;
    const { checkedKeys } = this.state;
    const selectKey = list.find(fr => fr.email === value);
    const findRet = checkedKeys.filter(s => s === selectKey.id);
    if (findRet.length === 0) {
      const newCheckedKeys = [...checkedKeys, selectKey.id];
      this.setState({ checkedKeys: newCheckedKeys });
      handleChangeTo(selectKey.email, 'add');
    }
  };

  render() {
    const { checkedKeys, selectedKeys, searchData } = this.state;
    const {
      frend: { list },
    } = this.props;
    const treeData = [{ name: '好友', id: 'all', children: list }];
    return (
      <div
        style={{
          paddingTop: 10,
          paddingRight: 10,
          maxHeight: 600,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <AutoComplete
          dataSource={searchData}
          style={{ width: '100%' }}
          onSelect={this.handleSelectSearch}
          onSearch={this.handleSearch}
          placeholder="search user"
        />
        <Tree
          checkable
          showIcon
          defaultExpandAll
          onCheck={this.onCheck}
          checkedKeys={checkedKeys}
          onSelect={this.onSelect}
          selectedKeys={selectedKeys}
        >
          {this.renderTreeNodes(treeData)}
        </Tree>
      </div>
    );
  }
}

export default RightFrend;
