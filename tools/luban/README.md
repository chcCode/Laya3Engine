# Luban 配置工具

本目录用于存放 Luban 配置生成工具和项目侧生成脚本。Luban 负责把 `config/luban` 下的表结构与数据表导出为游戏运行时可读取的 JSON，以及可选的 TypeScript 配置代码。

## 目录说明

```text
tools/luban/
  gen_config.cmd          Windows 快捷生成入口
  gen_config.ps1          PowerShell 生成脚本
  README.md               本说明文档
  Luban.ClientServer.exe  本地放置，仓库不提交

config/luban/
  Defines/__beans__.xml   配置数据结构定义
  Defines/__tables__.xml  配置表定义
  Datas/item.csv          示例配置表
```

生成输出目录：

- `assets/resources/config/json`：导出的 JSON 配置，游戏运行时从这里加载。
- `src/game/config/generated`：Luban 生成的 TypeScript 代码输出目录。

## 第一步：安装 Luban

1. 下载 Luban 工具包。
2. 将 `Luban.ClientServer.exe` 或 `Luban.ClientServer.dll` 放入 `tools/luban` 目录。
3. 确认目录中能看到以下文件之一：

```text
tools/luban/Luban.ClientServer.exe
```

或：

```text
tools/luban/Luban.ClientServer.dll
```

说明：仓库已忽略 `tools/luban/Luban.ClientServer*`，避免把本地工具二进制提交到 Git。

## 第二步：定义数据结构

在 `config/luban/Defines/__beans__.xml` 中定义每一行配置的数据结构。

示例：

```xml
<bean name="ItemConfig" comment="Item configuration">
    <var name="id" type="int" comment="Unique item id"/>
    <var name="name" type="string" comment="Display name"/>
    <var name="icon" type="string" comment="Icon resource path"/>
    <var name="quality" type="int" comment="Quality level"/>
    <var name="desc" type="string" comment="Description"/>
</bean>
```

## 第三步：定义配置表

在 `config/luban/Defines/__tables__.xml` 中声明配置表名称、数据类型、输入文件和索引字段。

示例：

```xml
<table name="TbItemConfig" value="ItemConfig" input="item.csv" mode="map" index="id"/>
```

字段含义：

- `name`：导出的表名，运行时用这个名字加载，例如 `TbItemConfig`。
- `value`：表中每行使用的 bean 类型。
- `input`：数据源文件，位于 `config/luban/Datas`。
- `mode`：表结构模式，常用 `map` 表示按 key 查询。
- `index`：主键字段，本项目示例使用 `id`。

## 第四步：填写数据表

在 `config/luban/Datas` 下维护 CSV 数据。

示例：`config/luban/Datas/item.csv`

```csv
##var,id,name,icon,quality,desc
##type,int,string,string,int,string
##group,c,c,c,c,c
##,Item id,Item name,Icon path,Quality,Description
1001,Gold,resources/icons/gold.png,1,Basic currency
```

表头说明：

- `##var`：字段名，需要和 bean 中的字段对应。
- `##type`：字段类型。
- `##group`：导出分组，`c` 表示客户端使用。
- `##`：备注行，便于策划或开发理解字段含义。

## 第五步：生成配置

在项目根目录执行：

```bat
tools\luban\gen_config.cmd
```

如果 Luban 不在默认目录，可以手动指定路径：

```bat
tools\luban\gen_config.cmd -Luban D:\tools\luban\Luban.ClientServer.exe
```

生成成功后会输出：

```text
Luban config generated:
  data: <项目路径>\assets\resources\config\json
  code: <项目路径>\src\game\config\generated
```

## 第六步：在游戏中读取配置

运行时通过 `ConfigManager` 加载配置：

```ts
import type { ItemConfig } from "../../game/config/ItemConfig";

const items = await app.configs.loadTable<ItemConfig>("TbItemConfig");
const gold = items.require(1001);
console.log(gold.name);
```

读取接口：

- `loadTable<T>(name)`：加载配置表。
- `getTable<T>(name)`：获取已加载的配置表。
- `table.get(id)`：按 id 可选读取，找不到返回 `undefined`。
- `table.require(id)`：按 id 强制读取，找不到会抛错。

## 常见问题

### 提示找不到 Luban executable

错误示例：

```text
Luban executable was not found.
```

处理方式：

1. 确认 `Luban.ClientServer.exe` 或 `Luban.ClientServer.dll` 已放入 `tools/luban`。
2. 或执行脚本时通过 `-Luban <path>` 指定 Luban 路径。

### 运行时报 Config row not found

可能原因：

1. JSON 未生成或未放到 `assets/resources/config/json`。
2. 加载的表名和 `__tables__.xml` 中的 `name` 不一致。
3. 查询的 id 不存在。
4. 修改配置后没有重新执行生成，或 Laya 编辑器没有重新编译运行。

### 修改表结构后需要做什么

1. 修改 `__beans__.xml` 或 `__tables__.xml`。
2. 修改对应 CSV 数据。
3. 执行 `tools\luban\gen_config.cmd`。
4. 在 LayaAir 编辑器中重新编译运行。
5. 如有手写类型文件，也要同步更新类型定义。

## 当前示例

仓库内置了一个可运行示例：

- 表定义：`TbItemConfig`
- 数据文件：`config/luban/Datas/item.csv`
- 运行时 JSON：`assets/resources/config/json/TbItemConfig.json`
- 手写类型：`src/game/config/ItemConfig.ts`

启动逻辑在 `src/game/GameBootstrap.ts` 中会加载 `TbItemConfig` 并读取 id 为 `1001` 的配置。
