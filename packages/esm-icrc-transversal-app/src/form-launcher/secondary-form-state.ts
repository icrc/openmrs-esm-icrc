import * as framework from '@openmrs/esm-framework';

/**
 * Tells whether the "secondary forms" window is currently open.
 *
 * It reads the workspace v2 store of the framework. The repo's typings of @openmrs/esm-framework are
 * older than the one running in the O3 (they don't know the v2 store), hence the namespace import
 * and the cast: the store exists at runtime.
 */
export const SECONDARY_FORM_WINDOW = 'icrc-secondary-forms';

interface OpenedWindowLike {
  windowName: string;
}

const getStore = () =>
  (framework as unknown as { workspace2Store?: { getState: () => { openedWindows?: Array<OpenedWindowLike> } } })
    .workspace2Store;

export function isSecondaryFormOpen(): boolean {
  try {
    const store = getStore();
    if (!store) {
      console.warn('[icrc-open-form] workspace2Store not available: cannot tell if a form is already open');
      return false;
    }
    return !!store.getState().openedWindows?.some((openedWindow) => openedWindow.windowName === SECONDARY_FORM_WINDOW);
  } catch (error) {
    console.warn('[icrc-open-form] Could not read the workspace store', error);
    return false;
  }
}

/**
 * Calls `onChange` whenever the workspace store changes. Returns the unsubscribe function.
 */
export function subscribeSecondaryFormOpen(onChange: () => void): () => void {
  try {
    const store = (framework as unknown as { workspace2Store?: { subscribe: (listener: () => void) => () => void } })
      .workspace2Store;
    return store ? store.subscribe(onChange) : () => {};
  } catch {
    return () => {};
  }
}

/**
 * The iframe of the open secondary form and how to close its workspace. Set by the workspace
 * component, used by the message interceptor in open-form-listener.ts.
 */
interface SecondaryFormHandle {
  frameWindow: Window | null;
  close: () => void;
}

// Kept on window, not in a module variable: this module can end up in more than one chunk of the
// bundle, and the workspace and the message listener must see the same handle.
const HANDLE_KEY = '__icrcSecondaryFormHandle';

export const setSecondaryFormHandle = (handle: SecondaryFormHandle | null) => {
  (window as unknown as Record<string, SecondaryFormHandle | null>)[HANDLE_KEY] = handle;
};
export const getSecondaryFormHandle = (): SecondaryFormHandle | null =>
  (window as unknown as Record<string, SecondaryFormHandle | null | undefined>)[HANDLE_KEY] ?? null;
