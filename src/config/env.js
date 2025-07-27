const ENV = {
  dev: {
    apiUrl: process.env.DEV_URL,
    apiKey: process.env.DEV_API_KEY,
  },
  staging: {
    apiUrl: process.env.STAGING_URL,
    apiKey: process.env.STAGING_API_KEY,
  },
  prod: {
    apiUrl: process.env.PROD_URL,
    apiKey: process.env.PROD_API_KEY,
  },
};

const getEnvVars = () => {
  const env = process.env.NODE_ENV || 'development';
  console.log('Current NODE_ENV:', env);

  if (env === 'development') {
    console.log('Using development environment');
    return ENV.dev;
  } else if (env === 'staging') {
    console.log('Using staging environment');
    return ENV.staging;
  } else if (env === 'production') {
    console.log('Using production environment');
    return ENV.prod;
  }

  console.log('No environment matched, using development as default');
  return ENV.dev;
};

export default getEnvVars;
