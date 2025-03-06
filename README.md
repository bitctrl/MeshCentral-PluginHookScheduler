# MeshCentral-PluginHookScheduler

**Currently this is a draft**

see [Plugin Hooks](https://github.com/Ylianst/MeshCentral/blob/master/docs/docs/meshcentral/plugins.md#plugin-hooks) in the documentation.

## `meshcentral-data/config.json`
```json
{
  "$schema": "https://raw.githubusercontent.com/Ylianst/MeshCentral/master/meshcentral-config-schema.json",
  "settings": {
    "plugins": {
      "enabled": true,
      "pluginSettings": {
        "pluginhookscheduler": {
          "backendhooks": [
            ["server_startup", ["routeplus", "pingpong"]],
            ["hook_setupHttpHandlers", ["not-installed"]],
            ["# hook_userLoggedIn", []],
            ["# hook_processAgentData", []],
            ["# hook_agentCoreIsStable", []],
            ["*", ["devtools", "pingpong"]]
          ],
          "webuihooks": [
            ["#", ["NOT IMPLEMENTED YET"]]
          ]
        }
      }
    }
  }
}
```