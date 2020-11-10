import { action, observable } from "mobx";
import { Parent } from '../Common';


class Mapping {
  @observable id: string = "";
  @observable code: string = "";
  @observable name: string = "";
  @observable mapping: string = "";
  @observable mappingName: string = "";
  @observable match: string = "";
  @observable parents: Parent = { p1: '', p2: '', p3: '' };
  @observable mappings: any[] = [];


  @action setMatch = (val: string) => this.match = val;
  @action setCode = (val: string) => this.code = val;
  @action setMappingName = (val: string) => this.mappingName = val;
  @action setMappings = (val: any[]) => this.mappings = val;
  @action onClear = () => this.setMappings([]);

  @action setMapping = (val: string) => {
    if (val) {
      this.match = 'manual'
      this.mapping = val;
    } else {
      this.match = ''
      this.mapping = '';
      this.setMappings([]);
    }
  };
  // @action onSelect = (val: string | number | LabeledValue, option: any) => {
  //   this.setMappings
  // }

  @action searchMappings = (availableOptions: any[]) => (search: string) => {
    if (search && search !== '') {
      const options = availableOptions.filter((o: any) => {
        return String(o.name).toLowerCase().indexOf(search.toLowerCase()) >= 0
      });
      this.setMappings(options)
    } else if (this.mapping && this.mapping !== '') {
      this.setMappings(availableOptions.filter((o: any) => o.id === this.mapping))
    } else {
      this.setMappings([]);
    }
  }
}

export default Mapping;
