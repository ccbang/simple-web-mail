import React from 'react';
import { Button } from 'antd';
import Link from 'umi/link';
import Result from '@/components/Result';
import styles from './ForgotResult.less';

const actions = (
  <div className={styles.actions}>
    <Link to="/user/login">
      <Button size="large" type="primary">
        我知道了
      </Button>
    </Link>
    <Link to="/user/forgot">
      <Button size="large">没有收到</Button>
    </Link>
  </div>
);

const ForgotResult = ({ location }) => (
  <Result
    className={styles.registerResult}
    type="success"
    title={
      <div className={styles.title}>
        你的账号 {location.state ? location.state.account : ''} 处理成功
      </div>
    }
    description="处理结果已经发往你的微信"
    actions={actions}
    style={{ marginTop: 56 }}
  />
);

export default ForgotResult;
