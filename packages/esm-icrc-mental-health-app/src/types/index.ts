export type Links = Array<{
  rel: string;
  uri: string;
}>;
export interface ObsData {
  concept: {
    display: string;
    uuid: string;
  };
  value?: string | any;
  groupMembers?: Array<{
    concept: { uuid: string; display: string };
    value?: string | any;
  }>;
  obsDatetime: string;
}

export interface Diagnosis {
  concept: any;
  conceptReferenceTermCode: string;
  primary: boolean;
  confirmed: boolean;
}

export interface ObsPayload {
  concept: string;
  value?: string;
  groupMembers?: Array<{
    concept: string;
    value: string;
  }>;
}

export interface Symptom {
  id: string;
  date: string;
  symptom: string;
}

export interface SymptomsList {
  general: Array<Symptom>;
  emotional: Array<Symptom>;
  functionality: Array<Symptom>;
  psychotic: Array<Symptom>;
  other: Array<Symptom>;
}
