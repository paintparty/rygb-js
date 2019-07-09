const test = require('ava');
var rygb = require('../lib/index.js');


const api = {
  ".str()": arg => rygb(arg).str(),
  ".json()": arg => rygb(arg).json(),
  ".hex()": arg => rygb(arg).hex(),
  ".hexa()": arg => rygb(arg).hexa(),
  ".int24()": arg => rygb(arg).int24(),
  ".rgb().dec()": arg => rygb(arg).rgb().dec(),
  ".rgb().bit()": arg => rygb(arg).rgb().bit(),
  ".rgb().css()": arg => rygb(arg).rgb().css(),
  ".rgba().dec()": arg => rygb(arg).rgba().dec(),
  ".rgba().bit()": arg => rygb(arg).rgba().bit(),
  ".rgba().css()": arg => rygb(arg).rgba().css(),
  ".argb().dec()": arg => rygb(arg).argb().dec(),
  ".argb().bit()": arg => rygb(arg).argb().bit(),
}

// Elements in the expected array are indexed to fns in api object above
const tests = {
  "red": {
    args : [{h: {r: 1}}, "r"],
    expected: [
      'r',
      {h: {r: 1}},
      '#ff0000',
      '#ff0000ff',
      16711680,
      [1, 0, 0],
      [255, 0, 0],
      'rgb(255, 0, 0)',
      [1, 0, 0, 1],
      [255, 0, 0, 255],
      'rgba(255, 0, 0, 1)',
      [1, 1, 0, 0],
      [255, 255, 0, 0],
    ]
  },
  "yellow": {
    args : [{h: {y: 1}}, "y"],
    expected : [
      'y', 
      { h: { y: 1 } }, 
      '#ffff00', 
      '#ffff00ff', 
      16776960, 
      [ 1, 1, 0 ], 
      [ 255, 255, 0 ], 
      'rgb(255, 255, 0)', 
      [ 1, 1, 0, 1 ], 
      [ 255, 255, 0, 255 ], 
      'rgba(255, 255, 0, 1)',
      [1, 1, 1, 0], 
      [255, 255, 255, 0], 
    ]
  },
  "green": {
    args : [{h: {g: 1}}, "g"],
    expected : [
      'g', 
      { h: { g: 1 } }, 
      '#00ff00', 
      '#00ff00ff', 
      65280, 
      [ 0, 1, 0 ], 
      [ 0, 255, 0 ], 
      'rgb(0, 255, 0)', 
      [ 0, 1, 0, 1 ], 
      [ 0, 255, 0, 255 ], 
      'rgba(0, 255, 0, 1)',
      [ 1, 0, 1, 0 ], 
      [ 255, 0, 255, 0 ]
    ]
  },
  "blue": {
    args: [{h: {b: 1}}, "b"],
    expected: [
      'b', 
      { h: { b: 1 } }, 
      '#0000ff', 
      '#0000ffff', 
      255, 
      [ 0, 0, 1 ], 
      [ 0, 0, 255 ], 
      'rgb(0, 0, 255)', 
      [ 0, 0, 1, 1 ], 
      [ 0, 0, 255, 255 ], 
      'rgba(0, 0, 255, 1)',
      [ 1, 0, 0, 1 ], 
      [ 255, 0, 0, 255]
    ]
  },
  "red-yellow": {
    args: [{h: {r: 1, y: 1}}, "ry", "yr"],
    expected: [
      'ry', 
      { h: { r: 1, y: 1 } }, 
      '#ff8000', 
      '#ff8000ff', 
      16744192, 
      [ 1, 0.5, 0 ], 
      [ 255, 128, 0 ], 
      'rgb(255, 128, 0)', 
      [ 1, 0.5, 0, 1 ], 
      [ 255, 128, 0, 255 ],
      'rgba(255, 128, 0, 1)',
      [ 1, 1, 0.5, 0 ], 
      [ 255, 255, 128, 0 ]
    ]
  },
  "robin's egg blue": {
    args: [{h: {g: 1, b: 1}, s: 0.21, v: 0.83}, "gb-s21-v83"],
    expected: [
      'gb-s21-v83', 
      { h: { g: 1, b: 1 }, s: 0.21, v: 0.83 }, 
      '#a7d4d4', 
      '#a7d4d4ff', 
      10998739, 
      [ 0.6557, 0.83, 0.83 ], 
      [ 167, 212, 212 ], 
      'rgb(167, 212, 212)', 
      [ 0.6557, 0.83, 0.83, 1 ], 
      [ 167, 212, 212, 255 ], 
      'rgba(167, 212, 212, 1)', 
      [ 1, 0.6557, 0.83, 0.83 ], 
      [ 255, 167, 212, 212 ] 
    ]
  },
  "50% gray, 33% transparent": {
    args: [{v: 0.5, a: 0.33}, "v50-a33"],
    expected: [
      'v50-a33', 
      { v: 0.5, a: 0.33 }, 
      '#808080', 
      '#80808054', 
      8355711, 
      [ 0.5, 0.5, 0.5 ], 
      [ 128, 128, 128 ], 
      'rgb(128, 128, 128)', 
      [ 0.5, 0.5, 0.5, 0.33 ], 
      [ 128, 128, 128, 84 ], 
      'rgba(128, 128, 128, 0.33)',
      [ 0.33, 0.5, 0.5, 0.5 ], 
      [ 84, 128, 128, 128 ] 
    ]
  }
}

for(let name in tests){
  let {args, expected} = tests[name]
  Object.keys(api).forEach((fname, fn_idx) => {
    let fn = api[fname]
    test(`${name}, ${fname}`, t => {
      args.forEach((arg, idx) => {
        t.deepEqual(expected[fn_idx], fn(arg))
      })
    })
  })
}
