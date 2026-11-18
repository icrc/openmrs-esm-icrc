import { getConfig, launchWorkspace2, showSnackbar, translateFrom } from '@openmrs/esm-framework';
import { moduleName } from '../constants';
import { getSecondaryFormHandle, isSecondaryFormOpen } from './secondary-form-state';

/**
 * Message sent by formLauncher.js (running inside the HTML Form Entry iframe) to ask
 * for another HTML form to be opened in its own workspace window.
 */
export const OPEN_FORM_MESSAGE_TYPE = 'icrc-open-form';

export const SECONDARY_FORM_WORKSPACE = 'icrc-secondary-form-entry-workspace';

const FORMS_APP = '@openmrs/esm-patient-forms-app';

interface HtmlFormEntryForm {
  formUuid: string;
  formName?: string;
  formUiResource: string;
  formUiPage?: string;
}

function notifyFormAlreadyOpen() {
  showSnackbar({
    kind: 'error',
    isLowContrast: false,
    title: translateFrom(moduleName, 'secondaryFormAlreadyOpenTitle', 'A form is already open'),
    subtitle: translateFrom(
      moduleName,
      'secondaryFormAlreadyOpenSubtitle',
      'Close the opened form before opening another one.',
    ),
  });
}

/**
 * Only HTML Form Entry pages of this server are accepted (the message comes from an iframe).
 * @returns the path and query of the page, or null if it is not accepted
 */
function toFormPageUrl(formUrl: unknown): string | null {
  try {
    const url = new URL(String(formUrl), window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.includes('/htmlformentryui/htmlform/')) {
      return null;
    }
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

async function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.data?.type !== OPEN_FORM_MESSAGE_TYPE) {
    return;
  }

  const { definitionUiResource, patientUuid, visitUuid, formUrl, formName } = event.data;

  try {
    // Only one secondary form at a time.
    if (isSecondaryFormOpen()) {
      notifyFormAlreadyOpen();
      return;
    }

    // A link to a specific page (e.g. an encounter to view or edit)
    if (formUrl) {
      const pageUrl = toFormPageUrl(formUrl);
      if (!pageUrl) {
        console.warn(`[icrc-open-form] Not an HTML Form Entry page of this server: "${formUrl}"`);
        return;
      }
      await launchWorkspace2(SECONDARY_FORM_WORKSPACE, { formName, formUrl: pageUrl });
      return;
    }

    // A form to enter, identified by its definition
    const { htmlFormEntryForms } = await getConfig(FORMS_APP);
    const form = (htmlFormEntryForms as Array<HtmlFormEntryForm> | undefined)?.find(
      (htmlForm) => htmlForm.formUiResource === definitionUiResource,
    );

    if (!form) {
      console.warn(`[icrc-open-form] No htmlFormEntryForms entry has formUiResource "${definitionUiResource}"`);
      return;
    }

    if (!patientUuid) {
      console.warn('[icrc-open-form] The message has no patientUuid; the form workspace needs it');
      return;
    }

    const workspaceProps = {
      formName: form.formName,
      formUiPage: form.formUiPage ?? 'enterHtmlFormWithStandardUi',
      definitionUiResource,
      patientUuid,
      visitUuid: visitUuid ?? null,
    };

    // No window props: the workspace gets everything it needs from its own props.
    await launchWorkspace2(SECONDARY_FORM_WORKSPACE, workspaceProps);
  } catch (error) {
    console.error('[icrc-open-form] Could not open the form', error);
  }
}

/**
 * The patient chart closes EVERY open HTML form when any form posts 'close-workspace' to its parent.
 * This listener is registered before theirs (at startup), so when the message comes from the
 * secondary form's iframe it closes only that workspace and stops the message there.
 */
function onCloseMessage(event: MessageEvent) {
  const isCloseMessage = event.data === 'close-workspace' || event.data?.type === 'close-workspace';
  if (!isCloseMessage) {
    return;
  }
  const handle = getSecondaryFormHandle();
  console.debug('[icrc-open-form] close message', {
    hasHandle: !!handle,
    fromSecondaryForm: !!handle && event.source === handle.frameWindow,
  });
  if (!handle || !handle.frameWindow || event.source !== handle.frameWindow) {
    return;
  }
  event.stopImmediatePropagation();
  handle.close();
}

const REGISTERED_FLAG = '__icrcOpenFormListenerRegistered';

/**
 * Starts listening for "open form" messages. Safe to call more than once, even if the module
 * is loaded twice (the flag lives on window, not in the module).
 */
export function registerOpenFormListener() {
  const w = window as unknown as Record<string, boolean>;
  if (w[REGISTERED_FLAG]) {
    return;
  }
  w[REGISTERED_FLAG] = true;
  window.addEventListener('message', onCloseMessage);
  window.addEventListener('message', onMessage);
}
