import { action, computed, extendObservable, observable } from "mobx";
import AggregateMapping from "./models/AggregateMapping";
import { Filter } from "./models/Filter";

export class Store {
  @observable d2: any;
  @observable aggregateMappings: AggregateMapping[] = [];
  @observable currentAggregateMapping: AggregateMapping = new AggregateMapping();
  @observable loading: boolean = false;
  @observable currentAggStep: number = 0;
  @observable dataSets: any[] = [];

  @action setCurrentAggStep = (val: number) => this.currentAggStep = val;
  @action setLoading = (val: boolean) => this.loading = val;

  @action setCurrentAggregateMapping = async (val: AggregateMapping) => {
    this.currentAggregateMapping = val;
    await this.currentAggregateMapping.fetchSavedMappings()
  }

  @action nextAggStep = () => {
    this.setCurrentAggStep(this.currentAggStep + 1)
  }

  @action prevAggStep = () => {
    this.setCurrentAggStep(this.currentAggStep - 1)
  }

  @action cancelAggregate = () => {
    this.currentAggregateMapping = new AggregateMapping();
    this.setCurrentAggStep(0)
  }

  @action createDataStore = async (namespace: string, defaultKey: string, defaultValue: any) => {
    try {
      let ns = undefined;
      const val = await this.d2.dataStore.has(namespace);
      if (!val) {
        ns = await this.d2.dataStore.create(namespace);
      } else {
        ns = await this.d2.dataStore.get(namespace);
      }
      if (ns) {
        ns.set(defaultKey, defaultValue);
      }
    } catch (e) {
    }
  };

  @action fetchSavedAggregates = async () => {
    try {
      // const api = this.d2.Api.getApi();
      // await api.post('metadata', { sqlViews: [dataSetOrgUnitsPayload] });
      const namespace = await this.checkDataStore("agg-wizard");
      if (namespace) {
        const { keys } = namespace;
        const request = keys.map((k: string) => {
          return namespace.get(k);
        });
        const aggregates = await Promise.all(request);
        const processedAggregates = aggregates.map((m: any) => {
          const { cocFilter, orgUnitFilter, attributeFilter, dataElementFilter, ...rest } = m;

          const cFilter = new Filter();
          const oFilter = new Filter();
          const aFilter = new Filter();
          const dFilter = new Filter();

          extendObservable(cFilter, cocFilter);
          extendObservable(oFilter, orgUnitFilter);
          extendObservable(aFilter, attributeFilter);
          extendObservable(dFilter, dataElementFilter);

          const aggregate = new AggregateMapping();
          extendObservable(aggregate, { ...rest, cocFilter: cFilter, orgUnitFilter: oFilter, attributeFilter: aFilter, dataElementFilter: dFilter });
          return aggregate;
        });
        this.aggregateMappings = processedAggregates;
      }
    } catch (e) {
      this.aggregateMappings = [];
    }
  };

  @action checkDataStore = async (namespace: string) => {
    const val = await this.d2.dataStore.has(namespace);
    if (val) {
      return await this.d2.dataStore.get(namespace);
    }
  };

  @action saveAggregate = async () => {
    await this.createDataStore("agg-wizard", this.currentAggregateMapping.id, this.currentAggregateMapping.currentInstance);
    await this.createDataStore("o-mapping", this.currentAggregateMapping.id, this.currentAggregateMapping.whatToSave.o)
    await this.createDataStore("a-mapping", this.currentAggregateMapping.id, this.currentAggregateMapping.whatToSave.a)
    await this.createDataStore("c-mapping", this.currentAggregateMapping.id, this.currentAggregateMapping.whatToSave.c)
  }


  @action loadDataSets = async () => {
    this.loading = true;
    const api = this.d2.Api.getApi();
    const { dataSets } = await api.get('dataSets.json', { fields: 'id,name,periodType' });
    this.dataSets = dataSets;
    this.loading = false
  }

  @computed get nextLabel() {
    switch (this.currentAggStep) {
      case 0:
        return 'NEW MAPPING'
      case 6:
        return 'IMPORT'
      default:
        return 'NEXT'
    }
  }

  @computed get css() {
    if (this.currentAggStep >= 2) {
      return 'w-1/3'
    }
    return 'w-1/2'
  }

}


export const store = new Store();
