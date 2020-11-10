import { Button, Steps } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import { size } from '../Common';
import { useStore } from '../Context';
import { Aggregates } from './Aggregates';
import { AttributionMapping } from './AttributionMapping';
import { CategoryComboMapping } from './CategoryComboMapping';
import { DataSets } from './DataSets';
import { Importing } from './Importing';
import { MappingDetails } from './MappingDetails';
import { OrganisationMapping } from './OrganisationMapping';
import { PeriodMapping } from './PeriodMapping';
const { Step } = Steps;

export const AggregateWizard = observer(() => {
  const store = useStore();

  const steps = [
    {
      title: 'Saved Mappings',
      content: <Aggregates />,
    },
    {
      title: 'Select Data Set',
      content: <DataSets />,
    },
    {
      title: 'Mapping Details',
      content: <MappingDetails />,
    },
    {
      title: 'Organisation Mapping',
      content: <OrganisationMapping />,
    },
    {
      title: 'Category Combo Mapping',
      content: <CategoryComboMapping />,
    },
    {
      title: 'Attribute Mapping',
      content: <AttributionMapping />,
    },
    {
      title: 'Period Selection',
      content: <PeriodMapping />,
    },
    {
      title: 'Summary Report',
      content: <Importing />,
    }
  ];
  return <div className="px-1 wizard">
    <Steps className="bg-gray-200" current={store.currentAggStep} labelPlacement="vertical" size="small">
      {steps.map(item => (
        <Step key={item.title} title={item.title} />
      ))}
    </Steps>

    <div className="pt-1" style={{ height: window.innerHeight - 198 }}>{steps[store.currentAggStep].content}</div>
    <div className="flex items-center">
      <div className={`${store.css}`}>
        {store.currentAggStep > 0 && (
          <Button size={size} onClick={store.prevAggStep}>
            PREVIUOS
          </Button>
        )}
      </div>

      {store.currentAggStep >= 2 && (<div className={`${store.css} text-center`}>
        <Button size={size} onClick={store.cancelAggregate}>CANCEL</Button>&nbsp;&nbsp;
        <Button size={size} type="primary" onClick={store.saveAggregate}>SAVE MAPPING</Button>
      </div>)}

      {store.currentAggStep !== 1 && (<div className={`text-right ${store.css}`}>
        {store.currentAggStep < steps.length - 1 && (
          <Button size={size} type="primary" onClick={store.nextAggStep}>
            {store.nextLabel}
          </Button>
        )}

        {store.currentAggStep === steps.length - 1 && (
          <Button size={size} type="primary" onClick={() => store.setCurrentAggStep(0)}>
            FINISH
          </Button>
        )}
      </div>)}
    </div>
  </div>
});
