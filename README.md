# MeshCentral-PluginHookScheduler

Specify the order in wich [MeshCentral](https://github.com/Ylianst/MeshCentral) calls the hooks of [MeshCentral-Plugins](https://github.com/topics/meshcentral-plugin) and wrap around internal functions with more hooks for features, development  and debugging.

see [Plugin Hooks](https://github.com/Ylianst/MeshCentral/blob/master/docs/docs/meshcentral/plugins.md#plugin-hooks) in the documentation.

## Installation

See [Plugins - Installation & Usage](https://github.com/Ylianst/MeshCentral/blob/master/docs/docs/meshcentral/plugins.md)

To install, simply add the plugin configuration URL when prompted:
```
https://raw.githubusercontent.com/bitctrl/MeshCentral-PluginHookScheduler/main/config.json
```

## Usage

Refer to [MeshCentral-PluginHookExample](https://github.com/bitctrl/MeshCentral-PluginHookExample).

## Configuration

### `meshcentral-data/config.json`
```json
{
  "$schema": "https://raw.githubusercontent.com/Ylianst/MeshCentral/master/meshcentral-config-schema.json",
  "settings": {
    "plugins": {
      "enabled": true,
      "pluginSettings": {
        "pluginhookscheduler": {
          "backendhooks": [
            ["server_startup", ["wireshark", "# routeplus", "# pingpong", "# not-plugin"]],
            ["hook_setupHttpHandlers", ["# not-installed", "# not-installed2"]],
            ["# hook_userLoggedIn", []],
            ["# hook_processAgentData", []],
            ["# hook_agentCoreIsStable", []],
            ["hook_beforeCreateMeshAgent", []],
            ["hook_afterCreateMeshAgent", []],
            ["hook_beforeCreateMeshRelay", []],
            ["hook_afterCreateMeshRelay", []],
            ["hook_beforeCreateLocalRelay", []],
            ["hook_afterCreateLocalRelay", []],
            ["# hook_beforeCreateMeshUser", []],
            ["# hook_afterCreateMeshUser", []],
            ["hook_beforeNotifyUserOfDeviceStateChange", []],
            ["hook_afterNotifyUserOfDeviceStateChange", []],
            ["*", ["# devtools", "# pingpong"]]
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