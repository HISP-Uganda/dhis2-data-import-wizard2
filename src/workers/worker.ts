export function processDataValues(dataValues: any[], dataElementMapping: { [key: string]: string }, organisationMapping: { [key: string]: string }, attributionMapping: { [key: string]: string }) {
  const processed: any[] = [];
  if (dataValues) {
    for (let i = 0; i < dataValues.length; i++) {
      const row = dataValues[i];
      const { dataElement, period, orgUnit, categoryOptionCombo, attributeOptionCombo, value } = row
      const de = dataElementMapping[`${dataElement},${categoryOptionCombo}`];
      const splitted = String(de).split(',');
      const dataValue = {
        dataElement: splitted[0],
        period,
        orgUnit: organisationMapping[orgUnit],
        categoryOptionCombo: splitted[1],
        attributeOptionCombo: attributionMapping[attributeOptionCombo],
        value
      }
      processed[i] = dataValue;
    }
  }
  return processed;
}


