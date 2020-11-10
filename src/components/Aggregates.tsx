import { Table } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { useStore } from '../Context';
import AggregateMapping from '../models/AggregateMapping';
import Loading from './Loading';

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
];

export const Aggregates = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.fetchSavedAggregates();
  }, [store]);

  if (store.loading) {
    return <Loading />
  }
  return (<Table
    columns={columns} rowKey="id"
    dataSource={store.aggregateMappings}
    rowClassName={() => "cursor-pointer"}
    onRow={(record: AggregateMapping, rowIndex) => {
      return {
        onClick: (event) => {
          record.setD2(store.d2)
          store.setCurrentAggregateMapping(record);
          store.setCurrentAggStep(2);
        },
        onDoubleClick: event => { },
        onContextMenu: event => { },
        onMouseEnter: event => { },
        onMouseLeave: event => { },
      };
    }}
  />)
});
