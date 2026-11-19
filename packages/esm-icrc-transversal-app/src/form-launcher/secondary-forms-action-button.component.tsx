import React, { type ComponentProps, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, DocumentIcon } from '@openmrs/esm-framework';
import { isSecondaryFormOpen, subscribeSecondaryFormOpen } from './secondary-form-state';
import { SECONDARY_FORM_WORKSPACE } from './open-form-listener';

/**
 * Side-rail button of the "secondary forms" window, shown under "Clinical forms".
 * It only exists while a secondary form is open; clicking it restores (unhides) the window.
 */
const SecondaryFormsActionButton: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(isSecondaryFormOpen());

  useEffect(() => {
    const update = () => setIsOpen(isSecondaryFormOpen());
    update();
    return subscribeSecondaryFormOpen(update);
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <ActionMenuButton2
      icon={(props: ComponentProps<typeof DocumentIcon>) => <DocumentIcon {...props} />}
      label={t('openedForm', 'Opened form')}
      workspaceToLaunch={{ workspaceName: SECONDARY_FORM_WORKSPACE }}
    />
  );
};

export default SecondaryFormsActionButton;
