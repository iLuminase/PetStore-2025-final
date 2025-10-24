const {
  withNativeFederation,
  shareAll,
} = require("@angular-architects/native-federation/config");

module.exports = withNativeFederation({
  name: "shared",

  exposes: {
    "./AuthModule": "./projects/shared/src/app/auth/auth.module.ts",
    "./CommonModule": "./projects/shared/src/app/common/common.module.ts",
  },

  shared: {
    "@angular/core": {
      singleton: true,
      strictVersion: true,
      requiredVersion: "auto",
    },
    "@angular/common": {
      singleton: true,
      strictVersion: true,
      requiredVersion: "auto",
    },
    "@angular/router": {
      singleton: true,
      strictVersion: true,
      requiredVersion: "auto",
    },
    "@angular/forms": {
      singleton: true,
      strictVersion: true,
      requiredVersion: "auto",
    },
    rxjs: { singleton: true, strictVersion: true, requiredVersion: "auto" },
    "keycloak-js": {
      singleton: true,
      strictVersion: true,
      requiredVersion: "auto",
    },
    "keycloak-angular": {
      singleton: true,
      strictVersion: true,
      requiredVersion: "auto",
    },
    "zone.js": {
      singleton: true,
      strictVersion: true,
      requiredVersion: "auto",
    },
  },

  skip: ["rxjs/ajax", "rxjs/fetch", "rxjs/testing", "rxjs/webSocket"],
});
