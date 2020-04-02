#!/usr/bin/env node
const { doFormat } = require('./lib/jsslb.js')

let theInput = ''
const textWidth = parseInt(process.env.TW) || 80
const isDebug = process.env.DEBUG || false

process.stdin.setEncoding('utf8')

process.stdin.on('readable', () => {
  let chunk
  while ((chunk = process.stdin.read()) !== null) {
    theInput += chunk
  }
})

process.stdin.on('end', () => {
  const debugFn = isDebug ? debug : () => {}
  doFormat(theInput, textWidth, write, debugFn)
})

// FIXME add help
// FIXME handle no input

function debug(msg) {
  process.stderr.write(`[debug] ${msg}\n`)
}

function write(data) {
  process.stdout.write(data + '\n')
}
