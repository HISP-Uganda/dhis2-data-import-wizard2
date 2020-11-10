import { Select, Space, Radio, Checkbox, Input, Switch } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { plainOptions, size } from '../Common';
import { useStore } from '../Context';
import { Progressing } from './Common';

const { Option } = Select;
const CheckboxGroup = Checkbox.Group;
const { Search } = Input;

export const AttributionMapping = observer(() => {
  const store = useStore();
  useEffect(() => {
    store.currentAggregateMapping.autoMapAttributes();
  }, [store])
  const display = (record: any) => {
    // return <Select
    //   size={size}
    //   showSearch
    //   allowClear
    //   placeholder="Mapping type"
    //   style={{ width: '100%', padding: 0, margin: 0 }}
    //   onChange={record.setMapping}
    //   value={record.mapping}
    //   filterOption={(input, option: any) =>
    //     option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    //   }
    // >
    //   {options.map((ou: any) => <Option key={ou.id} value={ou.id}>{ou.name}</Option>)}
    // </Select>

    return <Select
      allowClear
      showSearch
      onClear={record.onClear}
      placeholder="Organisation Mapping"
      style={{ width: '100%', padding: 0, margin: 0 }}
      onChange={record.setMapping}
      value={record.mapping}
      // onSelect={record.onSelect}
      filterOption={false}
      onSearch={record.searchMappings(store.currentAggregateMapping.searchAttributes)}
    >
      {record.mappings.map((ou: any) => <Option key={ou.id} value={ou.id}>{ou.name}</Option>)}
    </Select>
  }

  if (store.currentAggregateMapping.type === '6') {
    return <Select
      size={size}
      showSearch
      allowClear
      placeholder="Select Category Option Combo"
      style={{ width: '100%', padding: 0, margin: 0 }}
      onChange={store.currentAggregateMapping.onSelectedCOCChange}
      value={store.currentAggregateMapping.selectedCOC}
      filterOption={(input, option: any) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {store.currentAggregateMapping.localAttribution.map((ou: any) => <Option key={ou.id} value={ou.id}>{ou.name}</Option>)}
    </Select>
  }

  return <Space className="my-4" direction="vertical" size="large" style={{ width: '100%', padding: 0, margin: 0 }}>
    <Space direction="horizontal" style={{ width: '100%' }}>
      <Radio.Group size={size} onChange={store.currentAggregateMapping.attributeFilter.onFilterChange} value={store.currentAggregateMapping.attributeFilter.filter}>
        <Radio value="unmapped">Unmapped</Radio>
        <Radio value="mapped">Mapped</Radio>
      </Radio.Group>
      {store.currentAggregateMapping.attributeFilter.filter === 'mapped' && <CheckboxGroup
        options={plainOptions}
        value={store.currentAggregateMapping.attributeFilter.mapper}
        onChange={store.currentAggregateMapping.attributeFilter.onMapperChange}
      />}
      <Search size={size} placeholder="input search text" onSearch={store.currentAggregateMapping.attributeFilter.setSearch} enterButton />
      <span>Source Attributes First</span>
      <Switch onChange={store.currentAggregateMapping.changeSourceAttributesFirst} checked={store.currentAggregateMapping.sourceAttributesFirst} />
    </Space>
    <table className="table-fixed w-full">
      <thead className="bg-gray-400">
        <tr>
          <th className="border-b border-t p-2 w-1/2">{store.currentAggregateMapping.attributeMappingHeaders.source}</th>
          <th className="border-b border-t p-2 w-1/2">{store.currentAggregateMapping.attributeMappingHeaders.destination}</th>
        </tr>
      </thead>
      <tbody>
        {store.currentAggregateMapping.currentAttributes.map((ou: any) => <tr key={ou.id} className="hover:bg-gray-200">
          <td className="border-b p-1">{ou.name}</td>
          <td className="border-b p-1">{display(ou)}</td>
        </tr>)}
      </tbody>
    </table>
    <Progressing />
  </Space>
});
