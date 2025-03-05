'use strict';
/**********************************************************************
 * Copyright (C) 2025 BitCtrl Systems GmbH
 * 
 * pluginhookscheduler.js
 * 
 * @author  Daniel Hammerschmidt <daniel.hammerschmidt@bitctrl.de>
 * @author  Daniel Hammerschmidt <daniel@redneck-engineering.com>
 * @version 0.0.0-draft+20251031
 *********************************************************************/

const hooksMap = new Map();

function PluginHandler_firstHookInvocation(hookName, hooksMap) {
  let config;
  config = this.parent.config.settings.plugins;
  const pluginSettings = config.pluginsettings ?? (config.pluginsettings = {});
  config = pluginSettings.pluginhookscheduler ?? (pluginSettings.pluginhookscheduler = {});
  if (Array.isArray(config)) {
    config = pluginSettings.pluginhookscheduler = Object.assign({}, Object.fromEntries(config));
  }
  const hooks = new Set();
  const plugins = new Map(Object.entries(this.plugins).filter(([_, plugin]) => (typeof plugin[hookName] === 'function')));
  const schedule = (config[hookName] ?? config['*'] ?? [])
    .filter((name) => (plugins.has(name)))
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
  if (!(hookName === 'server_startup' || hookName === 'hook_setupHttpHandlers')) {
    hooksMap.set(hookName, hooks);
  }
  return hooks;
}

function wrap_PlugHandler_callHook(hookName, ...args) {
  const hooks = hooksMap.get(hookName) ?? PluginHandler_firstHookInvocation.call(this, hookName, hooksMap);
  for (const boundHook of hooks) {
    try {
      boundHook(...args);
    } catch (e) {
      console.log("Error occurred while running plugin hook " + boundHook.pluginName + ':' + hookName + ' (' + e + ')');
    }
  }
}

module.exports = {
  pluginhookscheduler: function (pluginHandler) {
    pluginHandler.callHook = wrap_PlugHandler_callHook.bind(pluginHandler);
    return {};
  },
};
