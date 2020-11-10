import { Checkbox, Input, Pagination, Radio, Select, Space, Switch } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { plainOptions, size } from '../Common';
import { useStore } from '../Context';
import Mapping from '../models/Mapping';
import { Progressing } from './Common';

const { Option } = Select;
const { Search } = Input;


const CheckboxGroup = Checkbox.Group;

export const CategoryComboMapping = observer(() => {
  const store = useStore();
  useEffect(() => {
    store.currentAggregateMapping.autoMapCategoryOptionCombos();
  }, [store])

  const display = (record: Mapping) => {
    return <Select
      allowClear
      showSearch
      placeholder="Mapping type"
      size={size}
      style={{ width: '100%', padding: 0, margin: 0 }}
      onChange={record.setMapping}
      value={record.mapping}
      filterOption={false}
      onSearch={record.searchMappings(store.currentAggregateMapping.searchCombos)}
    >
      {record.mappings.map((combo: any) => <Option key={combo.id} value={combo.id}>{combo.name}</Option>)}
    </Select>
  }
  return <Space style={{ width: '100%', height: '100%' }} direction="vertical">
    <Space direction="horizontal">
      <Radio.Group size={size} onChange={store.currentAggregateMapping.cocFilter.onFilterChange} value={store.currentAggregateMapping.cocFilter.filter}>
        <Radio value="unmapped">Unmapped</Radio>
        <Radio value="mapped">Mapped</Radio>
      </Radio.Group>
      {store.currentAggregateMapping.cocFilter.filter === 'mapped' && <CheckboxGroup
        options={plainOptions}
        value={store.currentAggregateMapping.cocFilter.mapper}
        onChange={store.currentAggregateMapping.cocFilter.onMapperChange}
      />}
      <Search size={size} placeholder="input search text" onSearch={store.currentAggregateMapping.cocFilter.setSearch} enterButton />
      <span>Source Combos First</span>
      <Switch onChange={store.currentAggregateMapping.changeSourceComboFirst} checked={store.currentAggregateMapping.sourceCombosFirst} />

    </Space>
    <div className="table-wrapper overflow-auto" style={{ height: window.innerHeight - 300 }}>
      <table className="table-fixed w-full">
        <thead className="bg-gray-400">
          <tr>
            <th className="border-b border-t p-2 w-1/2">{store.currentAggregateMapping.cocMappingHeaders.source}</th>
            <th className="border-b border-t p-2 w-1/2">{store.currentAggregateMapping.cocMappingHeaders.destination}</th>
          </tr>
        </thead>
        <tbody>
          {store.currentAggregateMapping.currentCombos.combos.map((ou: any) => <tr key={ou.id} className="hover:bg-gray-200">
            <td className="border-b p-1">{ou.name}</td>
            <td className="border-b p-1">{display(ou)}</td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <Pagination
      className="text-right"
      current={store.currentAggregateMapping.paging.combos.current}
      total={store.currentAggregateMapping.currentCombos.total}
      hideOnSinglePage={true}
      showQuickJumper
      pageSizeOptions={['10', '15', '18', '20', '25', '50', '100']}
      pageSize={store.currentAggregateMapping.paging.combos.pageSize}
      showTotal={(total: number, range: [number, number]) => <p className="text-lg">({total})</p>}
      onChange={store.currentAggregateMapping.onPageChange("combos")} />

    <Progressing />
  </Space>
});
