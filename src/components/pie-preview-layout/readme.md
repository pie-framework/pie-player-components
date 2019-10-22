# pie-preview-layout



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default     |
| -------- | --------- | ----------- | -------- | ----------- |
| `config` | --        |             | `Object` | `undefined` |


## Dependencies

### Used by

 - [pie-author](../pie-author)

### Depends on

- [pie-preview-control](../pie-preview-control)
- [pie-player](../pie-player)

### Graph
```mermaid
graph TD;
  pie-preview-layout --> pie-preview-control
  pie-preview-layout --> pie-player
  pie-player --> pie-player
  pie-player --> pie-spinner
  pie-author --> pie-preview-layout
  style pie-preview-layout fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
