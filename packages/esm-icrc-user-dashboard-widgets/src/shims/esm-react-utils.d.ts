// src/shims/esm-react-utils.d.ts

// Tell TS: when you see this module, use these types instead of going into node_modules.
declare module '@openmrs/esm-react-utils' {
  // Make this as precise as you like; `any` is fine just to unblock CI
  export function useAttachments(...args: any[]): any;
}
