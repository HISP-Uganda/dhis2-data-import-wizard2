export function processDataValues(dataValues: any[], dataElementMapping: { [key: string]: string }, organisationMapping: { [key: string]: string }, attributionMapping: { [key: string]: string }) {
  const processed: any[] = [];
  if (dataValues) {
    for (let i = 0; i < dataValues.length; i++) {
      const row = dataValues[i];
      const { dataElement: de, period, orgUnit: ou, categoryOptionCombo: coc, attributeOptionCombo: aoc, value } = row
      const deAndCoc = dataElementMapping[`${de},${coc}`];
      if (deAndCoc) {
        const orgUnit = organisationMapping[ou];
        const attributeOptionCombo = attributionMapping[aoc]
        const splitted = String(deAndCoc).split(',');
        const dataElement = splitted[0];
        const categoryOptionCombo = splitted[1];
        if (orgUnit && dataElement && categoryOptionCombo && attributeOptionCombo) {
          processed[processed.length] = {
            dataElement,
            period,
            orgUnit,
            categoryOptionCombo,
            attributeOptionCombo,
            value
          };
        }
      }
    }
  }
  return processed;
}


