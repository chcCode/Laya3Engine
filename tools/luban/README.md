# Luban Config Tool

This folder contains the project-side wrapper for Luban config generation.

## Install Luban

Download Luban and put either `Luban.ClientServer.exe` or `Luban.ClientServer.dll` in this folder.

Expected layout:

```text
tools/luban/Luban.ClientServer.exe
tools/luban/gen_config.ps1
config/luban/Defines/__beans__.xml
config/luban/Defines/__tables__.xml
config/luban/Datas/item.csv
```

## Generate

```bat
tools\luban\gen_config.cmd
```

Outputs:

- JSON data: `assets/resources/config/json`
- TypeScript code: `src/game/config/generated`

The repository includes `assets/resources/config/json/TbItemConfig.json` and `src/game/config/ItemConfig.ts` as a runnable starter sample.
