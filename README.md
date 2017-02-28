# pri.preloader

## Example usage

```javascript
this.preloader = new ImagePreloader();
this.preloader.setMaxConnections(5);
this.preloader.loadManifest('assets.json');
this.preloader.on('progress', () => {});
this.preloader.on('complete', () => {});
```
