import { Table } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { useStore } from '../Context';
import { Progressing } from './Common';


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
    title: 'Period Type',
    dataIndex: 'periodType',
    key: 'periodType',
  }
];

export const DataSets = observer(() => {
  const store = useStore();
  useEffect(() => {
    store.loadDataSets();
  }, [store]);
  return <div className="my-4">
    <Table
      columns={columns}
      size="small"
      dataSource={store.dataSets} rowKey="id"
      rowClassName={() => "cursor-pointer"}
      onRow={(record: any, rowIndex) => {
        return {
          onClick: (event) => {
            store.currentAggregateMapping.setD2(store.d2);
            store.currentAggregateMapping.setLocalDataSet(record.id);
            store.nextAggStep();
          },
          onDoubleClick: (event) => { },
          onContextMenu: (event) => { },
          onMouseEnter: (event) => { },
          onMouseLeave: (event) => { },
        };
      }}
    />
    <Progressing />
  </div>
});
