# pie-player

The `pie-player` component will load pie content for rendering.
  
### Showing a Loader

This component loads the bundled JS assets from the build service. While these assets are loading 
The class `pie-loading` will be added to the element while assets are being loaded from the server.
  
 

<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                   | Type                               | Default                               |
| --------- | --------- | --------------------------------------------- | ---------------------------------- | ------------------------------------- |
| `config`  | --        | The Pie config model.                         | `AdvancedItemConfig \| PieContent` | `undefined`                           |
| `env`     | --        | Describes runtime environment for the player. | `Object`                           | `{ mode: 'gather', role: 'student' }` |
| `session` | --        | The Pie Session                               | `{ id: string; data: any[]; }`     | `{id: "", data:[]}`                   |


## Events

| Event               | Description                                                                                                                               | Type                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `responseCompleted` | TODO - Emmitted when any all interactions in a PIE Assessment Item have reported that a user  has provided a response to the interaction. | `CustomEvent<void>` |
| `sessionChanged`    | Emmitted when any interaction in the set of interactions being rendered has been mutated by user action.                                  | `CustomEvent<void>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
