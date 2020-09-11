# item-preview-tool



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default                                |
| -------- | --------- | ----------- | -------- | -------------------------------------- |
| `text`   | `text`    |             | `string` | `JSON.stringify(demoItem, null, "  ")` |


## Dependencies

### Depends on

- [code-editor](.)
- [pie-player](../pie-player)

### Graph
```mermaid
graph TD;
  item-preview-tool --> code-editor
  item-preview-tool --> pie-player
  pie-player --> pie-stimulus-layout
  pie-player --> pie-player
  pie-player --> pie-spinner
  style item-preview-tool fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------


