![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Pie Player Components

> STATUS - Pre-Alpha, this is a work in progress. Apis may change.

This package provides Custom Html Elements for using PIE Framework content.

It provides [pie-player](src/components/pie-player/readme.md)

`<pie-player></pie-player>`

For rendering PIE content, and [pie-author](src/components/pie-player/readme.md)


`<pie-author></pie-author>`

For authoring content.

## Using these components

### Script tag


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

### Node Modules
- Run `npm install @pie-framework/pie-player-components --save`
- Put this `<script src='node_modules/@pie-framework/pie-player-components/dist/pie-player-components.js'></script>` in the head of your index.html
- Then you can use the element anywhere in your template, JSX, html etc

### VUE


#### 1: Add the component to the dependencies

```json
// package.json

"dependencies": {
  ...
  "@pie-framework/pie-player-components": "latest"
}
```

#### 2: Import the component(s)

```javascript
import { defineCustomElements } from '@pie-framework/pie-player-components/dist/loader';

defineCustomElements(window);
```

#### 3: Consume the component

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


### React

TODO



# TODO

Element Registry
This is not working yet. Goal is for these components to use a controller that maintains a registry of which custom elements are installed and only reach out to the bundle build service when it needs new one(s). 



- [ ] pie-loader should handle the possiblity of two versions of a PIE being loaded (will probably need build service update to include version in global key)
- [ ] handle re-setting of same player/author with a new config
