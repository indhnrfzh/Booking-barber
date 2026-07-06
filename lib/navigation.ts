import { defineRouting } from 'next-intl/routing';
import { getRequestConfig } from 'next-intl/server';

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id'
});

export default getRequestConfig(async ({ locale }) => ({
  locale: locale ?? routing.defaultLocale,
  messages: (await import(`../messages/${locale ?? routing.defaultLocale}.json`)).default,
  timeZone: 'Asia/Jakarta'
}));
