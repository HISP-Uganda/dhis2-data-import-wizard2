import axios from "axios";
import moment from "moment";
import { Parent } from "./Common";

const abc = 'abcdefghijklmnopqrstuvwxyz';
const letters = abc.concat(abc.toUpperCase());

const ALLOWED_CHARS = `0123456789${letters}`;

const NUMBER_OF_CODEPOINTS = ALLOWED_CHARS.length;
const CODESIZE = 11;

const randomWithMax = (max: number) => Math.floor(Math.random() * max);

export const generateUid = () => {
  // First char should be a letter
  let randomChars = letters.charAt(randomWithMax(letters.length));

  for (let i = 1; i < CODESIZE; i += 1) {
    randomChars += ALLOWED_CHARS.charAt(randomWithMax(NUMBER_OF_CODEPOINTS));
  }
  // return new String( randomChars );
  return randomChars;
};

export const getDHIS2Url = (url: string) => {
  try {
    const newUrl = new URL(url);
    const dataURL = newUrl.pathname.split("/");
    const apiIndex = dataURL.indexOf("api");

    if (apiIndex !== -1) {
      return newUrl.href;
    } else {
      if (dataURL[dataURL.length - 1] === "") {
        return newUrl.href + "api";
      } else {
        return newUrl.href + "/api";
      }
    }
  } catch (e) {
    return null
  }
};

export const callAxios = async (url: string, params: any, username: string, password: string) => {
  try {
    const response = await axios.get(url, {
      params,
      withCredentials: true,
      auth: {
        username,
        password,
      },
    });
    return response.data;
  } catch (e) {
    return null;
  }
};

export const postAxios = async (url: string, data: any, params: any, username: string, password: string) => {
  try {
    const response = await axios.post(url, data, {
      params,
      withCredentials: true,
      auth: {
        username,
        password,
      },
    });
    return response.data;
  } catch (e) {
    return null;
  }
}


export const addition = (periodType: string) => {
  switch (periodType) {
    case 'Daily':
      return 'days';
    case 'Weekly':
      return 'weeks';
    case 'Monthly':
      return 'months';
    case 'Quarterly':
      return 'quarters';
    case 'Yearly':
    case 'FinancialJuly':
    case 'FinancialApril':
    case 'FinancialOct':
      return 'years';

    default:
      return null
  }
}
export const getPeriod = (periodType: string, date: string) => {
  switch (periodType) {
    case "Daily":
      return moment(date).format("YYYYMMDD");
    case "Weekly":
      return moment(date).format("YYYY[W]WW");
    case "Monthly":
      return moment(date).format("YYYYMM");
    case "Quarterly":
      return moment(date).format("YYYY[Q]Q");
    case "Yearly":
      return moment(date).format("YYYY");
    case "FinancialJuly":
      return moment(date).format("YYYY[July]");
    case "FinancialApril":
      return moment(date).format("YYYY[April]");
    case "FinancialOct":
      return moment(date).format("YYYY[Oct]");
    default:
      return null;
  }
}


export const additionFormat = (periodType: string) => {
  switch (periodType) {
    case 'Daily':
      return 'YYYYMMDD';
    case 'Weekly':
      return 'YYYY[W]WW';
    case 'Monthly':
      return 'YYYYMM';
    case 'Quarterly':
      return 'YYYY[Q]Q';
    case 'Yearly':
      return 'YYYY';
    case 'FinancialJuly':
      return 'YYYY[July]';
    case 'FinancialApril':
      return 'YYYY[April]';
    case 'FinancialOct':
      return 'YYYY[Oct]';
    default:
      return ""
  }
}


export const processOu = (ou: any) => {
  let names: Parent = { p1: '', p2: '', p3: '' };
  let parent1 = ou.parent;
  let parent2 = undefined;
  let parent3 = undefined;

  if (parent1) {
    parent2 = parent1.parent;
    names = { ...names, p1: parent1.name }
  }
  if (parent2) {
    parent3 = parent2.parent;
    names = { ...names, p2: parent2.name }
  }

  if (parent3) {
    names = { ...names, p3: parent3.name }
  }
  return names;
}

export const getParent = (ou: any, parent: string) => {
  switch (parent) {
    case 'p1':
      return `${ou.parents.p1}/`;
    case 'p2':
      return `${ou.parents.p2}/`;
    case 'p3':
      return `${ou.parents.p3}/`;
    default:
      return '';
  }
}


export const enumerateDates = (startDate: moment.Moment, endDate: moment.Moment, addition: any, format: string) => {
  const dates = [];
  const currDate = moment(startDate).startOf(addition);
  const lastDate = moment(endDate).endOf(addition);
  dates.push(currDate.clone().format(format));
  while (currDate.add(1, addition).diff(lastDate) <= 0) {
    dates.push(currDate.clone().format(format));
  }
  return dates;
};
