const test = require('ava');
var rygb = require('../lib/index.js');


const api = {
  ".toJSON()": arg => rygb(arg).toJSON(),
  ".toString()": arg => rygb(arg).toString(),
  ".rgba().toArray({decimal:true})": arg => rygb(arg).rgba().toArray({decimal:true}),
  ".rgba().toArray()": arg => rygb(arg).rgba().toArray(),
  ".rgba().css()": arg => rygb(arg).rgba().css(),
  ".css()": arg => rygb(arg).css()
}


// Elements in the expected array are indexed to fns in api object above
const tests = {
  "red": {
    args : [{h: {r: 1}}, "r"],
    expected : [
      {h: {r: 1}},
      "r",
      [1, 0, 0, 1],
      [255, 0, 0, 1],
      "rgba(255, 0, 0, 1)",
      "rgba(255, 0, 0, 1)"
    ]
  },
  "yellow": {
    args : [{h: {y: 1}}, "y"],
    expected : [
      {h: {y: 1}},
      "y",
      [1, 1, 0, 1],
      [255, 255, 0, 1],
      "rgba(255, 255, 0, 1)",
      "rgba(255, 255, 0, 1)"
    ]
  },
  "green": {
    args : [{h: {g: 1}}, "g"],
    expected : [
      {h: {g: 1}},
      "g",
      [0, 1, 0, 1],
      [0, 255, 0, 1],
      "rgba(0, 255, 0, 1)",
      "rgba(0, 255, 0, 1)"
    ]
  },
  "blue": {
    args: [{h: {b: 1}}, "b"],
    expected: [
      {h: {b: 1}},
      "b",
      [0, 0, 1, 1],
      [0, 0, 255, 1],
      "rgba(0, 0, 255, 1)",
      "rgba(0, 0, 255, 1)"
    ]
  },
  "red-yellow": {
    args: [{h: {r: 1, y: 1}}, "ry", "yr"],
    expected: [
      {h: {r: 1, y: 1}},
      "ry",
      [1, 0.5, 0, 1],
      [255, 128, 0, 1],
      "rgba(255, 128, 0, 1)",
      "rgba(255, 128, 0, 1)"
    ]
  },
  "robin's egg blue": {
    args: [{h: {g: 1, b: 1}, s: 0.21, v: 0.83}, "gb-s21-v83"],
    expected: [
      {h: {g: 1, b: 1}, s: 0.21, v: 0.83},
      "gb-s21-v83",
      [0.6557, 0.83, 0.83, 1],
      [167, 212, 212, 1],
      "rgba(167, 212, 212, 1)",
      "rgba(167, 212, 212, 1)"
    ]
  },
  "50% gray, 33% transparent": {
    args: [{v: 0.5, a: 0.33}, "v50-a33"],
    expected: [
      {v: 0.5, a: 0.33},
      "v50-a33",
      [0.5, 0.5, 0.5, 0.33],
      [128, 128, 128, 0.33],
      "rgba(128, 128, 128, 0.33)",
      "rgba(128, 128, 128, 0.33)"
    ]
  },
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
