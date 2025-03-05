# MeshCentral-PluginHookScheduler

**Currently this is a draft**

## `meshcentral-data/config.json`
```json
{
  "$schema": "https://raw.githubusercontent.com/Ylianst/MeshCentral/master/meshcentral-config-schema.json",
  "settings": {
    "plugins": {
      "enabled": true,
      "pluginSettings": {
        "pluginhookscheduler": [
          ["server_startup", ["routeplus"]],
          ["hook_setupHttpHandlers", []],
          ["hook_userLoggedIn", []],
          ["hook_processAgentData", []],
          ["hook_agentCoreIsStable", []],
          ["*", ["devtools", "pingpong"]]
        ]
      }
    }
  }
}
```