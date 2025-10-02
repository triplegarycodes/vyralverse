const { config } = require('dotenv');

// Load environment variables from a local .env file when available.
config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
const PUBLIC_OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

module.exports = {
  expo: {
    name: 'Vyral Verse',
    slug: 'vyral-verse',
    scheme: 'vyral',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#02010A',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.vyralverse.app',
    },
    web: {
      bundler: 'metro',
    },
    extra: {
      openAiApiKey: OPENAI_API_KEY,
      public: {
        openAiApiKey: PUBLIC_OPENAI_API_KEY,
      },
    },
  },
};
