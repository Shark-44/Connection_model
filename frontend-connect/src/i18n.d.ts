// src/i18n.d.ts
import i18n from 'i18next';
declare module '../i18n' {
  export default i18n;
}

export function t(arg0: string): string {
  throw new Error('Function not implemented.');
}
