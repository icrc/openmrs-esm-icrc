import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as framework from '@openmrs/esm-framework';
import { setSecondaryFormHandle } from './secondary-form-state';

// The repo's typings of @openmrs/esm-framework are older than the O3 that runs this code and do not
// know the workspace v2 components, hence the namespace import and the cast.
const { Workspace2, InlineLoading } = framework as unknown as Record<string, React.ComponentType<any>>;

export interface SecondaryFormWorkspaceProps {
  formName?: string;
  formUiPage: string;
  definitionUiResource: string;
  patientUuid: string;
  visitUuid?: string | null;
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
  workspaceProps: { formName, formUiPage, definitionUiResource, patientUuid, visitUuid },
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const src = (() => {
    const params = new URLSearchParams();
    params.append('patientId', patientUuid);
    if (visitUuid) {
      params.append('visitId', visitUuid);
    }
    params.append('definitionUiResource', definitionUiResource);
    params.append('returnUrl', 'post-message:close-workspace');
    return `${(window as any).openmrsBase}/htmlformentryui/htmlform/${formUiPage}.page?${params}`;
  })();

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
        <iframe ref={iframeRef} src={src} onLoad={onLoad} style={{ width: '100%', border: 0 }} />
      </div>
    </Workspace2>
  );
};

export default SecondaryFormWorkspace;
