const supportedQuotes = ['"', "'", '`']

function doFormat(theInput, textWidth, writeFn, debugFn) {
  let resultLines = []
  const lines = theInput.trimEnd().split('\n')
  for (const curr of lines) {
    resultLines = resultLines.concat(doProcessLine(curr, textWidth, debugFn))
  }
  for (const curr of resultLines) {
    writeFn(curr)
  }
}

function doProcessLine(line, textWidth, debug) {
  const trimmedLine = line.trim()
  const usedQuote = (() => {
    const firstChar = trimmedLine.substring(0, 1)
    const isQuoted = supportedQuotes.includes(firstChar)
    if (!isQuoted) {
      debug('Does not start with a quote')
      const noQuote = ''
      return noQuote
    }
    return firstChar
  })()
  if (!usedQuote) {
    const strategies = [
      [
        function isConstDeclaration() {
          return line.trimStart().startsWith('const')
        },
        () => {
          // No, I'm not going to use a regex here because
          //   1. http://regex.info/blog/2006-09-15/247
          //   2. https://stackoverflow.com/a/1234725/1410035
          const withoutLhs = line.substring(line.indexOf('=') + 1).trim()
          const indent = ' '.repeat(line.length - line.trimStart().length)
          const withSomeIndent = `${indent}  ${withoutLhs}`
          const result = doProcessLine(withSomeIndent, textWidth, debug)
          result.unshift(line.substring(0, line.indexOf('=')) + '=')
          return result
        },
      ],
      (() => {
        const fnRegex = /^\s*((\w+\.?)+)\s*/
        return [
          function isFunctionCall() {
            return line.replace(fnRegex, '').substring(0, 1) === '('
          },
          () => {
            const indent = ' '.repeat(line.length - line.trimStart().length)
            const fnText = line
              .trimStart()
              .replace(new RegExp(fnRegex.source + '.*'), '$1(')
            // FIXME very naive search, expecting two params as <string>, <not string>
            const startOfStringLiteralIndex = line.indexOf('(') + 1
            const endOfStringLiteralIndex = line.lastIndexOf(',') + 1
            const extraIndentForSubsequentLines = '  '
            const result = doProcessLine(
              `${indent}${extraIndentForSubsequentLines}${line
                .substring(startOfStringLiteralIndex, endOfStringLiteralIndex)
                .trim()}`,
              textWidth,
              debug,
            )
            result.unshift(`${indent}${fnText}`)
            const trailingStuff = line.substring(endOfStringLiteralIndex)
            result.push(
              `${indent}${extraIndentForSubsequentLines}${trailingStuff.trim()}`,
            )
            return result
          },
        ]
      })(),
      [
        function isQuoteless() {
          return !supportedQuotes.includes(line.trimStart().substring(0, 1))
        },
        () => {
          const indent = ' '.repeat(line.length - line.trimStart().length)
          return doProcessLine(`${indent}'${line.trim()}'`, textWidth, debug)
        },
      ],
      // FIXME handle variable declarations
      // FIXME handle keys in objects
      // FIXME handle array items
    ]
    const strategy = (() => {
      for (const [condition, action] of strategies) {
        if (condition()) {
          return action
        }
      }
      return returnAsIs
    })()
    return strategy()
    function returnAsIs() {
      return line
    }
  }
  debug('Quote used=' + (usedQuote ? usedQuote : '(no quotes)'))
  const indexOfOpeningQuote = line.indexOf(usedQuote)
  const indentAmount = indexOfOpeningQuote
  const resultLines = []
  // remove leading quote
  let workingCopy = trimmedLine.substring(1)
  // remove trailing + as we'll add that back in as needed
  workingCopy = workingCopy.replace(/\s*\+\s*$/, '')
  // remove trailing quote, comma and space(s)
  const optionalCommaAndZeroOrMoreTrailingSpacesRegexStr = ',?\\s*$'
  const isTrailingComma = (() => {
    const requiredCommaAndZeroOrMoreTrailingSpacesRegexStr = optionalCommaAndZeroOrMoreTrailingSpacesRegexStr.replace(
      '?',
      '',
    )
    return !!workingCopy.match(requiredCommaAndZeroOrMoreTrailingSpacesRegexStr)
  })()
  workingCopy = workingCopy.replace(
    new RegExp(usedQuote + optionalCommaAndZeroOrMoreTrailingSpacesRegexStr),
    '',
  )
  const indentText = ' '.repeat(indentAmount)
  const lengthOfExtraCharsOnContinuedLines = `${usedQuote}${usedQuote}`.length
  const lengthOfExtraCharsOnLastLine = `${lengthOfExtraCharsOnContinuedLines} +`
    .length
  let loopCount = 0
  const maxLoops = 999
  while (workingCopy) {
    if (loopCount++ > maxLoops) {
      throw new Error(
        'Programmer problem: hit max loop count, probably running away',
      )
    }
    const isShortEnoughForFinalLine =
      indentText.length + workingCopy.length + lengthOfExtraCharsOnLastLine <=
      textWidth
    if (isShortEnoughForFinalLine) {
      debug('Remaining text is short enough for final line')
      resultLines.push(
        `${indentText}${usedQuote}${workingCopy}${usedQuote}${
          isTrailingComma ? ',' : ''
        }`,
      )
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
      const frontPaddingLength =
        indentAmount + moreCharsRepresentingQuotesAndStuff.length
      const isNoSpaceInText = indexOfLastSpace < frontPaddingLength
      const isLastSpaceInLeadingSpaces = (() => {
        const leadingSpaceCount =
          truncated.length - truncated.trimStart().length
        return indexOfLastSpace < leadingSpaceCount
      })()
      if (isNoSpaceInText || isLastSpaceInLeadingSpaces) {
        // no spaces to nicely break, so do it not nicely
        return truncated.substring(frontPaddingLength)
      }
      return truncated.substring(frontPaddingLength, indexOfLastSpace + 1)
    })()
    resultLines.push(
      `${indentText}${usedQuote}${contentThatFits}${usedQuote} +`,
    )
    workingCopy = workingCopy.substring(contentThatFits.length)
  }
  return resultLines
}

module.exports = {
  doFormat,
  _testonly: {
    doProcessLine,
  },
}
