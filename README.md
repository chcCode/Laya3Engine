# Laya3Engine

LayaAir 3 empty project with a lightweight, reusable TypeScript game framework.

## Framework Modules

- `GameApp`: application entry, lifecycle, update loop, service registry, global events.
- `EventBus`: typed publish/subscribe event center.
- `ServiceLocator`: dependency registry for managers and game services.
- `StateMachine`: async-safe game flow state machine.
- Managers: assets, audio, input, layer, scene, storage.
- `BaseView`: UI base class with layer mounting and event cleanup.

## Entry

The scene script `src/Main.ts` boots the framework and starts `GameBootstrap`.

```ts
await GameApp.I
    .use(new GameBootstrap())
    .boot();
```

## Recommended Flow

1. Add cross-game systems as `GameModule`.
2. Register feature services through `app.services`.
3. Put display roots under `LayerManager` layers.
4. Use `app.events` for decoupled feature communication.

## Luban Config

Project-side Luban files are under `config/luban` and `tools/luban`.

```bat
tools\luban\gen_config.cmd
```

Generated JSON is loaded by `ConfigManager` from `assets/resources/config/json`.
