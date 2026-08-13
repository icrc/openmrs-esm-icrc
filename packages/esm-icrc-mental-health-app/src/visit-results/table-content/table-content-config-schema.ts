import { VisitResultsConfigObject } from '../visit-results-config-schema';

export interface Item {
  item: Tab;
  config: VisitResultsConfigObject;
}

export interface Tab {
  tab: string;
  tables: Array<Tables>;
}

export interface Tables {
  tableData: {
    label: string;
    header?: string;
    show: boolean;
  };
  data: Array<Row>;
}

export interface Row {
  baseline: string;
  baselineComplete?: any;
  difference: string;
  finalFollowUp: string;
  finalFollowUpComplete?: any;
  id: string;
  scale: string;
  show?: boolean;
  clinicallySignificantChange?: string;
  dateDifference?: string;
  measureOfImprovement?: string;
  textAfterValue?: {
    placement: Array<string>;
    text: string;
  };
}
