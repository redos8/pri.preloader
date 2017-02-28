'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ImagePreloader v0.2
 * Fast image loader with queue
 * @author Yuriy Petrov (theredos7@gmail.com)
 */

var ImagePreloader = function () {
  function ImagePreloader() {
    var images = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ImagePreloader);

    this.images = images || [];
    this.baseUrl = options.baseUrl || '';

    this.hotQueue = [];
    this.queue = images || [];
    this.complete = false;
    this.progress = 0;
    this.maxConnections = options.maxConnections || 5;
    this.events = { fileload: function fileload() {}, complete: function complete() {}, progress: function progress() {} };
    this._debug = false;

    this._$wrapper = $('<div class="_preload-wrapper">');
    this._$wrapper.css({ position: 'absolute', left: -2000, top: -2000, zIndex: -1, width: 1, height: 1, overflow: 'hidden' });
    $('body').append(this._$wrapper);

    // this.load();
  }

  _createClass(ImagePreloader, [{
    key: 'setMaxConnections',
    value: function setMaxConnections(connections) {
      this.maxConnections = connections || 5;
    }
  }, {
    key: 'load',
    value: function load() {
      if (!this.queue.length) {
        if (!this.hotQueue.length) {
          // this._$wrapper.empty();
          this.complete = true;
          this.events.complete();
          return this._debug && console.warn('Everything loaded!');
        }
        return this._debug && console.warn('Nothing to load!');
      }
      for (var i = this.hotQueue.length; i < this.maxConnections; i++) {
        this.hotQueue.push(this.preloadImage(this.queue.shift()));
      }
    }
  }, {
    key: 'loadManifest',
    value: function loadManifest(url) {
      var _this = this;

      $.ajax({
        url: url,
        dataType: 'json',
        success: function success(data) {
          console.log(data);
          _this.images = data.manifest.slice(0);
          _this.queue = data.manifest.slice(0);
          _this.baseUrl = data.path;
          _this.load();
        }
      });
    }
  }, {
    key: 'on',
    value: function on(event, cb) {
      this.events[event] = cb;
    }
  }, {
    key: 'preloadImage',
    value: function preloadImage(image) {
      var _this2 = this;

      var img = new Image();
      img.src = this.baseUrl + image;

      img.onload = function () {
        _this2.progress = 1 - (_this2.queue.length + _this2.hotQueue.length) / _this2.images.length;
        _this2.events.fileload({ item: { id: _this2.baseUrl + image, filename: image } });
        _this2.events.progress({ progress: Math.ceil(_this2.progress * 100) / 100 });
        _this2.hotQueue.splice(_this2.hotQueue.indexOf(image), 1);
        _this2.load();
      };
      img.onerror = function () {
        _this2.progress = 1 - (_this2.queue.length + _this2.hotQueue.length) / _this2.images.length;
        _this2.events.progress({ progress: Math.ceil(_this2.progress * 100) / 100 });

        _this2.hotQueue.splice(_this2.hotQueue.indexOf(image), 1);
        _this2.load();
      };
      this._$wrapper.append(img);
      return img;
    }
  }]);

  return ImagePreloader;
}();

exports.default = ImagePreloader;
