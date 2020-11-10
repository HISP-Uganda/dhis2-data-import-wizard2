import { DatePicker, InputNumber, Space, Select, Checkbox } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { size } from '../Common';
import { useStore } from '../Context';
import { WizardObject } from '../models/WizardObject';

const { Option } = Select
const { RangePicker } = DatePicker;
export const PeriodMapping = observer(() => {
  const store = useStore();
  useEffect(() => {
    store.currentAggregateMapping.changeDefaultLevels();
  }, [store])
  return <Space direction="vertical" style={{ width: '100%' }}>
    <Space style={{ width: '100%' }}>
      <span>Period</span>
      <RangePicker picker={store.currentAggregateMapping.picker} size={size} value={store.currentAggregateMapping.workingPeriod} onChange={store.currentAggregateMapping.onPeriodChange} />
    </Space>

    {store.currentAggregateMapping.type === "5" && <Space direction="vertical" style={{ width: '100%' }}>
      <Select
        size={size}
        showSearch
        allowClear
        placeholder="Select Category Option Combo"
        style={{ width: '100%', padding: 0, margin: 0 }}
        onChange={store.currentAggregateMapping.onLevelChange}
        value={store.currentAggregateMapping.importationLevel}
        filterOption={(input, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {store.currentAggregateMapping.levels.map((level: any) => <Option key={level.id} value={level.level}>{level.name}</Option>)}
      </Select>

      {store.currentAggregateMapping.organisations.length > 0 && <table className="table-fixed w-full">
        <thead className="bg-gray-400">
          <tr>
            <th className="border-b border-t p-2 w-1/6">
              <Checkbox checked={store.currentAggregateMapping.isAllChecked} onChange={store.currentAggregateMapping.checkAllOus} /> Check All
            </th>
            <th className="border-b border-t p-2 w-5/6">Source</th>
          </tr>
        </thead>
        <tbody>
          {store.currentAggregateMapping.organisations.map((ou: WizardObject) => <tr key={ou.id} className="hover:bg-gray-200">
            <td className="border-b p-1"><Checkbox checked={ou.selected} onChange={ou.changeSelection} /></td>
            <td className="border-b p-1">{ou.name}</td>
          </tr>)}
        </tbody>
      </table>}
    </Space>}

    {store.currentAggregateMapping.type === "6" && <Space style={{ width: '100%' }}>
      <span>Records Per Page</span>
      <InputNumber value={store.currentAggregateMapping.pageSize} min={100} max={1000000} onChange={store.currentAggregateMapping.onPageSizeChange} />
    </Space>}
  </Space>
});
