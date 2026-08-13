import visitResultsConfigSchema, { VisitResultsConfigObject } from './visit-results/visit-results-config-schema';

export const configSchema = {
  visitResultsConfig: visitResultsConfigSchema,
};

export interface ConfigObject {
  visitResultsConfig: VisitResultsConfigObject;
}
