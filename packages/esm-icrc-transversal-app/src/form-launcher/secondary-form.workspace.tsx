import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as framework from '@openmrs/esm-framework';
import { setSecondaryFormHandle } from './secondary-form-state';

// The repo's typings of @openmrs/esm-framework are older than the O3 that runs this code and do not
// know the workspace v2 components, hence the namespace import and the cast.
const { Workspace2, InlineLoading } = framework as unknown as Record<string, React.ComponentType<any>>;

/** Either a ready page (formUrl) or the parts to build the page that enters a form. */
export interface SecondaryFormWorkspaceProps {
  formName?: string;
  formUrl?: string;
  formUiPage?: string;
  definitionUiResource?: string;
  patientUuid?: string;
  visitUuid?: string | null;
}

const CLOSE_RETURN_URL = 'post-message:close-workspace';

function buildFormSrc({
  formUrl,
  formUiPage,
  definitionUiResource,
  patientUuid,
  visitUuid,
}: SecondaryFormWorkspaceProps): string {
  if (formUrl) {
    // The page must tell O3 to close the workspace after saving
    const url = new URL(formUrl, window.location.origin);
    if (!url.searchParams.has('returnUrl')) {
      url.searchParams.set('returnUrl', CLOSE_RETURN_URL);
    }
    return url.pathname + url.search;
  }

  const params = new URLSearchParams();
  params.append('patientId', patientUuid ?? '');
  if (visitUuid) {
    params.append('visitId', visitUuid);
  }
  params.append('definitionUiResource', definitionUiResource ?? '');
  params.append('returnUrl', CLOSE_RETURN_URL);
  return `${(window as any).openmrsBase}/htmlformentryui/htmlform/${formUiPage}.page?${params}`;
}

interface SecondaryFormWorkspaceDefinitionProps {
  closeWorkspace: (options?: { discardUnsavedChanges?: boolean }) => Promise<boolean> | void;
  workspaceProps: SecondaryFormWorkspaceProps;
}

/**
 * Renders an HTML form in an iframe, like the patient chart's form entry workspace does, but it
 * does not react to the generic 'close-workspace' message: with two forms open, that message
 * would close both.
 */
const SecondaryFormWorkspace: React.FC<SecondaryFormWorkspaceDefinitionProps> = ({
  closeWorkspace,
  workspaceProps,
}) => {
  const { formName } = workspaceProps;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const src = buildFormSrc(workspaceProps);

  // The message interceptor (open-form-listener.ts) closes this workspace when the form posts
  // 'close-workspace', without closing the other forms that are open.
  useEffect(() => {
    setSecondaryFormHandle({
      frameWindow: iframeRef.current?.contentWindow ?? null,
      close: () => {
        closeWorkspace({ discardUnsavedChanges: true });
      },
    });
    return () => setSecondaryFormHandle(null);
  }, [closeWorkspace]);

  const onLoad = useCallback(() => {
    setIsLoading(false);
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) {
      return;
    }
    iframe.contentWindow?.addEventListener('beforeunload', () => setIsLoading(true));
    // hide the O2 page chrome
    doc.querySelector('header')?.remove();
    doc.querySelector('.patient-header')?.remove();
    doc.querySelector('#breadcrumbs')?.remove();
    const style = doc.createElement('style');
    style.innerHTML = '@media screen { body { background: white; } }';
    doc.head.appendChild(style);
    iframe.height = doc.body.scrollHeight + 50 + 'px';
  }, []);

  return (
    <Workspace2 title={formName ?? 'Form'} hasUnsavedChanges={false}>
      <div>
        {isLoading && InlineLoading ? <InlineLoading /> : null}
        <iframe
          ref={iframeRef}
          src={src}
          title={formName ?? 'Form'}
          onLoad={onLoad}
          style={{ width: '100%', border: 0 }}
        />
      </div>
    </Workspace2>
  );
};

export default SecondaryFormWorkspace;
