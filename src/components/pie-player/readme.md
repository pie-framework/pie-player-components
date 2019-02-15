# pie-player

The Pie Player loads PIE content for rendering.

<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                   | Type                               | Default                               |
| --------- | --------- | --------------------------------------------- | ---------------------------------- | ------------------------------------- |
| `config`  | --        | The Pie config model.                         | `AdvancedItemConfig \| PieContent` | `undefined`                           |
| `env`     | --        | Describes runtime environment for the player. | `Object`                           | `{ mode: 'gather', role: 'student' }` |
| `session` | --        | The Pie Session                               | `{ id: string; data: any[]; }`     | `{id: nanoid(), data:[]}`             |


## Events

| Event            | Description                                                                                              | Type                |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ------------------- |
| `sessionUpdated` | Emmitted when any interaction in the set of interactions being rendered has been mutated by user action. | `CustomEvent<void>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
