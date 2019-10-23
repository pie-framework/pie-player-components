# pie-loader



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description                                                                                                 | Type     | Default |
| ------------ | ------------- | ----------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `maxTimeout` | `max-timeout` | If the bundle is not available yet, the maximum number of milliseconds  between two retries for downloading | `number` | `2000`  |
| `minTimeout` | `min-timeout` | If the bundle is not available yet, number of milliseconds before starting  the first retry attempt.        | `number` | `1000`  |
| `retries`    | `retries`     | If the bundle is not available yet, the number of re-try attempts to download.                              | `number` | `10`    |


## Methods

### `loadPies(pieContent: PieContent) => Promise<void>`

Loads the custom elments defined by the PIEs, if they are not already loaded.

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
