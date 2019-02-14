# pie-player

The Pie Player loads PIE content for rendering.

<!-- Auto Generated Below -->


## Usage

### VueJs

### 1: Add the component to the dependencies

```json
// package.json

"dependencies": {
  ...
  "@pie-framework/pie-player-components": "latest"
}
```

### 2: Import the component(s)

```javascript
import { defineCustomElements } from '@pie-framework/pie-player-components/dist/loader';

defineCustomElements(window);
```

### 3: Consume the component

To prevent Vue from complaining that your component has an unrecognized tag, add the following in main.js. Use either the full name, or regex if you want to capture a family of components.

```json
Vue.config.ignoredElements = [
  "pie-player",
  "pie-author"
];
```

It is now possible to use the tag provided by the pie components in any template of the app.

```html
<pie-player v-bind:config.prop="config" />
```


### ScriptTag

Put  

```html
<script src='https://unpkg.com/@pie-framework@latest/dist/pie-player-components.js'></script>
``` 

in the head of your index.html

Then you can use the element anywhere in your template, JSX, html etc.

```html
<pie-player id="player"></pie-player>
<script>
      const player = document.getElementById('player');

      player.addEventListener('session-changed', event => {
        // do something
      });

      player.config = config;
</script>
```



## Properties

| Property  | Attribute | Description                                   | Type                               | Default                               |
| --------- | --------- | --------------------------------------------- | ---------------------------------- | ------------------------------------- |
| `config`  | --        | The Pie config model.                         | `AdvancedItemConfig \| PieContent` | `undefined`                           |
| `env`     | --        | Describes runtime environment for the player. | `Object`                           | `{ mode: 'gather', role: 'student' }` |
| `session` | --        | The Pie Session                               | `Object`                           | `{}`                                  |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
