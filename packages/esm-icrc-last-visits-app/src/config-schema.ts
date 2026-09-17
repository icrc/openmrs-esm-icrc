import { Type, VisitType } from '@openmrs/esm-framework';

export interface lastVisitsAppSchema {
  numberOfLastVisits: number;
}

export const requiredPrivilege = 'View last visit widget';

export interface ServerVisit {
  uuid: string;
  startDatetime: Date;
  stopDatetime: Date;
  visitType: VisitType;
  encounters: Array<{
    uuid: string;
    encounterDatetime: Date;
    form: {
      uuid: string;
      display: string;
    };
  }>;
}

export interface LastVisit {
  uuid: string;
  id: string;
  from: string;
  to: string;
  visitType: VisitType;
  startDatetime: string | Date;
  encounters: Array<{
    uuid: string;
    formUuid: string;
    name: string;
    encounterDate: string;
  }>;
  attachments: Array<{
    name: string;
    uuid: string;
  }>;
}

export interface ServerAttachments {
  results: Array<{
    uuid: string;
    dateTime: string;
    comment: string;
    bytesMimeType: string;
    bytesContentFamily: string;
  }>;
}

export interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formUiResource: string;
  formUiPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
}

export const lastVisitsAppSchema = {
  numberOfLastVisits: {
    _type: Type.Number,
    _description: 'Number of last visits shown on  the widget',
    _default: 3,
  },
};
