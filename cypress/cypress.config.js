const getCompareSnapshotsPlugin = require('cypress-visual-regression/dist/plugin');
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    "baseUrl": "http://localhost:8080",
    "defaultCommandTimeout": 60000,
    "numTestsKeptInMemory": 0,
    "modifyObstructiveCode": false,
    "screenshotsFolder": "cypress/snapshots/actual",  // Need to use cypress sub directory as cannot override plugin locations
    "specPattern": "integration/*.js",
    "supportFile": "support/commands.js",
    "trashAssetsBeforeRuns": true,
    setupNodeEvents(on, config) {
      getCompareSnapshotsPlugin(on, config);

      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'electron' && browser.isHeadless) {
          launchOptions.preferences.width = 1024;
          launchOptions.preferences.height = 800;
          launchOptions.preferences.frame = false;
          launchOptions.preferences.useContentSize = true;
        }
        return launchOptions
      })
    },
    "videoCompression": false,
    "video": false,
  },
})
