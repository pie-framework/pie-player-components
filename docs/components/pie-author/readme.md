# pie-author

  
### Showing a Loader

This component loads the bundled JS assets from the build service. While these assets are loading 
The class `pie-loading` will be added to the element while assets are being loaded from the server.
  
 

<!-- Auto Generated Below -->


## Properties

| Property                    | Attribute                   | Description                                                                                                                                                                                                                                                                                                                                  | Type                                 | Default                           |
| --------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------- |
| `addPreview`                | `add-preview`               | Adds a preview view which will render the content in another tab as it may appear to a student or instructor.                                                                                                                                                                                                                                | `boolean`                            | `false`                           |
| `addRubric`                 | `add-rubric`                | If set the player will add a rubric authoring interaction to the config                                                                                                                                                                                                                                                                      | `boolean`                            | `undefined`                       |
| `bundleEndpoints`           | --                          | Provide this property override the default endpoints used by the player to retrieve JS bundles. Must be set before setting the config property. Most users will not need to use this property.                                                                                                                                               | `BundleEndpoints`                    | `undefined`                       |
| `bundleHost`                | `bundle-host`               | Optionally specifies the back-end that builds and hosts javascript bundles for rendering assessment items. This property lets you choose which environment to use, from 'dev' , 'stage' or 'prod' environments. Until 1.0 will default to 'stage'. Starting v2.0.3, it will temporarily redirect to production only                          | `string`                             | `undefined`                       |
| `canWatchConfigSettings`    | `can-watch-config-settings` | used in our demo environment to allow author to watch config settings and make updates defaults to false (do not set it to true because it was not tested properly)                                                                                                                                                                          | `boolean`                            | `false`                           |
| `config`                    | --                          | The Pie config model.                                                                                                                                                                                                                                                                                                                        | `AdvancedItemConfig \| PieContent`   | `undefined`                       |
| `configSettings`            | --                          | To customize the standard behaviour provided by interaction configuration views you can provide settings key-ed by the package name.  e.g.  `{ '@pie-element/inline-choice': { promptLabel: 'Item Stem' } }`  The settings that are configurable for each authoring view are documented in the `@package-name/docs` folder for each package. | `{ [packageName: string]: Object; }` | `undefined`                       |
| `defaultComplexRubricModel` | --                          | To provide a way to add a default model to complex-rubric                                                                                                                                                                                                                                                                                    | `Object`                             | `undefined`                       |
| `disableBundler`            | `disable-bundler`           | Allows disabling of the default behaviour which is to look up and load the JS bundle that define the Custom Elements used by the item config. This if for advanced use cases when using the pie-player in a container that is managing loading of Custom Elements and Controllers.                                                           | `boolean`                            | `false`                           |
| `imageSupport`              | --                          | external providers can set this if they need to upload the assets to the cloud etc. by default we use data urls                                                                                                                                                                                                                              | `ExternalImageSupport`               | `new DataURLImageSupport()`       |
| `isInsidePieApiAuthor`      | `is-inside-pie-api-author`  | If pie-author is used inside pie-api-author component. Do not set it manually.                                                                                                                                                                                                                                                               | `boolean`                            | `false`                           |
| `loaderConfig`              | --                          | The Pie loader config.                                                                                                                                                                                                                                                                                                                       | `{ trackPageActions?: boolean; }`    | `undefined`                       |
| `reFetchBundle`             | `re-fetch-bundle`           | used to automatically re-fetch the bundle (in case we get a 503)                                                                                                                                                                                                                                                                             | `boolean`                            | `false`                           |
| `uploadSoundSupport`        | --                          | external providers can set this if they need to upload the assets to the cloud etc. by default we use data urls                                                                                                                                                                                                                              | `ExternalUploadSoundSupport`         | `new DataURLUploadSoundSupport()` |
| `version`                   | `version`                   |                                                                                                                                                                                                                                                                                                                                              | `string`                             | `VERSION`                         |


## Events

| Event          | Description                                                                                | Type               |
| -------------- | ------------------------------------------------------------------------------------------ | ------------------ |
| `modelLoaded`  | Emmitted when the content models in the config have been set on the content                | `CustomEvent<any>` |
| `modelUpdated` | Emmitted when the model for the content has been updated within the ui due to user action. | `CustomEvent<any>` |


## Methods

### `addMultiTraitRubricToConfig(config: ItemConfig, multiTraitRubricModel?: any) => Promise<PieContent>`

Utility method to add a `@pie-element/multi-trait-rubric` section to an item config when creating an item should be used before setting the config.
*

#### Returns

Type: `Promise<PieContent>`



### `addRubricToConfig(config: ItemConfig, rubricModel?: any) => Promise<PieContent>`

<span style="color:red">**[DEPRECATED]**</span> this method is for temporary use, will be removed at next major release<br/><br/>Utility method to add a `@pie-element/rubric` section to an item config when creating an item should be used before setting the config.

#### Returns

Type: `Promise<PieContent>`



### `validateModels() => Promise<any>`



#### Returns

Type: `Promise<any>`




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


