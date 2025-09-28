// Step 8: .env & Config wiring for Vyral Verse
import 'dotenv/config';

export default {
  expo: {
    name: 'Vyral Verse',
    slug: 'vyral-verse',
    scheme: 'vyral',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    splash: {
      // Placeholder splash configuration until vector assets are added
      resizeMode: 'contain',
      backgroundColor: '#02010A'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true
    },
    android: {
      package: 'com.vyralverse.app'
    },
    web: {
      bundler: 'metro'
    },
    extra: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? ''
    }
  }
};
