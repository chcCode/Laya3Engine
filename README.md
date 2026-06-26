# Laya3Engine

这是一个基于 LayaAir 3 的空项目模板，已内置一套轻量、通用、可复用的 TypeScript 游戏框架，并接入 Luban 配置表工作流。

## 项目内容

- LayaAir 3 项目基础目录与默认场景。
- 通用游戏框架：生命周期、模块、服务、事件、状态机、资源、场景、UI、音频、输入、存档。
- Luban 配置表目录、示例表、生成脚本与运行时加载管理器。
- 可直接运行的示例启动逻辑：启动框架后加载 `TbItemConfig` 并显示欢迎 UI。

## 框架模块

- `GameApp`：游戏入口，负责启动流程、生命周期、主循环、服务注册和全局事件。
- `EventBus`：类型化事件总线，用于模块之间解耦通信。
- `ServiceLocator`：服务容器，用于注册和获取全局管理器或业务服务。
- `StateMachine`：支持异步切换的通用状态机，适合大厅、战斗、结算等流程。
- `AssetManager`：资源加载与资源缓存访问封装。
- `SceneManager`：Laya 场景加载与切换封装。
- `LayerManager`：统一显示层级，默认包含 `Scene`、`Game`、`UI`、`Popup`、`Toast`。
- `AudioManager`：背景音乐和音效播放封装。
- `InputManager`：键盘输入状态管理。
- `StorageManager`：本地存档读写封装。
- `ConfigManager`：配置表加载、缓存和按 id 查询。
- `BaseView`：UI 基类，提供打开、关闭、事件清理能力。

## 启动入口

场景脚本 `src/Main.ts` 会启动框架并挂载 `GameBootstrap` 模块：

```ts
await GameApp.I
    .use(new GameBootstrap())
    .boot();
```

业务启动逻辑位于 `src/game/GameBootstrap.ts`，可以在这里加载配置、进入首个状态或打开首个界面。

## 推荐开发流程

1. 把跨玩法、跨界面的系统写成 `GameModule`，通过 `GameApp.I.use(...)` 挂载。
2. 把全局业务能力注册到 `app.services`，避免模块之间直接强依赖。
3. 把显示对象挂到 `LayerManager` 管理的层级中，统一控制 UI、弹窗和提示。
4. 用 `app.events` 做事件派发，减少功能之间的直接引用。
5. 用 `app.configs.loadTable<T>(...)` 加载 Luban 导出的配置表。

## Luban 配置表

项目侧 Luban 文件位于：

- `config/luban/Defines/__beans__.xml`：数据结构定义。
- `config/luban/Defines/__tables__.xml`：表定义。
- `config/luban/Datas/item.csv`：示例数据表。
- `tools/luban/gen_config.cmd`：Windows 生成入口。
- `tools/luban/gen_config.ps1`：PowerShell 生成脚本。

生成配置：

```bat
tools\luban\gen_config.cmd
```

默认输出：

- JSON 数据：`assets/resources/config/json`
- TypeScript 代码：`src/game/config/generated`

注意：仓库不包含 Luban 可执行文件。请把 `Luban.ClientServer.exe` 或 `Luban.ClientServer.dll` 放到 `tools/luban` 目录，或执行脚本时通过 `-Luban <path>` 指定路径。

## 配置读取示例

`ConfigManager` 默认从 `assets/resources/config/json` 加载 JSON：

```ts
import type { ItemConfig } from "./config/ItemConfig";

const items = await app.configs.loadTable<ItemConfig>("TbItemConfig");
const gold = items.require(1001);
console.log(gold.name);
```

`require(id)` 找不到配置时会抛出错误；如果需要可选读取，使用 `get(id)`。

## 常用命令

类型检查：

```bat
tsc.cmd --noEmit --pretty false
```

提交代码前建议先运行类型检查，并在 LayaAir 编辑器中重新编译运行一次。

## Git 说明

当前项目已连接远程仓库：

```text
https://github.com/chcCode/Laya3Engine.git
```

默认分支为 `master`。
