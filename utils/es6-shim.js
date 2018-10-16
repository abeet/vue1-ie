/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/templates/returnExports.js
;(function (root, factory) {
  'use strict'
  /* global define, exports, module */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory)
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory()
  } else {
    // Browser globals (root is window)
    root.returnExports = factory()
  }
})(this, function () {
  var isIE8 = window.ActiveXObject && (!window.performance || !window.performance.navigation.TYPE_RESERVED)
  if (typeof Object.freeze !== 'function') {
    Object.freeze = function (obj) {
      return obj
    }
  }
  if (typeof Object.isExtensible !== 'function') {
    Object.isExtensible = function (obj) {
      return true
    }
  }
  if (typeof Object.create !== 'function') {
    Object.create = function (a) {
      var f = function () {}
      if (a) {
        if (!a.toString || !a.valueOf) {
          // 如果是VBScript对象，没有valueOf方法或toString方法，则要一个个复制子对象到原型链上
          for (var k in a) {
            if (typeof a[k] !== 'unknown') {
              f.prototype[k] = a[k]
            }
          }
        } else {
          f.prototype = a
        }
      }
      return new f()
    }
  }
  if (typeof Object.getOwnPropertyNames !== 'function') {
    Object.getOwnPropertyNames = function getOwnPropertyNames (o) {
      var result = []

      for (var prop in o) {
        if (o.hasOwnProperty(prop)) {
          result.push(prop)
        }
      }
      return result
    }
  }
  if (typeof Object.assign !== 'function') {
    Object.assign = function (target, firstSource) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }
    
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
    
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          try{
            // IE8下Object.getOwnPropertyDescriptor报错
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }catch(e){
            to[nextKey] = nextSource[nextKey];
          }
       }
      }
      return to;
    }
  }
  /* if (typeof Object.getOwnPropertyDescriptor !== 'function') {
    function isPrimitive (val) {
      if (typeof val === 'object') {
        return val === null
      }
      return typeof val !== 'function'
    }

    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor (object, property) {
      var descriptor

      // If object has a property then it's for sure `configurable`, and
      // probably `enumerable`. Detect enumerability though.
      descriptor = {
        configurable: isPrimitive(object) === false && typeof object !== 'string',
        enumerable: obj.propertyIsEnumerable(propKey)
      }

      // If we got this far we know that object has an own property that is
      // not an accessor so we set it as a value and return descriptor.
      if (typeof object === 'string') {
        descriptor.value = obj.charAt(propKey)
        descriptor.writable = false
      } else {
        descriptor.value = obj[propKey]
        descriptor.writable = true
      }

      return descriptor
    }
  } */
  /* if (typeof Object.defineProperties !== 'function') {
    var origDefineProperty = Object.defineProperty

    var arePropertyDescriptorsSupported = function () {
      var obj = {}
      try {
        origDefineProperty(obj, 'x', { enumerable: false, value: obj })
        for (var _ in obj) {
          return false
        }
        return obj.x === obj
      } catch (e) {
        // this is IE 8.
        return false
      }
    }
    var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported()

    if (!supportsDescriptors) {
      Object.defineProperty = function (a, b, c) {
        // IE8支持修改元素节点的属性
        if (origDefineProperty && a.nodeType == 1) {
          return origDefineProperty(a, b, c)
        } else {
          a[b] = c.value || (c.get && c.get())
        }
      }
    }

    function convertToDescriptor (desc) {
      function hasProperty (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
      }

      function isCallable (v) {
        // NB: modify as necessary if other values than functions are callable.
        return typeof v === 'function'
      }

      if (typeof desc !== 'object' || desc === null) {
        throw new TypeError('bad desc')
      }

      var d = {}

      if (hasProperty(desc, 'enumerable')) {
        d.enumerable = !!desc.enumerable
      }
      if (hasProperty(desc, 'configurable')) {
        d.configurable = !!desc.configurable
      }
      if (hasProperty(desc, 'value')) {
        d.value = desc.value
      }
      if (hasProperty(desc, 'writable')) {
        d.writable = !!desc.writable
      }
      if (hasProperty(desc, 'get')) {
        var g = desc.get

        if (!isCallable(g) && g !== 'undefined') {
          throw new TypeError('bad get')
        }
        d.get = g
      }
      if (hasProperty(desc, 'set')) {
        var s = desc.set
        if (!isCallable(s) && s !== 'undefined') {
          throw new TypeError('bad set')
        }
        d.set = s
      }

      if (('get' in d || 'set' in d) && ('value' in d || 'writable' in d)) {
        throw new TypeError('identity-confused descriptor')
      }

      return d
    }

    Object.defineProperties = function defineProperties (obj, properties) {
      if (typeof obj !== 'object' || obj === null) {
        throw new TypeError('object required')
      }

      properties = Object(properties)

      var keys = Object.keys(properties)
      var descs = []

      for (var i = 0; i < keys.length; i++) {
        descs.push([keys[i], convertToDescriptor(properties[keys[i]])])
      }

      for (i = 0; i < descs.length; i++) {
        Object.defineProperty(obj, descs[i][0], descs[i][1])
      }

      return obj
    }
  }
 */
  if (!Element.prototype.addEventListener) {
    // 兼容IE8下无法使用addEventListener的问题
    HTMLDocument.prototype.addEventListener = Element.prototype.addEventListener = Window.prototype.addEventListener = function (
      type,
      ffun,
      capture,
      scope
    ) {
      var modtypeForIE = 'on' + type
      if (capture) {
        throw new Error('This implementation of addEventListener does not support the capture phase')
      }

      if (typeof ffun === 'function') {
        var nodeWithListener = this
        this.events = this.events ? this.events : []
        for (var i = 0; i < this.events.length; i++) {
          var item = this.events[i]
          if (item[0] == modtypeForIE && item[1] == ffun) {
            return
          }
        }
        var fun = function (e) {
          // Add some extensions directly to 'e' (the actual event instance)
          // Create the 'currentTarget' property (read-only)
          Object.defineProperty(e, 'currentTarget', {
            get: function () {
              // 'nodeWithListener' as defined at the time the listener was added.
              return nodeWithListener
            }
          })
          // Create the 'eventPhase' property (read-only)
          Object.defineProperty(e, 'eventPhase', {
            get: function () {
              return e.srcElement == nodeWithListener ? 2 : 3
              // "AT_TARGET" = 2, "BUBBLING_PHASE" = 3
            }
          })
          // Create a 'timeStamp' (a read-only Date object)
          var time = new Date() // The current time when this anonymous function is called.
          Object.defineProperty(e, 'timeStamp', {
            get: function () {
              return time
            }
          })

          typeof ffun === 'function' && ffun.call(scope || nodeWithListener, e) // Re-bases 'this' to be correct for the fun.
        }
        this.events.push([modtypeForIE, ffun, fun])
        //                  console.log('addEventListener', modtypeForIE);
        this.attachEvent(modtypeForIE, fun)
      }
    }
    // 兼容IE8下无法使用removeEventListener的问题
    HTMLDocument.prototype.removeEventListener = Element.prototype.removeEventListener = Window.prototype.removeEventListener = function (
      type,
      ffun,
      capture
    ) {
      var modtypeForIE = 'on' + type
      if (capture) {
        throw new Error('This implementation of removeEventListener does not support the capture phase')
      }
      if (typeof ffun === 'function') {
        var fun = null
        this.events = this.events ? this.events : []
        for (var i = 0; i < this.events.length; i++) {
          var item = this.events[i]
          if (item[0] == modtypeForIE && item[1] == ffun) {
            fun = item[2]
            this.events.splice(i, 1)
            break
          }
        }
        if (!fun) return
        //                  console.log('removeEventListener', modtypeForIE);
        this.detachEvent(modtypeForIE, fun)
      }
    }

    // Extend Event.prototype with a few of the W3C standard APIs on Event
    // Add 'target' object (read-only)
    Object.defineProperty(Event.prototype, 'target', {
      get: function () {
        return this.srcElement
      }
    })
    // Add 'stopPropagation' and 'preventDefault' methods
    Event.prototype.stopPropagation = function () {
      this.cancelBubble = true
    }
    Event.prototype.preventDefault = function () {
      this.returnValue = false
    }
  }
})
