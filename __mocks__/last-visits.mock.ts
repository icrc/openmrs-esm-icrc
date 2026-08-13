import { formatDate } from '@openmrs/esm-framework';

export const lastVisitsMock = {
  lastVisits: [
    {
      id: 'visit1',
      from: formatDate(new Date('2022-01-14T08:46:05.000+0000'), { time: false }),
      to: formatDate(new Date('2022-01-15T08:46:05.000+0000'), { time: false }),
      encounters: [
        {
          uuid: '11',
          formUuid: '11',
          name: 'Visit 1 - Form 1',
          encounterDate: formatDate(new Date('2022-01-14T08:46:05.000+0000'), { time: false }),
        },
        {
          uuid: '12',
          formUuid: '12',
          name: 'Visit 1 - Form 2',
          encounterDate: formatDate(new Date('2022-01-14T08:46:05.000+0000'), { time: false }),
        },
      ],
      attachments: [],
    },
    {
      id: 'visit2',
      from: formatDate(new Date('2022-01-16T08:46:05.000+0000'), { time: false }),
      to: formatDate(new Date('2022-01-17T08:46:05.000+0000'), { time: false }),
      encounters: [
        {
          uuid: '21',
          formUuid: '21',
          name: 'Visit 2 - Form 1',
          encounterDate: formatDate(new Date('2022-01-14T08:46:05.000+0000'), { time: false }),
        },
        {
          uuid: '22',
          formUuid: '22',
          name: 'Visit 2 - Form 2',
          encounterDate: formatDate(new Date('2022-01-14T08:46:05.000+0000'), { time: false }),
        },
      ],
      attachments: [],
    },
  ],
  isLoading: false,
  isError: null,
  isValidating: false,
};

export const mockConfig = {
  numberOfLastVisits: 2,
};

export const mockHtmlFormEntryFormsConfig = {
  htmlFormEntryForms: [],
};

export const mockFetchAttachmentsByVisit = {
  results: [
    {
      uuid: 'attachment1Uuid',
      dateTime: null,
      comment: 'Attachment1',
      bytesMimeType: null,
      bytesContentFamily: null,
    },
    {
      uuid: 'attachment2Uuid',
      dateTime: null,
      comment: 'Attachment2',
      bytesMimeType: null,
      bytesContentFamily: null,
    },
  ],
};
