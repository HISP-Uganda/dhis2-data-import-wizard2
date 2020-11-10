import { LoadingOutlined } from '@ant-design/icons';
import { Modal, Space } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import { useStore } from '../Context';

const Display = observer(() => {
  const store = useStore()
  return <Space direction="vertical" className="text-white w-full text-lg text-center">
    <LoadingOutlined style={{ fontSize: 32, color: 'white' }} spin />
    <span>{store.currentAggregateMapping.message}</span>
  </Space>
});

export const Progressing = observer(() => {
  const store = useStore()
  return <Modal
    centered
    closable={false}
    visible={store.loading || store.currentAggregateMapping.loading}
    className="p-0 m-0"
    footer={null}
    // width="100"
    modalRender={() => <Display />}
  />
})
