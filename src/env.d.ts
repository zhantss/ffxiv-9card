/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $electron: any
}

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ID: string
  readonly VITE_APP_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
