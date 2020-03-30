#!/usr/bin/env node
process.stdin.setEncoding('utf8')

let theInput = ''
const supportedQuotes = ['"', "'", '`']
const textWidth = parseInt(process.env.TW) || 80
const isDebug = process.env.DEBUG || false

process.stdin.on('readable', () => {
  let chunk
  while ((chunk = process.stdin.read()) !== null) {
    theInput += chunk
  }
})

process.stdin.on('end', () => {
  doFormat()
})

function doFormat() {
  const lines = theInput.trimEnd().split('\n')
  for (const curr of lines) {
    doProcessLine(curr)
  }
}

function doProcessLine(line) {
  const trimmedLine = line.trim()
  const usedQuote = trimmedLine.substring(0, 1)
  const isQuoted = supportedQuotes.includes(usedQuote)
  if (!isQuoted) {
    // FIXME should probably still do line breaks
    process.stdout.write(line + '\n')
    debug('Does not start with a quote')
    return
  }
  debug('Quote used=' + usedQuote)
  const indexOfOpeningQuote = line.indexOf(usedQuote)
  const indentAmount = indexOfOpeningQuote
  // FIXME handle extra length from quotes, spaces and +'s
  const resultLines = []
  // remove leading quote
  let workingCopy = trimmedLine.substring(1)
  // remove trailing quote, comma and space(s)
  workingCopy = workingCopy.replace(new RegExp(usedQuote + ',?\\s*$'), '')
  const indentText = ' '.repeat(indentAmount)
  const lengthOfExtraCharsOnContinuedLines = `${usedQuote}${usedQuote}`.length
  const lengthOfExtraCharsOnLastLine = `${lengthOfExtraCharsOnContinuedLines} +`
    .length
  while (workingCopy) {
    const isShortEnoughForFinalLine =
      indentText.length + workingCopy.length + lengthOfExtraCharsOnLastLine <=
      textWidth
    if (isShortEnoughForFinalLine) {
      debug('Remaining text is short enough for final line')
      resultLines.push(`${indentText}${usedQuote}${workingCopy}${usedQuote}`)
      workingCopy = null
      break
    }
    // still too long, need to break it up
    const moreCharsRepresentingQuotesAndStuff = ' '.repeat(
      lengthOfExtraCharsOnContinuedLines,
    )
    const indentAndRemainingData =
      indentText + moreCharsRepresentingQuotesAndStuff + workingCopy
    debug('Remaining text is still too long, processing')
    const contentThatFits = (() => {
      const truncated = indentAndRemainingData.substring(
        0,
        textWidth - lengthOfExtraCharsOnContinuedLines,
      )
      const indexOfLastSpace = truncated.lastIndexOf(' ')
      debug('Index of last space=' + indexOfLastSpace)
      const isNoSpaceInText =
        indexOfLastSpace <
        indentAmount + moreCharsRepresentingQuotesAndStuff.length
      if (isNoSpaceInText) {
        // no spaces to nicely break, so do it not nicely
        return truncated.trim()
      }
      return truncated.substring(0, indexOfLastSpace).trimStart()
    })()
    resultLines.push(
      `${indentText}${usedQuote}${contentThatFits}${usedQuote} +`,
    )
    workingCopy = workingCopy.replace(contentThatFits, '')
  }
  for (const curr of resultLines) {
    write(curr)
  }
}

function debug(msg) {
  if (!isDebug) {
    return
  }
  process.stderr.write(`[debug] ${msg}\n`)
}

function write(data) {
  process.stdout.write(data + '\n')
}
