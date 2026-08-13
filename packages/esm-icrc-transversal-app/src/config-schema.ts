import { ConfigSchema, Type } from '@openmrs/esm-framework';

export const transversalAppSchema: ConfigSchema = {
  title: {
    _type: Type.String,
    _description: 'Title of the widget.',
    _default: undefined,
  },
  titleCode: {
    _type: Type.String,
    _description: 'Label code for the title of the widget.',
    _default: undefined,
  },
  actionButtons: {
    _default: {
      printPatientWristband: {
        requiredPrivilege: 'App: icrc.wristBand.print',
      },
      printPatientIdCard: {
        requiredPrivilege: 'App: icrc.hsuIDCard.print',
      },
      materialRequest: {
        requiredPrivilege: 'PRP: Access to Material Request page',
      },
      transferPatient: {
        requiredPrivilege: 'Task: referenceapplication.simpleTransfer',
      },
    },
  },
  serverGlobalProperty: {
    _type: Type.String,
    _description: 'Global property fot the server.',
    _default: undefined,
  },
  reports: {
    _type: Type.Array,
    _elements: {
      id: {
        _type: Type.String,
      },
      label: {
        _type: Type.String,
      },
      labelCode: {
        _type: Type.String,
      },
      url: {
        _type: Type.String,
      },
      requiredPrivileges: {
        _type: Type.Array,
        _elements: { _type: Type.String },
      },
    },
    _default: [
      {
        id: 'icrc.reportingui.reports',
        label: 'Patient List Report',
        labelCode: 'patientListReport',
        url: 'reportingui/runReport.page?reportDefinition=f011c96f-c61d-42a7-bd88-6aa1523c7f98',
        requiredPrivileges: ['HSP: View Reports'],
      },
      {
        id: 'WTTC Workflow Status Report',
        label: 'WTTC Workflow Status Report',
        labelCode: 'WTTCWorkflowStatusReport',
        url: 'reportingui/runReport.page?reportDefinition=274a7741-a35d-4ac5-963a-e705e79cc44f',
        requiredPrivileges: ['WTTC: View Reports'],
      },
      {
        id: 'icrc.reportingui.reports.ServicesDeliveryReport',
        label: 'Services delivery report',
        labelCode: 'servicesDeliveryReport',
        url: 'reportingui/runReport.page?reportDefinition=9d4b9dc4-fcc6-448d-abdb-1e05a6d0e18e',
        requiredPrivileges: ['PRP: View Reports'],
      },
      {
        id: 'icrc.reportingui.reports.FollowUpServicesDeliveryReport',
        label: 'Follow up services delivery report',
        labelCode: 'FollowUpServicesDeliveryReport',
        url: 'reportingui/runReport.page?reportDefinition=689e10fb-aab2-447d-85c4-6366fdaee032',
        requiredPrivileges: ['PRP: View Reports'],
      },
      {
        id: 'icrc.reportingui.reports.DaysOfAdmissionForTheMonthlyPeriodAggregatedValue',
        label: 'Aggregated monthly days of admission by services',
        labelCode: 'AggregatedMonthlyDaysOfAdmissionByServices',
        url: 'reportingui/runReport.page?reportDefinition=d80d73b4-bc4c-4383-8d86-db2652216d64',
        requiredPrivileges: ['HSP: View Reports'],
      },
      {
        id: 'icrc.reportingui.reports.DaysOfAdmissionForTheMonthlyPeriod',
        label: 'HSU monthly days of admission ',
        labelCode: 'HSUMonthlyDaysOfAdmission ',
        url: 'reportingui/runReport.page?reportDefinition=8e542776-2b1b-4b13-88c2-5fa09e065a24',
        requiredPrivileges: ['HSP: View Reports'],
      },
      {
        id: 'icrc.reportingui.reports.PearlHSPGOMDatabase',
        label: 'Pearl HSP GOM database',
        labelCode: 'pearlHSPGOMDatabase',
        url: 'reportingui/runReport.page?reportDefinition=50f24000-f390-486a-8060-43a7796c7350',
        requiredPrivileges: ['HSP: View Reports'],
      },
      {
        id: 'icrc.reportingui.reports.PearlHSPGOMWeeklyReport',
        label: 'Pearl HSP GOM Weekly Report',
        labelCode: 'pearlHSPGOMWeeklyReport',
        url: 'reportingui/runReport.page?reportDefinition=3005b36f-da6b-407c-9a53-51611e1c54a2',
        requiredPrivileges: ['HSP: View Reports'],
      },
      {
        id: 'icrc.reportingui.reports.HSPRawDataForm',
        label: 'HSP - Raw Data - ALL FORMS (Report)',
        labelCode: 'HSPRawDataAllForms (Report)',
        url: 'reportingui/runReport.page?reportDefinition=93e4637d-4a1e-47c5-ade5-791f02373242',
        requiredPrivileges: ['HSP: View Reports'],
      },
    ],
  },
};

export interface ActionButton {
  requiredPrivilege?: string;
}

export interface Report {
  id: string;
  label: string;
  labelCode: any;
  url: string;
  requiredPrivileges: Array<string>;
}

export interface TransversalAppSchema {
  title: string;
  titleCode: string;
  showDownloadPatientInformation: boolean;
  showMergeVisit: boolean;
  serverGlobalProperty: string;
  reports: Array<Report>;
  actionButtons: Array<ActionButton>;
}

export interface Identifier {
  uuid: string;
  identifier: string;
  display: string;
  identifierType: {
    uuid: string;
    display: string;
  };
  location: {
    uuid: string;
    display: string;
  };
}
