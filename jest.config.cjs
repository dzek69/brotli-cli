module.exports = {
  "collectCoverageFrom": [
    "src/**/*.{mjs,js,jsx,ts,tsx}",
    "!**/*.d.ts"
  ],
  "setupFiles": [
    "<rootDir>/test/bootstrap.cjs"
  ],
  "moduleNameMapper": {
    "^(.*).js$": "$1"
  },
  "testEnvironmentOptions": {
    "url": "http://localhost:8080"
  },
  "transform": {
    "\\.[jt]sx?$": [
      "babel-jest",
      {
        "configFile": "./test/babel.config.cjs"
      }
    ]
  }
};
