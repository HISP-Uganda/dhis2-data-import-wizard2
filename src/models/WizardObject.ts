import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { action, observable } from "mobx";

export class WizardObject {
  @observable id: string = "";
  @observable name: string = "";
  @observable selected: boolean = true;
  @action setSelected = (val: boolean) => this.selected = val;
  @action changeSelection = (val: CheckboxChangeEvent) => this.setSelected(val.target.checked)
}
