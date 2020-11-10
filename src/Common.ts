import Mapping from "./models/Mapping";

export interface Parent {
  p1: string;
  p2: string;
  p3: string;
}

export interface IAggregateMapping {
  id: string;
  name: string;
  description: string;
  action: string;
}

export interface COCMapping {
  id: string;
  name: string;
  combos: Mapping[];
}

export const size: 'small' | 'middle' | 'large' = 'middle';

export const plainOptions = ['id', 'code', 'name', 'manual'];

export const whatIndicators = ['Indicators', 'Data Elements', 'Program Indicators'];

export const dataQuery = {
  sqlQuery: `select
  de.uid as dx,
  p.startdate,
  ou.uid as ou,
  coc1.uid as co,
  coc2.uid as ao,
  dv.value as value
  from datavalue dv
      inner join organisationunit ou on(ou.organisationunitid = dv.sourceid)
      inner join period p using(periodid)
      inner join dataelement de using(dataelementid)
      inner join categoryoptioncombo coc1 on (coc1.categoryoptioncomboid = dv.categoryoptioncomboid)
      inner join categoryoptioncombo coc2 on (coc2.categoryoptioncomboid = dv.attributeoptioncomboid)
  where p.startdate >= '\${startDate}' and p.enddate <= '\${endDate}' and concat(de.uid,',',coc1.uid) in (\${dataElements}) and coc2.uid in (\${attributes})`,
  description: "Querying data",
  type: "QUERY",
  name: 'Data Query',
  cacheStrategy: "RESPECT_SYSTEM_SETTING",
  id: 'rR6aNrDzPd9',
};

// export const dataSetOrgUnitsQuery =
export const orgUnitsPayload = {
  sqlQuery: `select ou.* from _orgunitstructure ou where ou.level = \${ds};`,
  description: "Query organisation units by level",
  type: "QUERY",
  name: 'Organisation units by level',
  cacheStrategy: "RESPECT_SYSTEM_SETTING",
  id: 'PEYXsyvCwbt',
};


export const dataSetOrgUnitsPayload = {
  sqlQuery: `select ou.* from datasetsource ds inner join dataset das using(datasetid) inner join _orgunitstructure ou on (ou.organisationunitid = ds.sourceid) where das.uid = '\${ds}';`,
  description: "Query organisation units for a specific data set",
  type: "QUERY",
  name: 'Data set organisation units',
  cacheStrategy: "RESPECT_SYSTEM_SETTING",
  id: 'pErnQQ38kJY',
}

