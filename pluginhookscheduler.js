'use strict';
/**********************************************************************
 * Copyright (C) 2025 BitCtrl Systems GmbH
 * 
 * pluginhookscheduler.js
 * 
 * @author  Daniel Hammerschmidt <daniel.hammerschmidt@bitctrl.de>
 * @author  Daniel Hammerschmidt <daniel@redneck-engineering.com>
 * @version 0.0.0-draft+20251041
 *********************************************************************/

function getPluginShortName(dirname) {
  return dirname.split(require('node:path').sep).pop();
}

function getPluginConfig(pluginHandler, pluginShortName) {
  const pluginsConfig = pluginHandler.parent.config.settings.plugins;
  const pluginSettings = pluginsConfig.pluginsettings ?? (pluginsConfig.pluginsettings = {});
  return pluginSettings[pluginShortName] ?? (pluginSettings[pluginShortName] = {});
}

const PLUGIN_SHORT_NAME = getPluginShortName(__dirname);

const boundHooks = new Map();

function PluginHandler_firstHookInvocation(hookName) {
  const config = getPluginConfig(this, PLUGIN_SHORT_NAME);
  if (Array.isArray(config.backendhooks)) {
    // don't try-catch, check mesherrors.txt
    config.backendhooks = Object.assign({}, Object.fromEntries(config.backendhooks));
  }
  const hooks = new Set();
  const plugins = new Map(Object.entries(this.plugins).filter(([_, plugin]) => (typeof plugin[hookName] === 'function')));
  const schedule = (config.backendhooks[hookName] ?? config.backendhooks['*'] ?? [])
    .filter((name) => {
      if (plugins.has(name)) { return true; }
      console.warn(`Scheduled plugin "${name}" is not installed or has no handler for "${hookName}".`);
      return false;
    })
    .map((name) => ([name, plugins.get(name)]));
  for (const [name, obj] of schedule) {
    const hook = obj[hookName].bind(obj);
    hook.pluginName = name;
    hooks.add(hook);
    plugins.delete(name);
  };
  for (const [name, obj] of plugins) {
    const hook = obj[hookName].bind(obj);
    hook.pluginName = name;
    hooks.add(hook);
  }
  // called once, don't store
  if (!(hookName === 'server_startup' || hookName === 'hook_setupHttpHandlers')) {
    boundHooks.set(hookName, hooks);
  }
  return hooks;
}

function wrap_PlugHandler_callHook(hookName, ...args) {
  const hooks = boundHooks.get(hookName) ?? PluginHandler_firstHookInvocation.call(this, hookName);
  for (const boundHook of hooks) {
    try {
      boundHook(...args);
    } catch (e) {
      console.log("Error occurred while running plugin hook " + boundHook.pluginName + ':' + hookName + ' (' + e + ')');
    }
  }
}

module.exports = {
  [PLUGIN_SHORT_NAME]: function (pluginHandler) {
    pluginHandler.callHook = wrap_PlugHandler_callHook.bind(pluginHandler);
    return {};
  },
  getPluginShortName,
  getPluginConfig,
};
