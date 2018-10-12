function _mix(s, p) {
  for (var key in p) {
    if (p.hasOwnProperty(key)) {
      s[key] = p[key]
    }
  }
}

var _={}
/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

_.bind = function (fn, ctx) {
  return function (a) {
    var l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
}


/**
 * htmlspecialchars
 */

_.htmlspecialchars = function(str) {

  if (!_.isString(str)) return str

  //str = str.replace(/&/g, '&amp;')
  str = str.replace(/</g, '&lt;')
  str = str.replace(/>/g, '&gt;')
  str = str.replace(/"/g, '&quot;')
  str = str.replace(/'/g, '&#039;')
  return str
}


/**
 * trim string
 */
_.trim=function(str){
  return str.replace(/(^\s*)|(\s*$)/g, '')
}


/**
 * make a array like obj to a true array
 * @param  {object} arg array like obj
 * @return {array}     array
 */
_.toArray = function(arg) {
  if (!arg || !arg.length) return []
  var array = []
  for (var i = 0,l=arg.length;i<l;i++) {
    array.push(arg[i])
  }

  return array
}


var toString = Object.prototype.toString


_.isArray = function(unknow) {
  return toString.call(unknow) === '[object Array]'
}


_.isPlainObject = function (obj) {
  return toString.call(obj) === '[object Object]'
}


_.isObject = function( unknow ) {
  return typeof unknow === "function" || ( typeof unknow === "object" && unknow != null )
}


_.isElement = function(unknow){
  return unknow && typeof unknow === 'object' && unknow.nodeType
}


_.isString = function(unknow){
  return (Object.prototype.toString.call(unknow) === '[object String]')
}


_.isNumber = function(unknow){
  return (Object.prototype.toString.call(unknow) === '[object Number]')
}


/**
 * Check and convert possible numeric strings to numbers
 * before setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

_.toNumber = function (value) {
  if (typeof value !== 'string') {
    return value
  } else {
    var parsed = Number(value)
    return isNaN(parsed)
      ? value
      : parsed
  }
}


/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

_.stripQuotes = function (str) {
  var a = str.charCodeAt(0)
  var b = str.charCodeAt(str.length - 1)
  return a === b && (a === 0x22 || a === 0x27)
    ? str.slice(1, -1)
    : str
}


_.each = function(enumerable, iterator) {

  if (_.isArray(enumerable)) {
    for (var i = 0, len = enumerable.length; i < len; i++) {
      iterator(enumerable[i], i)
    }
  } else if (_.isObject(enumerable)) {
    for (var key in enumerable) {
      iterator(enumerable[key], key)
    }
  }

}

_.hasKey = function(object,key){
  for (var _key in object) {
    if (object.hasOwnProperty(_key) && _key == key) return true
  }

  return false
}


_.inArray = function(array,item){

  var index = _.indexOf(array,item)

  if (index === -1) return false

  return true
}


/**
 * Mix properties into target object.
 *
 * @param {Object} target
 * @param {Object} from
 */
_.assign = function() {

  if (arguments.length < 2) return

  var args = _.toArray(arguments)
  var target = args.shift()

  var source
  while (source = args.shift()) {
    _mix(target, source)
  }

  return target
}


/**
 * find the index a value in array
 * @param  {array} array the array
 * @param  {string} key   key
 * @return {number}    index number
 */
_.indexOf = function(array,key){
  if (array === null) return -1
  var i = 0, length = array.length
  for (; i < length; i++) if (array[i] === key) return i
  return -1
}

_.findAndRemove = function(array,value){
  var index = _.indexOf(array,value)
  if (~index) {
    array.splice(index,1)
  }
}

_.findAndReplace = function(array,value,newValue){
  var index = _.indexOf(array,value)
  if (~index) {
    array.splice(index,1,newValue)
  }
}

_.findAndReplaceOrAdd = function(array,value,newValue){
  var index = _.indexOf(array,value)
  if (~index) {
    array.splice(index,1,newValue)
  }else{
    array.push(newValue)
  }
}


_.indexOfKey = function(arrayObject,key,value){
  if (arrayObject === null) return -1
  var i = 0, length = arrayObject.length
  for (; i < length; i++) if (arrayObject[i][key] === value) return i
  return -1
}



var _skipKeyFn = function(){
  return false
}

/**
 * deep clone
 * @param  {object} obj       ori obj need deep clone
 * @param  {function} skipKeyFn function to skip clone
 * @return {object}           result
 */
_.deepClone = function(obj,skipKeyFn) {

  skipKeyFn = skipKeyFn || _skipKeyFn

  if (_.isPlainObject(obj)) {
    var copy = {}
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && !skipKeyFn(key)) {
        copy[key] = _.deepClone(obj[key],skipKeyFn)
      }
    }
    return copy
  }

  if (_.isArray(obj)) {
    var copy = new Array(obj.length)
    for (var i = 0, l = obj.length; i < l; i++) {
      copy[i] = _.deepClone(obj[i],skipKeyFn)
    }
    return copy
  }

  return obj
}