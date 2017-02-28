/**
 * ImagePreloader v0.2
 * Fast image loader with queue
 * @author Yuriy Petrov (theredos7@gmail.com)
 */

class ImagePreloader {
  constructor(images = [], options = {}) {
    this.images = images || [];
    this.baseUrl = options.baseUrl || '';

    this.hotQueue = [];
    this.queue = images || [];
    this.complete = false;
    this.progress = 0;
    this.maxConnections = options.maxConnections || 5;
    this.events = {fileload: () => {}, complete: () => {}, progress: () => {}};
    this._debug = false;

    this._$wrapper = $('<div class="_preload-wrapper">');
    this._$wrapper.css({position: 'absolute', left: -2000, top: -2000, zIndex: -1, width: 1, height: 1, overflow: 'hidden'});
    $('body').append(this._$wrapper);

    // this.load();
  }

  setMaxConnections(connections) {
    this.maxConnections = connections || 5;
  }

  load() {
    if(!this.queue.length) {
      if(!this.hotQueue.length) {
        // this._$wrapper.empty();
        this.complete = true;
        this.events.complete();
        return this._debug && console.warn('Everything loaded!');
      }
      return this._debug && console.warn('Nothing to load!');
    }
    for(let i = this.hotQueue.length; i < this.maxConnections; i++) {
      this.hotQueue.push(this.preloadImage(this.queue.shift()));
    }
  }

  loadManifest(url) {
    $.ajax({
      url: url,
      dataType: 'json',
      success: (data) => {
        console.log(data);
        this.images = data.manifest.slice(0);
        this.queue = data.manifest.slice(0);
        this.baseUrl = data.path;
        this.load();
      }
    })
  }

  on(event, cb) {
    this.events[event] = cb;
  }

  preloadImage(image) {
    let img = new Image();
    img.src = this.baseUrl + image;

    img.onload = () => {
      this.progress = 1 - ((this.queue.length + this.hotQueue.length) / this.images.length);
      this.events.fileload({item: {id: this.baseUrl + image, filename: image}});
      this.events.progress({progress: Math.ceil(this.progress * 100) / 100});
      this.hotQueue.splice(this.hotQueue.indexOf(image), 1);
      this.load();
    };
    img.onerror = () => {
      this.progress = 1 - ((this.queue.length + this.hotQueue.length) / this.images.length);
      this.events.progress({progress: Math.ceil(this.progress * 100) / 100});

      this.hotQueue.splice(this.hotQueue.indexOf(image), 1);
      this.load();
    };
    this._$wrapper.append(img);
    return img;
  }
}
