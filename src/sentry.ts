import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.APP_VERSION,
  environment: process.env.APP_ENVIRONMENT,
});

export default Sentry;
