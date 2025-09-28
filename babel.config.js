// Step 3: Reanimated configuration
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin' // Step 3: ensure the plugin is last
    ]
  };
};
