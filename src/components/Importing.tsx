import { Table } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { useStore } from '../Context';
import { Progressing } from './Common';


const columns = [
  { title: 'Affected', dataIndex: 'object', key: 'object' },
  { title: 'Message', dataIndex: 'value', key: 'value' }
];

export const Importing = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.currentAggregateMapping.queryData();
  }, [store]);

  return (<div>
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th className="border-b border-t p-2">Message</th>
          <th className="border-b border-t p-2">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border-b p-1">Imported</td>
          <td className="border-b p-1">
            {store.currentAggregateMapping.processedResponses.importCount.imported}
          </td>
        </tr>
        <tr>
          <td className="border-b p-1">Updated </td>
          <td className="border-b p-1">
            {store.currentAggregateMapping.processedResponses.importCount.updated}
          </td>
        </tr>
        <tr>
          <td className="border-b p-1">Ignored </td>
          <td className="border-b p-1">
            {store.currentAggregateMapping.processedResponses.importCount.ignored}
          </td>
        </tr>
        <tr>
          <td className="border-b p-1">Deleted </td>
          <td className="border-b p-1">
            {store.currentAggregateMapping.processedResponses.importCount.deleted}
          </td>
        </tr>
      </tbody>
    </table>
    <h4>Conflicts</h4>
    <Table
      columns={columns}
      size="small"
      rowKey="object"
      pagination={{ defaultPageSize: 5 }}
      dataSource={store.currentAggregateMapping.processedResponses.conflicts}
    />

    <Progressing/>
  </div>);
});
