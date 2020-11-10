import React, { FC } from 'react';
import { Spin } from 'antd';
interface LoadingProps {
  className?: string;
}
const Loading: FC<LoadingProps> = ({ className = 'height-48' }) => <div className={className}>
  <Spin size="large" />
</div>;

export default Loading;
