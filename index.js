'use strict';

const {
  nop,
  IIFE,
  /* --- */
  getPluginShortName,
  getPluginConfig,
  requirePluginHooks,
} = require('./pluginhookscheduler');

module.exports = function ({
  __dirname,
  defaultConfigGenerator,
  requiredPluginHooks,
}) {
  const PLUGIN_SHORT_NAME = getPluginShortName(__dirname);
  const pluginConfig = getPluginConfig(PLUGIN_SHORT_NAME, defaultConfigGenerator ?? nop);
  requirePluginHooks(requiredPluginHooks ?? []);
  return {
    PLUGIN_SHORT_NAME,
    pluginConfig,
    nop,
    IIFE,
  }
};
