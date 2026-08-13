import { Type } from '@openmrs/esm-framework';

export interface ConfigSchema {
  addHomeFor: boolean;
  homepagesHeaderConfig: Array<HomepageHeaderConfig>;
}

export interface HomepageHeaderConfig {
  title: string;
  titleCode: string;
  requiredPrivilege?: string;
}

export const configSchema = {
  addHomeFor: {
    _type: Type.Boolean,
    _description: 'Add "Home for" to the title',
    _default: true,
  },
  homepagesHeaderConfig: {
    _type: Type.Array,
    _elements: {
      title: {
        _type: Type.String,
        _description: 'Title of the homepage.',
      },
      titleCode: {
        _type: Type.String,
        _description: 'Label for the title of the homepage.',
      },
      requiredPrivilege: {
        _type: Type.String,
        _description: 'Privilege required to see the homepage.',
      },
    },
    _default: [
      {
        title: 'Receptionist',
        titleCode: 'receptionist',
        requiredPrivilege: 'ProfessionalDashboard: Access Receptionist Dashboard',
      },
      {
        title: 'Professional',
        titleCode: 'professional',
        requiredPrivilege: 'ProfessionalDashboard: Access PT Professional Dashboard',
      },
      {
        title: 'Social Worker',
        titleCode: 'socialWorker',
        requiredPrivilege: 'ProfessionalDashboard: Access Social Worker Dashboard',
      },
      {
        title: '',
        titleCode: '',
        requiredPrivilege: '',
      },
      {
        title: 'PO Professional',
        titleCode: 'poProfessional',
        requiredPrivilege: 'ProfessionalDashboard: Access PO Professional Dashboard',
      },
      {
        title: 'PT Professional',
        titleCode: 'ptProfessional',
        requiredPrivilege: 'ProfessionalDashboard: Access PT Professional Dashboard',
      },
      {
        title: 'PT Head',
        titleCode: 'ptHead',
        requiredPrivilege: 'ProfessionalDashboard: Access PT Head Dashboard',
      },
      {
        title: 'P&O Head',
        titleCode: 'poHead',
        requiredPrivilege: 'ProfessionalDashboard: Access PO Head Dashboard',
      },
    ],
  },
};
