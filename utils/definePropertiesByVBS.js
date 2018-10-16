;(function () {
  var canHideProperty = true
  // 如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
  try {
    Object.defineProperty({}, '_', {
      value: 'x'
    })
  } catch (e) {
    canHideProperty = false
  }

  if (canHideProperty || !window.VBArray) {
    Object.definePropertiesByVBS = function (obj) {
      return obj
    }
    return
  }
  window.execScript(['Function parseVB(code)', '\tExecuteGlobal(code)', 'End Function'].join('\r\n'), 'VBScript')

  var originDefineProperty = Object.defineProperty

  Object.defineProperty = function (obj, prop, desc) {
    if (obj.getAttribute && obj.setAttribute && obj.removeAttribute) {
      return originDefineProperty(obj, prop, desc)
    }
    obj[prop] = desc.value || (desc.get && desc.get())

    if((!obj.toString || !obj.valueOf) && obj.__cb_poll){
      if(desc.get){
        obj.__cb_poll[prop+'_get']=desc.get
      }
      if(desc.set){
        obj.__cb_poll[prop+'_set']=desc.set
      }
    }else{
      if (!obj.__defindeProperties__) {
        obj.__defindeProperties__ = {}
      }
      obj.__defindeProperties__[prop] = desc
    }
   return obj
  }
  Object.defineProperties = function (obj, descs) {
    var keys = Object.keys(descs)
    for (i = 0; i < keys.length; i++) {
      Object.defineProperty(obj, keys[i], descs[keys[i]])
    }
    return obj
  }

  var VB_ID = 0

  var hasSpecialKey = function (key) {
    return _.indexOf(['__ori__', '__inject__', '__opts__'], key) != -1
  }

  var defineGetProxy = function (obs, _key) {
    var ob = obs[_key]

    return function () {
      return ob.val
    }
  }

  var defineSetProxy = function (obs, _key) {
    var ob = obs[_key]

    return function (newVal) {
      if (newVal === ob.val) {
        return
      }
      ob.val = newVal
    }
  }

  Object.definePropertiesByVBS = function (obj) {
    if (!obj.__defindeProperties__) {
      return
    }
    var buffer = [], className, command = [], cb_poll = {}, re
    var attrs = {}
    var obs = {}
    var skip = [] // 不需要setter的，直接指过去

    function defineSet (key, callback) {
      cb_poll[key + '_set'] = callback
      buffer.push(
        '\tPublic Property Let [' + key + '](value)',
        '\t\tCall [__proxy](me, "set", "' + key + '", value)',
        '\tEnd Property',
        '\tPublic Property Set [' + key + '](value)',
        '\t\tCall [__proxy](me, "set", "' + key + '", value)',
        '\tEnd Property'
      )
    }

    function defineGet (key, callback) {
      cb_poll[key + '_get'] = callback
      buffer.push(
        '\tPublic Property Get [' + key + ']',
        '\tOn Error Resume Next', // 必须优先使用set语句,否则它会误将数组当字符串返回
        '\t\tSet [' + key + '] = [__proxy](me, "get", "' + key + '")',
        '\tIf Err.Number <> 0 Then',
        '\t\t[' + key + '] = [__proxy](me, "get", "' + key + '")',
        '\tEnd If',
        '\tOn Error Goto 0',
        '\tEnd Property'
      )
    }

    function proxy (me, type, key, value) {
      if (type == 'get') {
        return cb_poll[key + '_get'].apply(re, [value])
      } else {
        cb_poll[key + '_set'].apply(re, [value])
      }
    }
    var uniq = {}

    for (var key in obj.__defindeProperties__) {
      if (!obj.__defindeProperties__.hasOwnProperty(key)) continue
      var desc = obj.__defindeProperties__[key]
      uniq[key] = true
      attrs[key] = desc
    }
    for (var key in attrs) {
      if (!attrs.hasOwnProperty(key) || hasSpecialKey(key)) continue
      if (attrs[key]['set'] || attrs[key]['get']) {
        if (attrs[key]['set']) {
          defineSet(key, attrs[key]['set'])
        }
        if (attrs[key]['get']) {
          defineGet(key, attrs[key]['get'])
        }
      }
    }

    buffer.push('\tPublic [' + '__opts__' + ']')
    buffer.push('\tPublic [' + '__ori__' + ']')
    buffer.push('\tPublic [' + '__inject__' + ']')

    buffer.unshift(
      '\r\n\tPrivate [__proxy]',
      '\tPublic [__cb_poll]',
      '\tPublic Default Function [self](proxy, cb_poll)',
      '\t\tSet [__proxy] = proxy',
      '\t\tSet [__cb_poll] = cb_poll',
      '\t\tSet [self] = me',
      '\tEnd Function'
    )
    for (var key in obj) {
      if (uniq[key] || (obj.hasOwnProperty && !obj.hasOwnProperty(key)) || hasSpecialKey(key)) continue
      uniq[key] = true
      skip.push(key)
      buffer.push('\tPublic [' + key + ']')
    }
    buffer.push('End Class')

    buffer = buffer.join('\r\n')

    className = 'VB' + VB_ID++

    command.push('Class ' + className + buffer)
    command.push(
      ['Function ' + className + 'F(proxy, cb_poll)', '\tSet ' + className + 'F = (New ' + className + ')(proxy,cb_poll)', 'End Function'].join('\r\n')
    )

    command = command.join('\r\n')

    window['parseVB'](command)

    re = window[className + 'F'](proxy, cb_poll)

    skip.forEach(function (name) {
      if (typeof obj[name] === 'function') {
        obj[name]._scope = re
        re[name] = obj[name].bind(re)
      } else {
        re[name] = obj[name]
      }
    })
    re.__ori__ = obj
    re.__inject__ = true

    return re
  }
  Object.VBVueFactory = function (options, compDefi) {
    if (!compDefi) {
      throw new Error('Object.VBVueFactory方法没有传入参数compDefi')
    }
    var buffer = [], className, command = [], cb_poll = {}, re
    var attrs = {}
    var obs = {}
    var methods = [] // 不需要setter的，直接指过去
    var vueProto = [] // 不需要setter的，直接指过去

    function defineSet (key, callback) {
      cb_poll[key + '_set'] = callback
      buffer.push(
        '\tPublic Property Let [' + key + '](value)',
        '\t\tCall [__proxy](me, "set", "' + key + '", value)',
        '\tEnd Property',
        '\tPublic Property Set [' + key + '](value)',
        '\t\tCall [__proxy](me, "set", "' + key + '", value)',
        '\tEnd Property'
      )
    }

    function defineGet (key, callback) {
      cb_poll[key + '_get'] = callback
      buffer.push(
        '\tPublic Property Get [' + key + ']',
        '\tOn Error Resume Next', // 必须优先使用set语句,否则它会误将数组当字符串返回
        '\t\tSet [' + key + '] = [__proxy](me, "get", "' + key + '")',
        '\tIf Err.Number <> 0 Then',
        '\t\t[' + key + '] = [__proxy](me, "get", "' + key + '")',
        '\tEnd If',
        '\tOn Error Goto 0',
        '\tEnd Property'
      )
    }

    function proxy (me, type, key, value) {
      if (type == 'get') {
        return cb_poll[key + '_get'].apply(re, [value])
      } else {
        cb_poll[key + '_set'].apply(re, [value])
      }
    }

    buffer.unshift(
      '\r\n\tPrivate [__proxy]',
      '\tPublic [__cb_poll]',
      '\tPublic Default Function [self](proxy, cb_poll)',
      '\t\tSet [__proxy] = proxy',
      '\t\tSet [__cb_poll] = cb_poll',
      '\t\tSet [self] = me',
      '\tEnd Function'
    )

    var uniq = {}
    var opts = options || {}
    var opts_props = []
    var opts_data = []
    var opts_computed = []
    var opts_methods = []
    var opts_methods_obj = {}
    
    if(opts.props && Object.prototype.toString.call(opts_props)==='[object Array]'){
      opts_props=opts.props
    }else if(opts.props && typeof opts.props === 'object'){
      opts_props = Object.keys(opts.props)
    }

    if(opts.data && typeof opts.data === 'function'){
      opts_data = opts.data.call(compDefi)
      opts_data = Object.keys(opts_data)
    }else if(opts.data && typeof opts.data === 'object'){
      opts_data = Object.keys(opts.data)
    }

    if(opts.computed){
      opts_computed = Object.keys(opts.computed)
    }

    if(opts.methods){
      opts_methods = Object.keys(opts.methods)
      opts_methods_obj = Object.assign({}, opts.methods)
    }
    
    if(opts.mixins && opts.mixins.length){
      for(var i=0;i<opts.mixins.length;i++){
        var mixProps = [];
        if(opts.mixins[i].props && Object.prototype.toString.call(opts.mixins[i].props)==='[object Array]'){
          mixProps = opts.mixins[i].props
        }else if(opts.mixins[i].props && typeof opts.mixins[i].props === 'object'){
          mixProps = Object.keys(opts.mixins[i].props)
        }
        if(mixProps.length){
          opts_props = opts_props.concat(mixProps)
        }

        var mixData = opts.mixins[i].data
        if(opts.mixins[i].data && typeof mixData === 'function'){
          mixData = mixData.call(compDefi)
        }
        if(mixData){
          mixData = Object.keys(mixData)
          opts_data = opts_data.concat(mixData)
        }

        var mixComputed = opts.mixins[i].computed
        if(mixComputed){
          mixComputed = Object.keys(mixComputed)
          opts_computed = opts_computed.concat(mixComputed)
        }
        var mixMethods = opts.mixins[i].methods
        if(mixMethods){
          opts_methods_obj = Object.assign({},mixMethods,opts_methods_obj)
          mixMethods = Object.keys(mixMethods)
          opts_methods = opts_methods.concat(mixMethods)
        }

      }
    }
    if(compDefi.options){
      for(var key in compDefi.options){
      if (!compDefi.options.hasOwnProperty(key)) continue
        if(opts[key] === undefined){
          opts[key] = compDefi.options[key]
        }
      }
    }
    for (var i=0;i<opts_props.length;i++) {
      var key = opts_props[i]
      if (hasSpecialKey(key)) continue
      uniq[key] = true
      attrs[key] = {
        // 暂时设置为空，最后应该由vue设置为setter/getter方法
        set: function(){},
        get: function(){}
      }
    }

    for (var i=0;i<opts_data.length;i++) {
      var key = opts_data[i]
      if (hasSpecialKey(key)) continue
      uniq[key] = true
      attrs[key] = {
        // 暂时设置为空，最后应该由vue设置为setter/getter方法
        set: function(){},
        get: function(){}
      }
    }
    for (var i=0;i<opts_computed.length;i++) {
      var key = opts_computed[i]
      if (hasSpecialKey(key)) continue
      uniq[key] = true
      attrs[key] = {
        // 暂时设置为空，最后应该由vue设置为setter/getter方法
        set: function(){},
        get: function(){}
      }
    }

    for (var key in attrs) {
      if (!attrs.hasOwnProperty(key)) continue
      if (attrs[key]['set'] || attrs[key]['get']) {
        if (attrs[key]['set']) {
          defineSet(key, attrs[key]['set'])
        }
        if (attrs[key]['get']) {
          defineGet(key, attrs[key]['get'])
        }
      }
    }

    for (var i=0;i<opts_methods.length;i++) {
      var key = opts_methods[i]      
      if (uniq[key] || hasSpecialKey(key)) continue
      uniq[key] = true
      methods.push(key)
      buffer.push('\tPublic [' + key + ']')
    }

    var vueInst = new compDefi()
    for (var key in vueInst) {
      if (uniq[key] || hasSpecialKey(key) || typeof vueInst[key] === 'function') continue
      uniq[key] = true
      buffer.push('\tPublic [' + key + ']')
    }

    for (var key in compDefi.prototype) {
      if (uniq[key] || hasSpecialKey(key)) continue
      uniq[key] = true
      vueProto.push(key)
      buffer.push('\tPublic [' + key + ']')
    }

    buffer.push('\tPublic [' + 'constructor' + ']')

    buffer.push('\tPublic [' + '_inactive' + ']')
    buffer.push('\tPublic [' + '_props' + ']')

    buffer.push('\tPublic [' + '__opts__' + ']')
    buffer.push('\tPublic [' + '__ori__' + ']')
    buffer.push('\tPublic [' + '__inject__' + ']')

    buffer.push('End Class')

    buffer = buffer.join('\r\n')

    className = 'VB' + VB_ID++

    command.push('Class ' + className + buffer)
    command.push(
      ['Function ' + className + 'F(proxy, cb_poll)', '\tSet ' + className + 'F = (New ' + className + ')(proxy, cb_poll)', 'End Function'].join('\r\n')
    )

    command = command.join('\r\n')

    window['parseVB'](command)

    re = window[className + 'F'](proxy, cb_poll)

    methods.forEach(function (name) {
      re[name] = opts_methods_obj[name].bind(re)
    })
    vueProto.forEach(function (name) {
      if (typeof compDefi.prototype[name] === 'function') {
        re[name] = compDefi.prototype[name].bind(re)
      } else {
        re[name] = compDefi.prototype[name]
      }
    })
    re.constructor = compDefi
    re.__ori__ = compDefi
    re.__opts__ = opts
    re.__inject__ = true

    return re
  }
})()
