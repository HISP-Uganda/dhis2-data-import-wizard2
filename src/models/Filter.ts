import { action, observable } from "mobx";

export class Filter {
  @observable mapper: string[] = ['id', 'code', 'name', 'manual'];
  @observable filter: string = "mapped";
  @observable search: string = "";

  @action onFilterChange = (e: any) => {
    this.filter = e.target.value;
    if (this.filter === 'mapped') {
      this.mapper = ['id', 'code', 'name', 'manual'];
    }
  }

  @action onMapperChange = (e: any) => this.mapper = e;
  @action setSearch = (val: string) => this.search = val;
}
