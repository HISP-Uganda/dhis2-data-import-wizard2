import { Checkbox, Input, Pagination, Radio, Select, Space, Switch } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { plainOptions, size } from '../Common';
import { useStore } from '../Context';
import Mapping from '../models/Mapping';
import { getParent } from '../utils';
import { Progressing } from './Common';

const CheckboxGroup = Checkbox.Group;

const { Search } = Input;

const { Option } = Select;
export const OrganisationMapping = observer(() => {
  const store = useStore();
  useEffect(() => {
    const call = async () => {
      await store.currentAggregateMapping.loadType1();
    }
    call();
  }, [store]);

  const display = (record: Mapping) => {
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
      onSearch={record.searchMappings(store.currentAggregateMapping.searchOrganisations)}
    >
      {record.mappings.map((ou: any) => <Option key={ou.id} value={ou.id}>{`${getParent(ou, store.currentAggregateMapping.parent)}${ou.name}`}</Option>)}
    </Select>
  }

  return <Space direction="vertical" style={{ width: '100%' }}>

    <Select size={size} placeholder="Mapping type" style={{ width: '100%' }}
      onChange={store.currentAggregateMapping.setRemoteDataSet}
      value={store.currentAggregateMapping.remoteDataSet}>
      {store.currentAggregateMapping.remoteDataSets.map((dataSet: any) => <Option key={dataSet.id} value={dataSet.id}>{dataSet.name}</Option>)}
    </Select>

    {store.currentAggregateMapping.remoteDataSet && <>
      <Space direction="horizontal" style={{ width: '100%' }}>
        <Radio.Group size={size} onChange={store.currentAggregateMapping.orgUnitFilter.onFilterChange} value={store.currentAggregateMapping.orgUnitFilter.filter}>
          <Radio value="unmapped">Unmapped</Radio>
          <Radio value="mapped">Mapped</Radio>
        </Radio.Group>
        {store.currentAggregateMapping.orgUnitFilter.filter === 'mapped' && <CheckboxGroup
          options={plainOptions}
          value={store.currentAggregateMapping.orgUnitFilter.mapper}
          onChange={store.currentAggregateMapping.orgUnitFilter.onMapperChange}
        />}
        <Search size={size} placeholder="input search text" onSearch={store.currentAggregateMapping.orgUnitFilter.setSearch} enterButton />
        <Select
          placeholder="Select to append parent"
          size={size}
          style={{ width: 180 }}
          value={store.currentAggregateMapping.parent}
          onChange={store.currentAggregateMapping.setParent}
          allowClear
        >
          <Option value="p1">Immediate Parent</Option>
          <Option value="p2">Second Parent</Option>
          <Option value="p3">Third Parent</Option>
        </Select>
        <span>Source Organisations First</span>
        <Switch onChange={store.currentAggregateMapping.changeSourceUnitsFirst} checked={store.currentAggregateMapping.sourceUnitsFirst} />
      </Space>
      <div className="table-wrapper overflow-auto" style={{ height: window.innerHeight - 300 - 25 }}>
        <table className="table-fixed w-full">
          <thead className="bg-gray-400">
            <tr>
            <th className="border-b border-t p-2 w-1/2">{store.currentAggregateMapping.orgUnitMappingHeaders.source}</th>
            <th className="border-b border-t p-2 w-1/2">{store.currentAggregateMapping.orgUnitMappingHeaders.destination}</th>
            </tr>
          </thead>
          <tbody>
            {store.currentAggregateMapping.currentOrganisations.units.map((ou: any) => <tr key={ou.id} className="hover:bg-gray-200">
              <td className="border-b p-1">{`${getParent(ou, store.currentAggregateMapping.parent)}${ou.name}`}</td>
              <td className="border-b p-1">{display(ou)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <Pagination
        className="text-right"
        current={store.currentAggregateMapping.paging.units.current}
        total={store.currentAggregateMapping.currentOrganisations.total}
        hideOnSinglePage={true}
        showQuickJumper
        pageSizeOptions={['10', '15', '18', '20', '25', '50', '100']}
        pageSize={store.currentAggregateMapping.paging.units.pageSize}
        showTotal={(total: number, range: [number, number]) => <p className="text-lg">({total})</p>}
        onChange={store.currentAggregateMapping.onPageChange("units")} />
    </>}
    <Progressing/>
  </Space>
});
