# pie-author

  
### Showing a Loader

This component loads the bundled JS assets from the build service. While these assets are loading 
The class `pie-loading` will be added to the element while assets are being loaded from the server.
  
 

<!-- Auto Generated Below -->


## Properties

| Property         | Attribute     | Description                                                                                                                                                                                                                                                                                                                                    | Type                                 | Default     |
| ---------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------- |
| `addPreview`     | `add-preview` | Adds a preview view which will render the content in another tab as it may appear to a student or instructor.                                                                                                                                                                                                                                  | `boolean`                            | `false`     |
| `addRubric`      | `add-rubric`  | If set the player will add a rubric authoring interaction to the config                                                                                                                                                                                                                                                                        | `boolean`                            | `undefined` |
| `config`         | --            | The Pie config model.                                                                                                                                                                                                                                                                                                                          | `AdvancedItemConfig \| PieContent`   | `undefined` |
| `configSettings` | --            | To customize the standard behaviour provided by interaction configuration views you can  provide settings key-ed by the package name.  e.g.  `{ '@pie-element/inline-choice': { promptLabel: 'Item Stem' } }`  The settings that are configurable for each authoring view are documented in  the `@package-name/docs` folder for each package. | `{ [packageName: string]: Object; }` | `undefined` |


## Events

| Event          | Description                                                                                | Type               |
| -------------- | ------------------------------------------------------------------------------------------ | ------------------ |
| `modelLoaded`  | Emmitted when the content models in the config have ben set on the content                 | `CustomEvent<any>` |
| `modelUpdated` | Emmitted when the model for the content has been updated within the ui due to user action. | `CustomEvent<any>` |


## Methods

### `addRubricToConfig(config: ItemConfig, rubricModel?: any) => Promise<ItemConfig>`

<span style="color:red">**[DEPRECATED]**</span> this method is for temporary use, will be removed at next major release<br/><br/>Utility method to add a `@pie-element/rubric` section to an item config when creating an item should be used before setting the config.

#### Returns

Type: `Promise<ItemConfig>`




## Dependencies

### Depends on

- [pie-preview-layout](../pie-preview-layout)
- [pie-spinner](../pie-spinner)

### Graph
```mermaid
graph TD;
  pie-author --> pie-preview-layout
  pie-author --> pie-spinner
  pie-preview-layout --> pie-preview-control
  pie-preview-layout --> pie-player
  pie-player --> pie-stimulus-layout
  pie-player --> pie-player
  pie-player --> pie-spinner
  style pie-author fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
