import React, { Component, Fragment } from 'react';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import { Button, Menu, Dropdown, Icon, Card, Upload } from 'antd';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import QuillEditor from '@/components/Editor/QuillView';
import styles from './my.less';

const { Description } = DescriptionList;
const ButtonGroup = Button.Group;

const getWindowWidth = () => window.innerWidth || document.documentElement.clientWidth;

@connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/detail'],
}))
class ViewDetail extends Component {
  state = {
    stepDirection: 'horizontal',
  };

  componentDidMount() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: 'profile/detail',
      payload: { id: params.id, mailBox: params.mailBox },
    });

    this.setStepDirection();
    window.addEventListener('resize', this.setStepDirection, { passive: true });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setStepDirection);
    this.setStepDirection.cancel();
  }

  @Bind()
  @Debounce(200)
  setStepDirection() {
    const { stepDirection } = this.state;
    const w = getWindowWidth();
    if (stepDirection !== 'vertical' && w <= 576) {
      this.setState({
        stepDirection: 'vertical',
      });
    } else if (stepDirection !== 'horizontal' && w > 576) {
      this.setState({
        stepDirection: 'horizontal',
      });
    }
  }

  handleDelete = item => {
    const {
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: 'mail/remove',
      payload: { uid: [item.id], mailBox: params.mailBox },
    });
    router.push('/mails/mailbox');
  };

  getFileList = () => {
    const {
      profile: { current },
    } = this.props;
    if (!current || !current.body.files || current.body.files.length < 1) {
      return [];
    }
    return current.body.files.map(oneFile => {
      const newOne = { ...oneFile };
      if (newOne.partNumber) {
        newOne.url = `/api/file/${current.id}/?part=${newOne.partNumber}`;
        newOne.status = 'done';
        newOne.uid = newOne.partNumber;
      }
      if (newOne.fileName) {
        newOne.name = newOne.fileName;
      }
      return newOne;
    });
  };

  handleMore = key => {
    const {
      dispatch,
      profile: { current },
      match: { params },
    } = this.props;
    if (key === 'frend') {
      let frend = current.from;
      const user = current.from.split('@', 1);
      if (user.length > 0) {
        [frend] = user;
      }
      dispatch({
        type: 'frend/addFrend',
        payload: { email: current.from, name: frend },
      });
    }
    if (key === 'trash') {
      dispatch({
        type: 'trash/append',
        payload: { mail_uid: current.id, email: current.from, describes: current.from },
      });
    }
    if (key === 'falg') {
      dispatch({
        type: 'mail/addFlag',
        payload: { uid: [current.id], mailBox: params.mailBox, flag: 'Work' },
      });
    }
  };

  render() {
    const {
      profile: { current },
      loading,
    } = this.props;
    if (!current.id) return null;
    const menu = (
      <Menu onClick={({ key }) => this.handleMore(key)}>
        <Menu.Item key="frend">保存联系人</Menu.Item>
        <Menu.Item key="trash">举报</Menu.Item>
        <Menu.Item key="falg">标记</Menu.Item>
      </Menu>
    );

    const action = (
      <Fragment>
        <ButtonGroup>
          <Button>转发</Button>
          <Button onClick={() => this.handleDelete(current)}>删除</Button>
          <Dropdown overlay={menu} placement="bottomRight">
            <Button>
              <Icon type="ellipsis" />
            </Button>
          </Dropdown>
        </ButtonGroup>
        <Button type="primary">回复</Button>
      </Fragment>
    );

    const description = (
      <DescriptionList className={styles.headerList} size="small" col="1">
        <Description term="发件人">{current.from}</Description>
        <Description term="收件人">{current.to.join(', ')}</Description>
        <Description term="时 间">
          {moment(current.dateTime).format('YYYY-MM-DD HH:mm:ss')}
        </Description>
      </DescriptionList>
    );
    const fileList = this.getFileList();
    return (
      <PageHeaderWrapper
        title={current.subject || `(无标题)`}
        logo={
          <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png" />
        }
        action={action}
        content={description}
      >
        <Card bordered={false} loading={loading}>
          {current.body.subtype === 'plain' ? (
            <pre>{current.body.content}</pre>
          ) : (
            <QuillEditor data={current.body.content} />
          )}
          {current.body.files && <Upload defaultFileList={fileList} />}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ViewDetail;
