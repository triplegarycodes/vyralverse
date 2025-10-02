// Step 3: Reanimated configuration
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@core': './src/core',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services'
          }
        }
      ],
      'react-native-reanimated/plugin' // Step 3: ensure the plugin is last
    ]
  };
};
