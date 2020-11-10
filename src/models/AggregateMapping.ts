import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { saveAs } from "file-saver";
import { chunk, flatten, fromPairs, isEqual, pick, range, uniqWith } from "lodash";
import { action, computed, extendObservable, observable } from "mobx";
import moment from "moment";
import XLSX from "xlsx";
import { dataQuery, dataSetOrgUnitsPayload, IAggregateMapping, orgUnitsPayload } from "../Common";
import { useWorker } from "../Context";
import { addition, additionFormat, callAxios, enumerateDates, generateUid, getDHIS2Url, postAxios } from "../utils";
import { Filter } from "./Filter";
import Mapping from "./Mapping";
import { WizardObject } from "./WizardObject";

class AggregateMapping implements IAggregateMapping {
  @observable id: string = generateUid();
  @observable name: string = "";
  @observable description: string = "";
  @observable action: string = "upload";
  @observable url: string = "http://localhost:8080";
  @observable username: string = "admin";
  @observable password: string = "district";
  @observable d2: any;
  @observable remoteDataSet: string = "";
  @observable type: string = "";
  @observable localDataSet: string = "";
  @observable remoteDataSets: any[] = [];
  @observable remoteOrganisations: Mapping[] = [];
  @observable remoteCategoryOptionCombos: Mapping[] = [];
  @observable remoteAttribution: Mapping[] = [];
  @observable localOrganisations: Mapping[] = [];
  @observable localCategoryOptionCombos: Mapping[] = [];
  @observable localAttribution: Mapping[] = [];
  @observable loading: boolean = false;
  @observable currentPagination: string | null | undefined;
  @observable remoteLevels: any[] = [];
  @observable indicatorOptions: string[] = [];
  @observable selectedCOC: string = "";
  @observable message = "";

  @observable paging = {
    units: {
      current: 1,
      pageSize: 18,
    },
    combos: {
      current: 1,
      pageSize: 18,
    },
    attributes: {
      current: 1,
      pageSize: 18
    }
  }
  @observable workingPeriod: [moment.Moment, moment.Moment] = [moment('2020-01-01'), moment('2020-03-31')];
  @observable periodType: string = 'MONTHLY';
  @observable selectedCombo: string | string[] = '';
  @observable dataElementFilter: Filter = new Filter();
  @observable cocFilter: Filter = new Filter();
  @observable orgUnitFilter: Filter = new Filter();
  @observable attributeFilter: Filter = new Filter();
  @observable parent: string = '';
  @observable pageSize: any = 100000;
  @observable responses: any[] = [];
  @observable savedMapping: any = { a: {}, c: {}, o: {} };
  @observable isDestinaton: boolean = true;

  @observable sourceUnitsFirst: boolean = true;
  @observable sourceCombosFirst: boolean = true;
  @observable sourceAttributesFirst: boolean = true;
  @observable organisations: WizardObject[] = [];
  @observable importationLevel: string | undefined;
  @observable levels: any[] = [];

  worker = useWorker();

  @action checkAllOus = (val: CheckboxChangeEvent) => {
    const checkAll = val.target.checked;
    this.organisations = this.organisations.map((val: WizardObject) => {
      val.setSelected(checkAll);
      return val;
    });
  }

  @action changeDefaultLevels = async () => {
    if (this.type === '5') {
      await this.fetchOrganisationLevels();
      await this.onLevelChange(this.importationLevel);
    }
  }

  @action onLevelChange = async (level: string | undefined) => {
    this.importationLevel = level;
    if (level) {
      await this.fetchOrganisations();
    } else {
      this.organisations = []
    }
  }

  @action fetchOrganisationLevels = async () => {
    if (this.isDestinaton) {
      const dhis2Url = getDHIS2Url(this.url);
      const { organisationUnitLevels } = await callAxios(`${dhis2Url}/organisationUnitLevels`, { fields: 'id,name,level', paging: false }, this.username, this.password);
      this.levels = organisationUnitLevels
    }
  }

  @action fetchOrganisations = async () => {
    if (this.isDestinaton) {
      const dhis2Url = getDHIS2Url(this.url);
      const { organisationUnits } = await callAxios(`${dhis2Url}/organisationUnits`, { level: this.importationLevel, paging: false, fields: 'id,name' }, this.username, this.password);

      this.organisations = organisationUnits.map((ou: any) => {
        const wizardObject = new WizardObject();
        extendObservable(wizardObject, ou);
        return wizardObject;
      });
    }
  }

  @action changeSourceUnitsFirst = (checked: boolean) => {
    this.sourceUnitsFirst = checked;
    this.autoMapOrganisations();
  }
  @action changeSourceComboFirst = (checked: boolean) => {
    this.sourceCombosFirst = checked;
    this.autoMapCategoryOptionCombos();
  }

  @action changeSourceAttributesFirst = (checked: boolean) => {
    this.sourceAttributesFirst = checked;
    this.autoMapAttributes();
  }
  @action onIndicatorOptionsChange = (e: any) => this.indicatorOptions = e;
  @action onSelectedCOCChange = (e: any) => this.selectedCOC = e;

  @action onIsDestinationChange = (e: any) => this.isDestinaton = e.target.checked;

  @action handleTypeChange = async (val: string) => {
    this.type = val;
    if (val) {
      await this.loadRemoteDataSets();
    }
  }

  @action setResponses = (val: any) => {
    if (Array.isArray(val)) {
      this.responses = [...this.responses, ...val]
    } else {
      this.responses = [...this.responses, val]
    }
  };
  @action onPageSizeChange = (val: number | string | undefined) => this.pageSize = val;
  @action onCollapseChange = (key: string | string[]) => this.selectedCombo = key;
  @action setLocalDataSet = async (val: string) => {
    this.localDataSet = val;
  };
  @action setParent = (key: string) => this.parent = key;
  @action setRemoteOrganisations = (remotes: Mapping[]) => this.remoteOrganisations = remotes;
  @action onChange = (e: any) => this.action = e.target.value;
  @action setD2 = (val: any) => this.d2 = val;
  @action setId = (val: string) => this.id = val;
  @action setName = (val: string) => this.name = val;
  @action onChangeUrl = (e: any) => this.url = e.target.value;
  @action onChangePassword = (e: any) => this.password = e.target.value;
  @action onChangeUsername = (e: any) => this.username = e.target.value;
  @action onChangeName = (e: any) => this.name = e.target.value;
  @action onChangeDescription = (e: any) => this.description = e.target.value;

  @action loadLocalDataset = async () => {
    this.loading = true;
    const api = this.d2.Api.getApi();
    this.setMessage('Loading local data set');
    const dataSet = await api.get(`dataSets/${this.localDataSet}.json`, { fields: 'id,name,code,periodType,categoryCombo[id,name,categoryOptionCombos[id,name]],dataSetElements[dataElement[id,name,code,valueType,categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]]]' });

    this.periodType = dataSet.periodType;

    this.localAttribution = dataSet.categoryCombo.categoryOptionCombos.map((attribute: any) => {
      const mapping = new Mapping();
      extendObservable(mapping, attribute);
      return mapping;
    });
    const allOptions = dataSet.dataSetElements.map((element: any) => {
      return flatten(element.dataElement.categoryCombo.categoryOptionCombos.map((coc: any) => {
        const id = `${element.dataElement.id},${coc.id}`
        let name = `${element.dataElement.name} ${coc.name}`;
        if (coc.name === 'default') {
          name = element.dataElement.name
        }
        const mapping = new Mapping();
        extendObservable(mapping, { ...coc, id, name });
        return mapping;
      }))
    });
    this.localCategoryOptionCombos = flatten(allOptions);
    await this.fetchLocalOrganisations();
    this.loading = false;
    this.setMessage('');
  }
  @action setRemoteDataSet = async (val: string) => {
    this.remoteDataSet = val;
    if (val) {
      this.loading = true;
      await this.loadRemoteDataSet();
      this.autoMapOrganisations();
      this.loading = false;
    }
  };

  @action loadRemoteDataSets = async () => {
    const dhis2Url = getDHIS2Url(this.url);
    await postAxios(`${dhis2Url}/metadata`, { sqlViews: [dataQuery] }, {}, this.username, this.password);
    if (this.type === '5') {
      const url = `${dhis2Url}/dataSets.json`
      const { dataSets } = await callAxios(url, { fields: 'id,name,code,periodType' }, this.username, this.password);
      this.remoteDataSets = dataSets.filter((ds: any) => ds.periodType === this.periodType);
      await postAxios(`${dhis2Url}/metadata`, { sqlViews: [dataSetOrgUnitsPayload] }, {}, this.username, this.password);
    } else {
      const { organisationUnitLevels } = await callAxios(`${dhis2Url}/organisationUnitLevels.json`, { fields: 'level~rename(id),name', paging: false }, this.username, this.password);
      this.remoteDataSets = organisationUnitLevels;
      await postAxios(`${dhis2Url}/metadata`, { sqlViews: [orgUnitsPayload] }, {}, this.username, this.password);
    }
  }

  changeMapping = (mappings: Mapping[], savedMapping: { [key: string]: Mapping }, search: Mapping[]) => {
    return mappings.map((mapping: Mapping) => {
      const currentOu = savedMapping[mapping.id]
      if (currentOu) {
        return currentOu;
      }

      let found = search.find((rou: Mapping) => rou.id === mapping.id);
      let match = 'id';

      if (!found) {
        found = search.find((rou: Mapping) => !!rou.code && !!mapping.code && rou.code === mapping.code);
        match = 'code'
      }


      if (!found) {
        found = search.find((rou: Mapping) => !!rou.name.trim() && !!mapping.name.trim() && rou.name.trim().replace(/\s+/g, '') === mapping.name.trim().replace(/\s+/g, ''));
        match = 'name'
      }

      if (!found) {
        mapping.mapping = '';
        mapping.match = '';
      }

      if (found) {
        mapping.setMappings([found])
        mapping.mapping = found.id;
        mapping.match = match
      }
      return mapping
    });
  }

  @action autoMapOrganisations = () => {
    this.setMessage("Trying to auto map organisations");
    const { o } = this.savedMapping;
    if (this.sourceUnitsFirst) {
      this.localOrganisations = this.changeMapping(this.localOrganisations, o, this.remoteOrganisations);
    } else {
      this.remoteOrganisations = this.changeMapping(this.remoteOrganisations, o, this.localOrganisations);
    }
  }

  @action autoMapCategoryOptionCombos = () => {
    this.setMessage("Trying to auto map data elements and category option combos");
    const { c } = this.savedMapping;
    if (this.sourceCombosFirst) {
      this.localCategoryOptionCombos = this.changeMapping(this.localCategoryOptionCombos, c, this.remoteCategoryOptionCombos);
    } else {
      this.remoteCategoryOptionCombos = this.changeMapping(this.remoteCategoryOptionCombos, c, this.localCategoryOptionCombos);
    }
  }

  @action autoMapAttributes = () => {
    this.setMessage("Trying to auto map attribute option combos");
    const { a } = this.savedMapping;
    if (this.sourceAttributesFirst) {
      this.localAttribution = this.changeMapping(this.localAttribution, a, this.remoteAttribution);
    } else {
      this.remoteAttribution = this.changeMapping(this.remoteAttribution, a, this.localAttribution);
    }
  }

  @action loadRemoteDataSet = async () => {
    this.setMessage("Remote data set found, loading it");
    let categoryOptionCombos: any = [];
    let endpoint = 'sqlViews/pErnQQ38kJY/data.json';
    if (this.type === '5') {
      const dhis2Url = getDHIS2Url(this.url);
      const dataSet = await callAxios(`${dhis2Url}/dataSets/${this.remoteDataSet}.json`, { fields: 'id,name,code,periodType,categoryCombo[id,name,categoryOptionCombos[id,name]],dataSetElements[dataElement[id,name,code,valueType,categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]]]' }, this.username, this.password);
      categoryOptionCombos = dataSet.categoryCombo.categoryOptionCombos;
      const allOptions = dataSet.dataSetElements.map((element: any) => {
        return flatten(element.dataElement.categoryCombo.categoryOptionCombos.map((coc: any) => {
          const id = `${element.dataElement.id},${coc.id}`
          let name = `${element.dataElement.name} ${coc.name}`;
          if (coc.name === 'default') {
            name = element.dataElement.name;
          }
          const mapping = new Mapping();
          extendObservable(mapping, { ...coc, id, name })
          return mapping;
        }));
      });
      this.remoteCategoryOptionCombos = flatten(allOptions);
    } else if (this.type === '6') {
      endpoint = 'sqlViews/PEYXsyvCwbt/data.json'
      const queries = this.indicatorOptions.map((indicator: string) => {
        switch (indicator) {
          case 'Indicators':
            return this.loadIndicators();
          case 'Data Elements':
            return this.loadDataElements();
          case 'Program Indicators':
            return this.loadProgramIndicators();
          default:
            return this.loadIndicators();
        }
      });
      const all = (await Promise.all(queries)).map((element: any) => {
        return element.map((coc: any) => {
          const mapping = new Mapping();
          extendObservable(mapping, coc)
          return mapping;
        });
      });
      this.remoteCategoryOptionCombos = flatten(all);
    }

    this.remoteAttribution = categoryOptionCombos.map((coc: any) => {
      const mapping = new Mapping();
      mapping.id = coc.id;
      mapping.name = coc.name;
      return mapping;
    });
    await this.fetchRemoteOrganisations(endpoint);
  }

  @action setLoading = (val: boolean) => this.loading = val;
  @action loadType1 = async () => {
    this.setLoading(true);
    this.setMessage("Loading remote data sets please wait")
    await this.loadRemoteDataSets();
    if (this.remoteDataSet) {
      await this.loadRemoteDataSet();
      this.autoMapOrganisations();
    }
    this.setLoading(false);
    this.setMessage("")
  }
  @action onPageChange = (what: string, coc: string | null | undefined = null) => (...others: any) => {
    this.paging = {
      ...this.paging, [what]: {
        current: others[0],
        pageSize: others[1],
      }
    }
    this.currentPagination = coc;
  }

  @action onPeriodChange = (dates: any, dateStrings: [string, string]) => {
    this.workingPeriod = dates;
  }

  createRemoteSqlViews = async () => {
    // await postAxios(`${dhis2Url}/metadata`, { sqlViews: [payload] }, {}, this.username, this.password);
  }

  insertDataValues = (data: any) => {
    const api = this.d2.Api.getApi();
    return api.post("dataValueSets", data, {
      dataElementIdScheme: 'UID',
      dryRun: false,
      idScheme: 'UID',
      orgUnitIdScheme: 'UID',
      preheatCache: true,
      skipExistingCheck: false,
      strategy: 'NEW_AND_UPDATES',
      skipAudit: false,
      format: 'json',
      async: true,
      firstRowIsHeader: false
    });
  };

  loadIndicators = async () => {
    const dhis2Url = getDHIS2Url(this.url);
    const { indicators } = await callAxios(`${dhis2Url}/indicators.json`, { fields: 'id,name,code', paging: false }, this.username, this.password);
    return indicators;
  }

  loadProgramIndicators = async () => {
    const dhis2Url = getDHIS2Url(this.url);
    const { programIndicators } = await callAxios(`${dhis2Url}/programIndicators.json`, { fields: 'id,name,code', paging: false }, this.username, this.password);
    return programIndicators;
  }

  loadDataElements = async () => {
    const dhis2Url = getDHIS2Url(this.url);
    const { dataElements } = await callAxios(`${dhis2Url}/dataElements.json`, { fields: 'id,name,code', paging: false }, this.username, this.password);
    return dataElements;
  }

  queryDataStore = async (ns: string) => {
    try {
      const namespace = await this.d2.dataStore.get(ns);
      const data = namespace.get(this.id);
      return data
    } catch (e) {
      return []
    }
  }

  @action fetchSavedMappings = async () => {
    try {
      const saved = await Promise.all([this.queryDataStore('o-mapping'), this.queryDataStore('c-mapping'), this.queryDataStore('a-mapping')]);
      let aMapping: any[] = [];
      let oMapping: any[] = [];
      let cMapping: any[] = [];

      if (saved.length > 0) {
        oMapping = saved[0];
        cMapping = saved[1];
        aMapping = saved[2];
      }
      oMapping = oMapping.map((o: any) => {
        const mapping = new Mapping();
        extendObservable(mapping, o);
        // mapping.parents = processOu(o);
        return [o.id, mapping]
      });

      cMapping = cMapping.map((combo: any) => {
        const mapping = new Mapping();
        extendObservable(mapping, combo)
        return [combo.id, mapping]
      });

      aMapping = aMapping.map((o: any) => {
        const mapping = new Mapping();
        extendObservable(mapping, o)
        return [o.id, mapping]
      });
      const o = fromPairs(oMapping);
      const a = fromPairs(aMapping);
      const c = fromPairs(cMapping);
      this.savedMapping = { a, c, o }
    } catch (error) {
      console.log(error);
      this.savedMapping = { a: {}, c: {}, o: {} }
    }
  }

  @action insertDataSet = async (data: any, message: any = "") => {
    if (data.length > 0) {
      let name = `${this.id}-${moment().format("YYYYMMDDHHmmss")}`;
      if (message !== "") {
        name = `${message}-${this.id}-${moment().format("YYYYMMDDHHmmss")}`;
      }
      if (this.action === "csv") {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        saveAs(
          new Blob([csvOutput], { type: "application/octet-stream" }),
          `${name}.csv`
        );
      } else if (this.action === "json") {
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json",
        });
        saveAs(blob, `${name}.json`);
      } else {
        const results = await this.insertDataValues({ dataValues: data });
        this.setResponses(results);
      }
    }
  };

  @action queryIndicatorData = async () => {
    this.loading = true;
    const period = enumerateDates(this.workingPeriod[0], this.workingPeriod[1], addition(this.periodType), additionFormat(this.periodType)).join(';')
    if (this.isDestinaton) {
      const dxs = Object.keys(this.dataElementMapping);
      const dhis2Url = getDHIS2Url(this.url);
      const chunked = chunk(dxs, 100);
      for (const c of chunked) {
        try {
          const url = `${dhis2Url}/analytics.json?dimension=dx:${c.join(';')}&dimension=pe:${period}&dimension=ou:LEVEL-${this.remoteDataSet}&ignoreLimit=true&skipMeta=true`;
          const { headers, rows } = await callAxios(url, {}, this.username, this.password);
          const dxIndex = headers.findIndex((h: any) => h.name === 'dx');
          const peIndex = headers.findIndex((h: any) => h.name === 'pe');
          const ouIndex = headers.findIndex((h: any) => h.name === 'ou');
          const valueIndex = headers.findIndex((h: any) => h.name === 'value');
          const processed: any[] = rows.map((row: any[]) => {
            const dataElement = this.dataElementMapping[row[dxIndex]];
            const period = row[peIndex];
            const orgUnit = this.organisationMapping[row[ouIndex]];
            const attributeOptionCombo = this.selectedCOC;
            const value = Number(row[valueIndex]).toFixed(0);
            const splitted = String(dataElement).split(',');
            return {
              dataElement: splitted[0],
              period,
              orgUnit,
              categoryOptionCombo: splitted[1],
              attributeOptionCombo,
              value
            }
          });
          await this.insertDataSet(processed)
        } catch (error) {
          console.log(error);
        }
      }

    } else {
      const dx = this.remoteCategoryOptionCombos.map((mapping: Mapping) => mapping.mapping).filter((value: string) => !!value).join(';');
      // endPoint = `analytics.json?dimension=dx:${dx}&dimension=pe:${period}&dimension=ou:LEVEL-${this.remoteDataSet}`;
      console.log(dx);
    }
    this.loading = false;
  }


  processOrgUnitRows = ({ listGrid: { headers, rows } }: any) => {
    const processedRows: Mapping[] = Array(rows.length);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nameIndex = headers.findIndex((h: any) => h.name === `namelevel${row[2]}`);
      const nameIndex3 = headers.findIndex((h: any) => h.name === `namelevel${row[2] - 1}`);
      const nameIndex2 = headers.findIndex((h: any) => h.name === `namelevel${row[2] - 2}`);
      const nameIndex1 = headers.findIndex((h: any) => h.name === `namelevel${row[2] - 3}`);
      let ou = {
        id: row[1],
        name: row[nameIndex]
      }
      const orgUnit = new Mapping();
      extendObservable(orgUnit, ou);
      if (nameIndex3 !== -1) {
        orgUnit.parents.p1 = row[nameIndex3]
      }
      if (nameIndex2 !== -1) {
        orgUnit.parents.p2 = row[nameIndex2]
      }
      if (nameIndex1 !== -1) {
        orgUnit.parents.p3 = row[nameIndex1]
      }
      processedRows[i] = orgUnit;
    }
    return processedRows;
  }

  @action fetchRemoteOrganisations = async (endpoint: string) => {
    const dhis2Url = getDHIS2Url(this.url);
    const firstResponse = await callAxios(`${dhis2Url}/${endpoint}`, { page: 1, pageSize: 1000, var: `ds:${this.remoteDataSet}` }, this.username, this.password)
    const { pager: { pageCount } } = firstResponse;
    let data = await Promise.all(range(2, pageCount + 1).map((page: number) => {
      return callAxios(`${dhis2Url}/${endpoint}`, { page, pageSize: 1000, var: `ds:${this.remoteDataSet}` }, this.username, this.password)
    }));
    let organisations = this.processOrgUnitRows(firstResponse);
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      organisations = [...organisations, ...this.processOrgUnitRows(current)]
    }
    this.remoteOrganisations = organisations;
  }

  @action fetchLocalOrganisations = async () => {
    const api = this.d2.Api.getApi();
    const firstResponse = await api.get('sqlViews/pErnQQ38kJY/data.json', { page: 1, pageSize: 1000, var: `ds:${this.localDataSet}` });
    const { pager: { pageCount } } = firstResponse;
    let data = await Promise.all(range(2, pageCount + 1).map((page: number) => {
      return api.get('sqlViews/pErnQQ38kJY/data.json', { page, pageSize: 1000, var: `ds:${this.localDataSet}` })
    }));
    let organisations = this.processOrgUnitRows(firstResponse);

    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      organisations = [...organisations, ...this.processOrgUnitRows(current)]
    }
    this.localOrganisations = organisations;
  }

  @action setMessage = (val: string) => this.message = val;


  processDataValues(dataValues: any[]) {
    const processed: any[] = [];
    for (let i = 0; i < dataValues.length; i++) {
      const row = dataValues[i];
      const { dataElement, period, orgUnit, categoryOptionCombo, attributeOptionCombo, value } = row
      const de = this.dataElementMapping[`${dataElement},${categoryOptionCombo}`];
      const splitted = String(de).split(',');
      const dataValue = {
        dataElement: splitted[0],
        period,
        orgUnit: this.organisationMapping[orgUnit],
        categoryOptionCombo: splitted[1],
        attributeOptionCombo: this.attributionMapping[attributeOptionCombo],
        value
      }
      processed[i] = dataValue;
    }
    return processed;
  }

  @action disbaledTime = (date: any, type: any): any => {
    console.log(date, type);
    return true;
  }

  @action queryDataSet = async () => {
    this.loading = true;
    const startDate = this.workingPeriod[0].format('YYYY-MM-DD');
    const endDate = this.workingPeriod[1].format('YYYY-MM-DD');
    console.log(startDate, endDate);
    const dhis2Url = getDHIS2Url(this.url);
    const mess = this.action === 'upload' ? 'Inserting' : 'Downloading';
    const units = this.organisations.filter((ou: WizardObject) => ou.selected)
    if (this.isDestinaton) {
      for (let i = 0; i < units.length; i++) {
        this.setMessage("");
        const ou = units[i];
        const url = `${dhis2Url}/dataValueSets.json?dataSet=${this.remoteDataSet}&startDate=${startDate}&endDate=${endDate}&orgUnit=${ou.id}&children=true`;
        this.setMessage(`Fetching data for ${ou.name}`);
        const { dataValues } = await callAxios(url, {}, this.username, this.password);
        this.setMessage(`Processing data for ${ou.name}`);
        const processed = await this.worker.processDataValues(dataValues, this.dataElementMapping, this.organisationMapping, this.attributionMapping);
        this.setMessage(`${mess} processed data for ${ou.name}`);
        await this.insertDataSet(processed, ou.name);
        this.setMessage(`Finished ${mess} processed data for ${ou.name}`);
        this.setMessage("");
      }
    }
    this.loading = false;
  }

  @action queryData = async () => {
    if (this.type === '5') {
      await this.queryDataSet();
    } else if (this.type === '6') {
      await this.queryIndicatorData();
    }
  }

  @computed get currentOrganisations() {
    const unitsPaging = this.paging.units;
    const search = this.sourceUnitsFirst ? this.localOrganisations : this.remoteOrganisations;
    const units = search.filter((ou: Mapping) => {
      if (this.orgUnitFilter.filter === 'unmapped') {
        return !ou.mapping && ou.name.toLowerCase().includes(this.orgUnitFilter.search.toLowerCase())
      }
      return this.orgUnitFilter.mapper.indexOf(ou.match) !== -1 && ou.name.toLowerCase().includes(this.orgUnitFilter.search.toLowerCase())
    });
    const page = unitsPaging.current - 1;

    const final = units.slice(
      page * unitsPaging.pageSize,
      page * unitsPaging.pageSize + unitsPaging.pageSize
    );

    return {
      total: units.length,
      units: final
    }
  }

  @computed get currentAttributes() {
    const search = this.sourceAttributesFirst ? this.localAttribution : this.remoteAttribution
    return search.filter((ou: Mapping) => {
      if (this.attributeFilter.filter === 'unmapped') {
        return !ou.mapping && ou.name.toLowerCase().includes(this.attributeFilter.search.toLowerCase())
      }
      return this.attributeFilter.mapper.indexOf(ou.match) !== -1 && ou.name.toLowerCase().includes(this.attributeFilter.search.toLowerCase())
    });
  }

  // @computed get currentDataElements() {
  //   const paging = this.paging.des;
  //   const options = this.remoteCategoryOptionCombos.map((coc: any) => {
  //     let elements = coc.elements;
  //     if (this.currentPagination === coc.id) {
  //       elements = coc.elements.slice(
  //         paging.current * paging.pageSize,
  //         paging.current * paging.pageSize + paging.pageSize
  //       );
  //     } else {
  //       elements = coc.elements.slice(0, 10);
  //     }
  //     return [coc.id, elements]
  //   });
  //   return fromPairs(options)
  // }

  @computed get dataElementMapping() {
    // if (this.isDestinaton) {
    if (this.sourceCombosFirst) {
      return fromPairs(this.localCategoryOptionCombos.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.mapping, m.id]));
    }
    return fromPairs(this.remoteCategoryOptionCombos.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.id, m.mapping]));
    // } else {
    //   if (this.sourceCombosFirst) {
    //     return fromPairs(this.localCategoryOptionCombos.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.id, m.mapping]));
    //   }
    //   return fromPairs(this.remoteCategoryOptionCombos.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.mapping, m.id]));
    // }
  }
  @computed get organisationMapping() {
    // if (this.isDestinaton) {
    if (this.sourceCombosFirst) {
      return fromPairs(this.localOrganisations.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.mapping, m.id]));
    }
    return fromPairs(this.remoteOrganisations.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.id, m.mapping]));
    // } else {
    //   if (this.sourceCombosFirst) {
    //     return fromPairs(this.localOrganisations.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.id, m.mapping]));
    //   }
    //   return fromPairs(this.remoteOrganisations.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.mapping, m.id]));
    // }
  }

  @computed get attributionMapping() {
    // if (this.isDestinaton) {
    if (this.sourceCombosFirst) {
      return fromPairs(this.localAttribution.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.mapping, m.id]));
    }
    return fromPairs(this.remoteAttribution.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.id, m.mapping]));
    // } else {
    //   if (this.sourceCombosFirst) {
    //     return fromPairs(this.localAttribution.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.id, m.mapping]));
    //   }
    //   return fromPairs(this.remoteAttribution.filter((m: Mapping) => !!m.mapping).map((m: Mapping) => [m.mapping, m.id]));
    // }
  }
  @computed get mapppedDataElements() {
    return Object.keys(this.dataElementMapping).map((k: string) => `'${k}'`).join(",");
  }

  @computed get mappedAttributes() {
    return Object.keys(this.attributionMapping).map((k: string) => `'${k}'`).join(",");
  }

  @computed get mappedOrganisations() {
    return Object.keys(this.organisationMapping).map((k: string) => `'${k}'`).join(",");
  }

  @computed get currentCombos() {
    const search = this.sourceCombosFirst ? this.localCategoryOptionCombos : this.remoteCategoryOptionCombos;
    const combosPaging = this.paging.combos;
    const currentCombos = search.filter((coc: Mapping) => {
      if (this.cocFilter.filter === 'unmapped') {
        return coc && !coc.mapping && coc.name.toLowerCase().includes(this.cocFilter.search.toLowerCase())
      }
      return coc && this.cocFilter.mapper.indexOf(coc.match) !== -1 && coc.name.toLowerCase().includes(this.cocFilter.search.toLowerCase())
    });


    const page = combosPaging.current - 1;

    const final = currentCombos.slice(
      page * combosPaging.pageSize,
      page * combosPaging.pageSize + combosPaging.pageSize
    );

    return {
      total: currentCombos.length,
      combos: final
    }
  }

  @computed get currentInstance() {
    return pick(this, [
      "id",
      "name",
      "description",
      "action",
      "type",
      "url",
      "username",
      "password",
      "remoteDataSet",
      "localDataSet",
      "periodType",
      "selectedCombo",
      "dataElementFilter",
      "cocFilter",
      "orgUnitFilter",
      "attributeFilter",
      "parent",
      "indicatorOptions",
      "selectedCOC",
      "importationLevel"
    ]);
  }

  @computed get processedResponses() {
    let errors: any[] = [];
    let conflicts: any[] = [];

    let updatedTotal = 0;
    let deletedTotal = 0;
    let importedTotal = 0;
    let ignoredTotal = 0;

    this.responses.forEach(response => {
      if (response && (response['status'] === 'SUCCESS' || response['status'] === 'WARNING')) {
        const { imported, deleted, updated, ignored } = response['importCount'];
        if (imported) {
          importedTotal = importedTotal + imported
        }

        if (deleted) {
          deletedTotal = deletedTotal + deleted
        }

        if (updated) {
          updatedTotal = updatedTotal + updated
        }

        if (ignored) {
          ignoredTotal = ignoredTotal + ignored
        }

        if (response['conflicts']) {
          const processedConflicts = response['conflicts'];
          conflicts = [...conflicts, ...processedConflicts]
        }
      } else if (response && response['httpStatusCode'] === 500) {
        errors = [...errors, { ...response['error'] }];
      }
    });
    conflicts = uniqWith(conflicts, isEqual)
    const importCount = {
      deleted: deletedTotal,
      imported: importedTotal,
      updated: updatedTotal,
      ignored: ignoredTotal
    };
    return { errors, importCount, conflicts }
  }

  @computed get whatToSave() {
    const o: Mapping[] = this.isDestinaton ? this.localOrganisations : this.remoteOrganisations;
    const a: Mapping[] = this.isDestinaton ? this.localAttribution : this.remoteAttribution;
    const c: Mapping[] = this.isDestinaton ? this.localCategoryOptionCombos : this.remoteCategoryOptionCombos;
    return {
      o: o.filter((m: Mapping) => !!m.mapping),
      a: a.filter((m: Mapping) => !!m.mapping),
      c: c.filter((m: Mapping) => !!m.mapping),
    }

  }

  @computed get searchOrganisations() {
    return this.sourceUnitsFirst ? this.remoteOrganisations : this.localOrganisations;
  }

  @computed get searchCombos() {
    return this.sourceCombosFirst ? this.remoteCategoryOptionCombos : this.localCategoryOptionCombos;
  }

  @computed get searchAttributes() {
    return this.sourceAttributesFirst ? this.remoteAttribution : this.localAttribution;
  }

  @computed get isAllChecked() {
    return this.organisations.every((val: WizardObject) => val.selected)
  }

  @computed get cocMappingHeaders() {
    return {
      source: this.sourceCombosFirst ? 'Source' : 'Destination',
      destination: this.sourceCombosFirst ? 'Destination' : 'Source'
    }
  }

  @computed get orgUnitMappingHeaders() {
    return {
      source: this.sourceUnitsFirst ? 'Source' : 'Destination',
      destination: this.sourceUnitsFirst ? 'Destination' : 'Source'
    }
  }

  @computed get attributeMappingHeaders() {
    return {
      source: this.sourceAttributesFirst ? 'Source' : 'Destination',
      destination: this.sourceAttributesFirst ? 'Destination' : 'Source'
    }
  }

  @computed get picker(): any {
    switch (String(this.periodType).toLowerCase()) {
      case 'weekly':
        return 'week'
      case 'monthly':
        return 'month'
      case 'quarterly':
        return 'quarter';
      case 'yearly':
        return 'year'
      default:
        return 'date'
    }
  }

}

export default AggregateMapping;
