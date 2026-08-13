import { Type } from '@openmrs/esm-framework';

export default {
  title: {
    _type: Type.String,
    _default: 'Visit Result Table',
  },
  rows: {
    _type: Type.Array,
    _default: [
      {
        rowTitle: 'Row 1',
        concepts: [
          { concept: '', enconterType: '' },
          { concept: '', enconterType: '' },
        ],
      },
      {
        rowTitle: 'Row 2',
        concepts: [
          { concept: '', encounterType: '' },
          { concept: '', encounterType: '' },
        ],
      },
    ],
  },
};

export interface VisitResultsConfigObject {
  title: string;
  headers: Array<VisitResultsHeaderConfigObject>;
  sessionsHeaders: Array<VisitResultsHeaderConfigObject>;
  DASS_21_Scale: Array<VisitResultsHeaderConfigObject>;
}

export interface VisitResultsHeaderConfigObject {
  key: string;
  header: string;
}
