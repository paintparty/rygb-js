const hue_re = "^((([rygb])(\\d*))(([rygb])(\\d*))?)"
const sva_re = "(-([sva])(100?|[\\d]{1,2}))"
const val_re = "^v(100?|[\\d]{1,2})(-a(100?|[\\d]{1,2}))?$"
const rygb_re = new RegExp(`${hue_re}${sva_re}?${sva_re}?${sva_re}?$`)
const pair_re = "^(?:r|y|g|b|ry|yr|yg|gy|gb|bg|br|rb)$"

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

function hsva_obj (...args) {
 var argz = rm_und(args)
 ,   _vals = argz.slice(1).filter(function (v, idx) {return (idx % 2 === 0)})
 ,   vals = (_vals).map(function (v) {return (typeof v === 'undefined') ? v : parseInt(v)})
 ,   keys = argz.filter(function (v, idx) { return (idx % 2 === 0) })
 ,   all = keys.reduce(function (acc, k, idx) { acc[k] = vals[idx]; return acc}, {})
 ,   hue = select_hue_keys(all, ["r", "y", "g", "b"])
 ,   _sva = select_keys(all, ["s", "v", "a"])
 ,   sva = Object.keys(_sva).reduce(function (acc, v) {acc[v] = _sva[v] / 100; return acc}, {})
 ,   _ret = {h: hue, s: sva.s, v: sva.v, a: sva.a}
 ,   ret = Object.keys(_ret).reduce(function (acc, k) {
       if (_ret[k]!==undefined) {
         acc[k] = _ret[k]
       }
       return acc
     }, {})
 return ret
}

function hv (h, hv) {
  return (h) ? /^\+?[1-9]\d*$/.test(hv) ? hv : 1 : undefined
}

function hue_arr (o) {
  let revs = {
    'rb': ['b', 'r'],
    'yr': ['r', 'y'],
    'gy': ['y', 'g'],
    'bg': ['g', 'b']
  }
  ,   ks = Object.keys(o)
  ,   [h1, _h2] = ( revs[ks.join('')] || ks)
  ,   h2 = (_h2 || h1)
  return [h1, o[h1], h2, o[h2]]
}

function hue_obj_to_angle (o) {
  var {r, b} = o
  ,   [h1, h1v, h2, h2v] = hue_arr(o)
  ,   red_pos = (r && b) ? 360 : 0
  ,   hue_pos = {r: red_pos, y: 60, g: 120, b: 240}
  ,   rel_pos = (1 - (h1v / (h1v + h2v)))
  ,   abs_diff = Math.abs(hue_pos[h1] - hue_pos[h2])
  ,   hue = Math.round(hue_pos[h1] + (rel_pos * abs_diff))
  return hue
}

function hsva_to_rgba ({h: hue = 0, s: sat = 1, v: val = 1, a: alpha = 1}) {
  let h = (hue_obj_to_angle(hue) / 360)
  ,   s = sat
  ,   v = val
  ,   i = (Math.floor (h * 6))
  ,   f = ((h * 6) - i)
  ,   p = (v * (1 - s))
  ,   q = (v * (1 - (f * s)))
  ,   t = (v * (1 - ((1 - f) * s)))
  ,   m = (Math.round (i % 6))
  ,   rgb = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]]
  return [rgb[m][0], rgb[m][1], rgb[m][2], alpha]
}

function rygb_obj_to_string(v) {
  try {
    let prop_names = Object.getOwnPropertyNames(v)
    var contains_hue_or_value = prop_names.some(function (k) {
      return (k === 'h' || k === 'v')
    })
    if (contains_hue_or_value) {
      var hsva_array = (
        prop_names.reduce(function (acc, k) {
          var result
          if (k === 'h') {
            try {
              var hueObj = v.h
              var hueKeys = Object.getOwnPropertyNames(hueObj)
              result = hueKeys.reduce(function (acc, hk) {
                var hue_value = (hueObj[hk] === 1) ? '' : hueObj[hk]
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

function va_to_rgba (value, alpha) {
  var v = value / 100
  var a = (!!alpha || (alpha === 0)) ? (parseInt(alpha) * 0.01) : 1
  return {
    decimalArray: [v, v, v, a],
    json: {v: v, a: a}
  }
}

function rygbsva (s) {
  var matches = s.match(rygb_re)
  if (matches){
    let [ , , , h1, _h1v, , h2, _h2v, , x1, x1v, , x2, x2v, , x3, x3v] = matches
    ,   h1v = hv(h1, _h1v)
    ,   h2v = hv(h2, _h2v)
    if (are_valid_hues(h1, h2) && are_valid_svas([x1, x2, x3])){
      var rygbsva_json = hsva_obj(h1, h1v, h2, h2v, x1, x1v, x2, x2v, x3, x3v)
      return {data: rygbsva_json, string: rygb_obj_to_string(rygbsva_json)}
    }
  }
}

function rygb_json (v, data) {
  var value_type = typeof v
  if (value_type === 'string') {
    var grayscale_matches = v.match(val_re)
    if (grayscale_matches){
      var val = grayscale_matches[1]
      var alpha = grayscale_matches[3]
      var gray_rgba = va_to_rgba(val, alpha)
      return {string:  v,
              data: data || gray_rgba.json,
              rgba: gray_rgba.decimalArray}
    }else{
      return rygbsva(v)
    }
  }else if (value_type === 'object') {
    try {
      let s = rygb_obj_to_string(v)
      return rygb_json(s, v)
    } catch(e) {
    }
  }
}

function to_bytes (decimal) {
  return (Math.round(decimal * 255))
}

function rgba_decimal_arr_to_bytes_arr(arr) {
  var rgb = [arr[0], arr[1], arr[2]]
  var bytes = rgb.map(to_bytes)
  bytes.push(arr[3])
  return bytes
}

function css_fn (rygb) {
  return function () {
    var rgba_decimal_arr = rygb.rgba || hsva_to_rgba(rygb.data)
    return 'rgba(' + rgba_decimal_arr_to_bytes_arr(rgba_decimal_arr).join(', ') + ')'
  }
}

function rygb (arg) {
  var _rygb = rygb_json(arg)
  if (_rygb) {
    var css = css_fn(_rygb)
    return {
      css: css,
      toJSON: function () {return _rygb.data},
      toString: function () {return _rygb.string},
      rgba: function () {
        var _rgba = _rygb.rgba || hsva_to_rgba(_rygb.data)
        return {
          css: css,
          toArray: function (opt) {
            if (opt && (opt.decimal === true)) {
              return _rgba
            }else{
              return rgba_decimal_arr_to_bytes_arr(_rgba)
            }
          }
        }
      }
    }
  }
}

module.exports = rygb
