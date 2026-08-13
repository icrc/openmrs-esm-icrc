import React from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentAttachmentIcon, ActionMenuButton, launchWorkspace } from '@openmrs/esm-framework';

interface VisitResultsActionButtonProps {
  patientUuid: string;
}
//deprected
const VisitResultsActionButton: React.FC<VisitResultsActionButtonProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const launchVisitResultsFormWorkspace = () => launchWorkspace('visit-results-form-workspace');

  return (
    <ActionMenuButton
      label={t('visitResultTable', 'Visit Result Table')}
      handler={launchVisitResultsFormWorkspace}
      getIcon={(props) => <DocumentAttachmentIcon {...props} />}
      iconDescription={t('visitResultTable', 'Visit Result Table')}
      type={'visit-results'}
    />
  );
};

export default VisitResultsActionButton;
