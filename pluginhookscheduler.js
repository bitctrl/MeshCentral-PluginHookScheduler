'use strict';
/**********************************************************************
 * Copyright (C) 2025 BitCtrl Systems GmbH
 * 
 * pluginhookscheduler.js
 * 
 * @author  Daniel Hammerschmidt <daniel.hammerschmidt@bitctrl.de>
 * @author  Daniel Hammerschmidt <daniel@redneck-engineering.com>
 * @version 0.0.1
 *********************************************************************/

const { sep: PATH_SEP } = require('node:path');

function nop() {};
function pass(value) { return value; }
// ["Immediately Invoked Function Expression" with arguments first](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
function IIFE(/* ...args, */ iife) { return (iife = arguments[arguments.length - 1]), iife.apply(this, Array.prototype.slice.call(arguments, 0, arguments.length - 1)); };
const objectFromNull = Object.create(null);

const { mcConfig, mcPackageJson } = IIFE(function() {
  const mcPath = require.main.path;
  const mcPackageJson = require(mcPath + '/package.json');
  const mcDataPathRel = (mcPath.replaceAll(PATH_SEP, '/').endsWith('/node_modules/meshcentral') ? '/..' : '') + '/../meshcentral-data';
  const mcConfig = require(mcPath + mcDataPathRel + '/config.json');
  return { mcConfig, mcPackageJson };
});

function getPluginShortName(dirname) {
  return dirname.split(PATH_SEP).pop();
}

// get settings.plugins.pluginsettings[PLUGIN_SHORT_NAME] in module scope (before module.exports is called)
function getPluginConfig(pluginShortName, defaultConfigGenerator) {
  const pluginsConfig = mcConfig.settings.plugins;
  const pluginSettings = pluginsConfig.pluginsettings ?? (pluginsConfig.pluginsettings = {});
  const config = pluginSettings[pluginShortName] ?? (pluginSettings[pluginShortName] = defaultConfigGenerator());
  return config;
}

function requirePluginHooks(...hooks) {
  for (let hook of hooks) {
    try { pluginConfig.backendhooks[hook].length; } catch (error) { error.message = `Enable ${hooks.join(', ')}! ${error.message}`; throw error; }
  }
}

const PLUGIN_SHORT_NAME = getPluginShortName(__dirname);
const pluginConfig = getPluginConfig(PLUGIN_SHORT_NAME, () => ({
  backendhooks: [],
  webuihooks: [],
}));
// don't try-catch, check mesherrors.txt
pluginConfig.backendhooks = Object.assign({}, Object.fromEntries(pluginConfig.backendhooks));

const boundHooks = new Map();

function PluginHandler_firstHookInvocation(hookName) {
  const hooks = new Set();
  const plugins = new Map(Object.entries(this.plugins).filter(([_, plugin]) => (typeof plugin[hookName] === 'function')));
  const schedule = (pluginConfig.backendhooks[hookName] ?? pluginConfig.backendhooks['*'] ?? [])
    .filter((name) => {
      if (name[0] === '#') { return false; }
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
      console.log("Error occurred while running plugin hook " + boundHook.pluginName + ':' + hookName, e);
    }
  }
}

let meshserver, webserver;

module.exports = {
  [PLUGIN_SHORT_NAME]: function (pluginHandler) {
    meshserver = pluginHandler.parent;
    pluginHandler.callHook = wrap_PlugHandler_callHook.bind(pluginHandler);
    return {
      server_startup: function () {
        webserver = meshserver.webserver;
        const hooks = new Set(Object.keys(pluginConfig.backendhooks).filter((name) => (name.startsWith('hook_'))));
        function wrapFunctionCall(targetObject, targetFunctionName) {
          function mkhook(name, v) { return hooks.has(name) ? pluginHandler.callHook.bind(null, name) : v; }
          if (hooks.has('hook_before' + targetFunctionName) || hooks.has('hook_after' + targetFunctionName)) {
            const before = mkhook('hook_before' + targetFunctionName, nop);
            const target = targetObject[targetFunctionName];
            const after = mkhook('hook_after' + targetFunctionName, pass);
            targetObject[targetFunctionName] = function () {
              before.apply(targetObject, arguments);
              return after.call(targetObject, target.apply(targetObject, arguments), ...arguments);
            }
  
          }  
        }
        wrapFunctionCall(webserver.meshAgentHandler, 'CreateMeshAgent');
        wrapFunctionCall(webserver.meshRelayHandler, 'CreateMeshRelay');
        wrapFunctionCall(webserver.meshRelayHandler, 'CreateLocalRelay');
        wrapFunctionCall(webserver.meshUserHandler, 'CreateMeshUser');
        wrapFunctionCall(meshserver, 'NotifyUserOfDeviceStateChange');
      },
    };
  },
  nop,
  IIFE,
  objectFromNull,
  getPluginShortName,
  getPluginConfig,
  requirePluginHooks,
};
