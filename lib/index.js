var hue_re = "^((([rygb])(\\d*))(([rygb])(\\d*))?)"
var sva_re = "(-([sva])(100?|[\\d]{1,2}))"
var val_re = "^v(100?|[\\d]{1,2})(-a(100?|[\\d]{1,2}))?$"
var rygb_re = new RegExp(`${hue_re}${sva_re}?${sva_re}?${sva_re}?$`)
var pair_re = "^(?:r|y|g|b|ry|yr|yg|gy|gb|bg|br|rb)$"

function is_distinct (arr) {
  var distinct = arr.filter(function (value, idx, self) {
    return self.indexOf(value) === idx
  })
  return (distinct.length === arr.length)
}

function rm_und (arr) {
  return arr.filter(function(item){return item !== undefined})
}

function are_valid_svas (arr) {
  return (arr.every(function(n){return (n===undefined)})) || is_distinct(rm_und(arr))
}

function are_valid_hues (h1, h2) {
  return ((h1 || '')+(h2 || '').match(pair_re)) ? true : false
}

function select_keys (obj, keys) {
 return keys.reduce(function(acc, v){
   if(obj[v]){
     acc[v] = obj[v]
   }
   return acc
  },
  {})
}

function select_hue_keys (obj, keys) {
 return keys.reduce(function(acc, key){
    if(obj[key]=='') {
       acc[key] = 1
    }else if(obj[key]) {
       acc[key] = obj[key]
    }
   return acc
  },
  {})
}


function hv (h, hv) {
  return (h) ? /^\+?[1-9]\d*$/.test(hv) ? hv : 1 : undefined
}

function hue_arr (o) {
  var revs = {
    'rb': ['b', 'r'],
    'yr': ['r', 'y'],
    'gy': ['y', 'g'],
    'bg': ['g', 'b']
  }
  var ks = Object.keys(o)
  var [h1, _h2] = ( revs[ks.join('')] || ks)
  var h2 = (_h2 || h1)
  return [h1, o[h1], h2, o[h2]]
}

function hue_obj_to_angle (o) {
  var {r, b} = o
  var [h1, h1v, h2, h2v] = hue_arr(o)
  var red_pos = (r && b) ? 360 : 0
  var hue_pos = {r: red_pos, y: 60, g: 120, b: 240}
  var rel_pos = (1 - (h1v / (h1v + h2v)))
  var abs_diff = Math.abs(hue_pos[h1] - hue_pos[h2])
  var hue = Math.round(hue_pos[h1] + (rel_pos * abs_diff))
  return hue
}

/**
* Based on code by Michael Jackson (https://github.com/mjackson), culled from:
* (https: //gist.github.com/mjackson/5311256)
*/
function hsva_to_rgba (o) {
  var hue = o.h || 0
  var h = (hue_obj_to_angle(hue) / 360)
  var s = o.s || 1
  var v = o.v || 1
  var a = o.a || 1
  var i = (Math.floor (h * 6))
  var f = ((h * 6) - i)
  var p = (v * (1 - s))
  var q = (v * (1 - (f * s)))
  var t = (v * (1 - ((1 - f) * s)))
  var m = (Math.round (i % 6))
  var rgb = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]]
  return [rgb[m][0], rgb[m][1], rgb[m][2], a]
}

// Change the name of this to grayscale_rygb
// Change name of dec_tup key to "rgba"
function grayscale_rgba (value, alpha) {
  var v = value / 100
  var a = (!!alpha || (alpha === 0)) ? (parseInt(alpha) * 0.01) : 1
  return {
    dec_tup: [v, v, v, a],
    json: {v: v, a: a}
  }
}

// Maybe break this down
function rygb_obj_to_string(v) {
  try {
    var prop_names = Object.getOwnPropertyNames(v)
    var contains_hue_or_value = prop_names.some(function (k) {
      return (k === 'h' || k === 'v')
    })
    if (contains_hue_or_value) {
      var hsva_array = (
        prop_names.reduce(function (acc, k) {
          var result
          if (k === 'h') {
            try {
              var hue_obj = v.h
              var hue_keys = Object.getOwnPropertyNames(hue_obj)
              result = hue_keys.reduce(function (acc, hk) {
                var hue_value = (hue_obj[hk] === 1) ? '' : hue_obj[hk]
                return `${acc}${hk}${hue_value}`
              }, "")
            } catch (e) {}
          } else {
            result = `${k}${Math.round(v[k] * 100)}`
          }
          acc.push(result)
          return acc
        }, [])
      )
      return hsva_array.join("-")
    }
  } catch (e) {}
}

/**
* Receives an kw-args style array of hue(rygb), saturation, value, and alpha values.
* hsva_obj('r', 1, 'y', 1, 's', '33', 'v', '20') -> {h: {r:2, y:1}, s: 0.33, v: 0.2}
*/
function hsva_obj (kw_args) {
 var kv_obj = kw_args.reduce(function (acc, v, idx, arr) {
   if (idx % 2 === 0) {
     var _nv = arr[idx + 1]
     var nv = (typeof _nv === 'undefined') ? _nv : parseInt(_nv)
     acc[v] = nv;
   }
   return acc
 }, {})
 var _hue = select_hue_keys(kv_obj, ["r", "y", "g", "b"])
 var _hue_ks = Object.keys(_hue)
 var isRb = (_hue_ks[0] === 'r' && _hue_ks[1] === 'b')
 var hue = isRb ? {b: _hue["b"], r: _hue["r"]} : _hue
 var _sva = select_keys(kv_obj, ["s", "v", "a"])
 var sva = Object.keys(_sva).reduce(function (acc, v) {
   acc[v] = _sva[v] / 100; return acc
 }, {})
 var _obj = {h: hue, s: sva.s, v: sva.v, a: sva.a}
 var obj = ["h", "s", "v", "a"].reduce(function (acc, k) {
    if (_obj[k] !== undefined) {
      acc[k] = _obj[k]
    }
    return acc
 }, {})
 return obj
}

// change name of this to gel with grayscale thing
function rygbsva (s) {
  var m = s.match(rygb_re)
  if (m){
    var h1 = m[3]
    var _h1v = m[4]
    var h1v = hv(h1, _h1v)
    var h2 = m[6]
    var _h2v = m[7]
    var h2v = hv(h2, _h2v)
    var x1 = m[9]
    var x1v = m[10]
    var x2 = m[12]
    var x2v = m[13]
    var x3 = m[15]
    var x3v = m[16]
    if (are_valid_hues(h1, h2) && are_valid_svas([x1, x2, x3])){
      var args = rm_und([h1, h1v, h2, h2v, x1, x1v, x2, x2v, x3, x3v])
      var rygbsva_json = hsva_obj(args)
      return {data: rygbsva_json, string: rygb_obj_to_string(rygbsva_json)}
    }
  }
}

// You don't need to pass data in?
function rygb_json (v) {
  var value_type = typeof v
  if (value_type === 'string') {
    var m = v.match(val_re)
    if (m){
      var val = m[1]
      var alpha = m[3]
      var obj = grayscale_rgba(val, alpha)
      return {string:  v,
              data: obj.json,
              rgba: obj.dec_tup}
    }else{
      return rygbsva(v)
    }
  }else if (value_type === 'object') {
    try {
      var s = rygb_obj_to_string(v)
      return rygb_json(s)
    } catch(e) {
    }
  }
}

function to_bytes (decimal) {
  return (Math.round(decimal * 255))
}

function rgb_a (obj, is_rgba) {
  var arr = obj.rgba || hsva_to_rgba(obj.data)
  return is_rgba ? arr : arr.slice(0,3)
}

function c_to_hex (c) {
  var hex = c.toString(16)
  return hex.length == 1 ? "0" + hex : hex
}


function _hex (obj, is_rgba) {
  return function () {
    var arr = rgb_a(obj, is_rgba)
    var byte_arr = arr.map(to_bytes)
    var hex_arr = byte_arr.map(function(c){return c_to_hex(c)})
    return "#" + hex_arr.join('')
  }
}

function _rgb_a (obj, is_rgba) {
  return function () {
    var arr = rgb_a(obj, is_rgba)
    return {
      dec: function () { return arr },
      bit: function () { return arr.map(to_bytes) },
      css: function () {
        var f = is_rgba ? 'rgba' : 'rgb'
        var byte_arr = arr.slice(0, 3).map(to_bytes)
        if (is_rgba) {
          byte_arr.push(arr[3])
        }
        return f + '(' + byte_arr.join(', ') + ')'
      }
    }
  }
}

function _argb (obj) {
  return function () {
    var _arr = rgb_a(obj, true)
    var arr = [_arr[3]].concat(_arr.slice(0,3))
    return {
      dec: function () { return arr },
      bit: function () { return arr.map(to_bytes) },
    }
  }
}


function _int24 (obj) {
  return function () {
    var arr = rgb_a(obj).map(to_bytes)
    return  arr[0] << 16 | arr[1] <<  8 | arr[2]
  }
}

function _json (obj) {
  return function () {
    try{
      return obj.data
    }catch(e){
    }
  }
}

function _string (obj) {
  return function () {
    try{
      return obj.string
    }catch(e){
    }
  }
}

function rygb (arg) {
  var obj = rygb_json(arg) || {}
  if (obj) {
    return {
      json: _json(obj),
      string: _string(obj),
      hex:  _hex(obj),
      hexa:  _hex(obj, true),
      int24:  _int24(obj, "rgb"),
      argb: _argb(obj),
      rgba: _rgb_a(obj, true),
      rgb: _rgb_a(obj)
    }
  }
}
rygb('v50-a33').int24()/*?*/
module.exports = rygb
