import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Input, Radio, Space, Select, Checkbox } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { size, whatIndicators } from '../Common';
import { useStore } from '../Context';
import { Progressing } from './Common';

const { TextArea } = Input;
const { Option } = Select;
// const { Dragger } = Upload;
const CheckboxGroup = Checkbox.Group;
export const MappingDetails = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.currentAggregateMapping.loadLocalDataset();
  }, [store])

  // const dummyRequest = ({ file, onSuccess }: any) => {
  //   setTimeout(() => {
  //     onSuccess("ok");
  //   }, 0);
  // };

  // const props = {
  //   name: 'file',
  //   customRequest: dummyRequest,
  //   headers: {
  //     authorization: 'authorization-text',
  //   },
  //   onChange(info: any) {
  //     if (info.file.status !== 'uploading') {
  //       console.log(info.file, info.fileList);
  //     }
  //     if (info.file.status === 'done') {
  //       message.success(`${info.file.name} file uploaded successfully`);
  //     } else if (info.file.status === 'error') {
  //       message.error(`${info.file.name} file upload failed.`);
  //     }
  //   },
  // };
  return <Space direction="vertical" style={{ width: '100%' }}>
    <Input size={size} placeholder="Mapping name" value={store.currentAggregateMapping.name} onChange={store.currentAggregateMapping.onChangeName} />
    <TextArea rows={4} value={store.currentAggregateMapping.description} placeholder="Description of mapping" onChange={store.currentAggregateMapping.onChangeDescription} />
    <Checkbox disabled onChange={store.currentAggregateMapping.onIsDestinationChange} checked={store.currentAggregateMapping.isDestinaton}>Destination</Checkbox>
    <Radio.Group size={size} onChange={store.currentAggregateMapping.onChange} value={store.currentAggregateMapping.action}>
      <Radio value="upload">Upload Directly</Radio>
      <Radio value="csv">Download CSV</Radio>
      <Radio value="json">Download JSON</Radio>
    </Radio.Group>

    {/*
    <br />
    <br />
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">
        Support for a single or bulk upload. Strictly prohibit from uploading company data or other
        band files
    </p>
    </Dragger> */}
    <Input size={size} placeholder="URL" value={store.currentAggregateMapping.url} onChange={store.currentAggregateMapping.onChangeUrl} />
    <Input size={size} placeholder="Username" value={store.currentAggregateMapping.username} onChange={store.currentAggregateMapping.onChangeUsername} />
    <Input.Password
      size={size}
      placeholder="Password"
      value={store.currentAggregateMapping.password}
      onChange={store.currentAggregateMapping.onChangePassword}
      iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
    />
    <Select placeholder="Mapping type" style={{ width: '100%' }} onChange={store.currentAggregateMapping.handleTypeChange} value={store.currentAggregateMapping.type}>
      {/* <Option value="1">Excel/CSV Listing to DHIS2 Data Set</Option>
      <Option value="2">Excel Tabular Data to DHIS2 Data Set</Option>
      <Option value="3">Excel Form to DHIS2 Data Set</Option>
      <Option value="4">JSON to DHIS2 Data Set</Option> */}
      <Option value="5">DHIS2 to DHIS2 Data Set</Option>
      <Option value="6">DHIS2 Indicators to DHIS2 Data Set</Option>
      {/* <Option value="7">Other Systems Via API (REST) to DHIS2 Data Set</Option> */}
    </Select>

    {store.currentAggregateMapping.type === '6' && <CheckboxGroup
      options={whatIndicators}
      value={store.currentAggregateMapping.indicatorOptions}
      onChange={store.currentAggregateMapping.onIndicatorOptionsChange}
    />}
    <Progressing />
  </Space>
});
