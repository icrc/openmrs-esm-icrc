import { ConfigSchema, Type } from '@openmrs/esm-framework';

export const configSchema: ConfigSchema = {
  showBreadcrumbs: {
    _type: Type.Boolean,
    _description: 'Show Breadcrumbs',
    _default: true,
  },
};

export interface RecentActivitiesAppSchema {
  showBreadcrumbs: boolean;
}

export interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formUiResource: string;
  formUiPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
}
