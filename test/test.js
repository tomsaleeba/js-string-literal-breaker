const assert = require('assert')
const objectUnderText = require('../lib/jsslb.js')._testonly

const noopDebug = () => {}

describe('doProcessLine', function () {
  it('should return a short line with no quotes as-is', function () {
    const input = "'No quotes, No indent, no trailing comma, not too long'"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.equal(result[0], input)
    assert.equal(result.length, 1)
  })

  it('should return a short line as-is', function () {
    const input = "'Quotes, No indent, no trailing comma, not too long'"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.equal(result[0], input)
    assert.equal(result.length, 1)
  })

  it('should return a short line with trailing comma as-is', function () {
    const input = "'Quotes, No indent, trailing comma, not too long',"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.equal(result[0], input)
    assert.equal(result.length, 1)
  })

  it('should return an indented short line with trailing comma as-is', function () {
    const input = "    'Indent, trailing comma, not too long',"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.equal(result[0], input)
    assert.equal(result.length, 1)
  })

  it('should return an indented short line without trailing comma as-is', function () {
    const input = "    'Indent, no trailing comma, not too long'"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.equal(result[0], input)
    assert.equal(result.length, 1)
  })

  it('should break an indented long line without trailing comma', function () {
    const input =
      "    'Indent, no trailing comma, too long: Lorem ipsum dolor sit amet, consectetur adipiscing elit.'"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      "    'Indent, no trailing comma, too long: Lorem ipsum dolor sit amet, ' +",
      "    'consectetur adipiscing elit.'",
    ])
  })

  it('should break an indented long line with trailing comma', function () {
    const input =
      "    'Indent, trailing comma, too long: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ornare justo a est viverra eleifend. Nulla sed fringilla nisl.',"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      "    'Indent, trailing comma, too long: Lorem ipsum dolor sit amet, ' +",
      "    'consectetur adipiscing elit. Suspendisse ornare justo a est viverra ' +",
      "    'eleifend. Nulla sed fringilla nisl.',",
    ])
  })

  it('should break an indented long line without trailing comma and nested quotes', function () {
    const input = `      'Indent, no trailing comma, too long, nested different quotes: Lorem "ipsum" dolor sit amet, consectetur adipiscing elit.'`
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      "      'Indent, no trailing comma, too long, nested different quotes: Lorem ' +",
      `      '"ipsum" dolor sit amet, consectetur adipiscing elit.'`,
    ])
  })

  it('should break a long line that has no spaces to break nicely at', function () {
    const input = `"Too_long_but_no_spaces_to_break_at_Lorem_ipsum_dolor_sit_amet,_consectetur_adipiscing_elit._Phasellus_pretium_id_diam_eget_mollis._Aliquam_dignissim,_metus_a_volutpat_hendrerit,_mauris_lacus_dignissim_enim,_sit_amet_pharetra_metus_mi_ut_tellus.",`
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      '"Too_long_but_no_spaces_to_break_at_Lorem_ipsum_dolor_sit_amet,_consectetur_a" +',
      '"dipiscing_elit._Phasellus_pretium_id_diam_eget_mollis._Aliquam_dignissim,_me" +',
      '"tus_a_volutpat_hendrerit,_mauris_lacus_dignissim_enim,_sit_amet_pharetra_met" +',
      '"us_mi_ut_tellus.",',
    ])
  })

  it('should break a long line that contains all three quotes', function () {
    const input =
      '        `In the case of unusual or difficult species a moderator may assist with identification. More information in the \'identifying the animals!\' tab on the somethingzz website: <a href="https://www.example.com/zzz/pages/getting+started#how_ident_work" >https://www.example.com/zzz/pages/getting+started#how_ident_work</a >`,'
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      '        `In the case of unusual or difficult species a moderator may assist ` +',
      "        `with identification. More information in the 'identifying the ` +",
      "        `animals!' tab on the somethingzz website: <a ` +",
      '        `href="https://www.example.com/zzz/pages/getting+started#how_ident_wo` +',
      '        `rk" ` +',
      '        `>https://www.example.com/zzz/pages/getting+started#how_ident_work</a` +',
      '        ` >`,',
    ])
  })

  it('should handle a long line with a trailing + symbol by stripping the + then formatting', function () {
    const input =
      "        `In the case of unusual or difficult species a moderator may assist with identification. More information in the 'identifying ` +"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      '        `In the case of unusual or difficult species a moderator may assist ` +',
      "        `with identification. More information in the 'identifying `",
    ])
  })

  it('should format a line with no wrapping quotes by adding quotes', function () {
    const input =
      '    No quotes, indent, no trailing comma, too long: Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      "    'No quotes, indent, no trailing comma, too long: Lorem ipsum dolor sit ' +",
      "    'amet, consectetur adipiscing elit.'",
    ])
  })

  it('should format a line with no indent and  no wrapping quotes by adding quotes', function () {
    const input =
      'No quotes, indent, no trailing comma, too long: Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      "'No quotes, indent, no trailing comma, too long: Lorem ipsum dolor sit amet, ' +",
      "'consectetur adipiscing elit.'",
    ])
  })

  it('should format a line with a const variable declaration', function () {
    const input =
      "const someBlah = 'Variable delaration, no trailing comma, too long: Lorem ipsum dolor sit amet, consectetur adipiscing elit.'"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      'const someBlah =',
      "  'Variable delaration, no trailing comma, too long: Lorem ipsum dolor sit ' +",
      "  'amet, consectetur adipiscing elit.'",
    ])
  })

  it('should format a line with an indented const variable declaration', function () {
    const input =
      "    const someOtherBlah = 'Variable delaration, no trailing comma, too long: Lorem ipsum dolor sit amet, consectetur adipiscing elit.'"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      '    const someOtherBlah =',
      "      'Variable delaration, no trailing comma, too long: Lorem ipsum dolor ' +",
      "      'sit amet, consectetur adipiscing elit.'",
    ])
  })

  it('should format first literal param to an indented function call with two total params', function () {
    const input =
      "      console.warn('Failed to load due to a syntax error. Most likely this platform is not supported (too old)', err)"
    const result = objectUnderText.doProcessLine(input, 80, noopDebug)
    assert.deepEqual(result, [
      '      console.warn(',
      "        'Failed to load due to a syntax error. Most likely this platform is ' +",
      "        'not supported (too old)',",
      '        err)',
    ])
  })

  // FIXME handle long string in array, all on one line
  // FIXME handle long string as function param, all on one line
  // FIXME handle 'var' variable declaration
  // FIXME handle long string as key for object, all on one line
  // FIXME handle long string as value for object, all on one line
  // FIXME test smaller and larger text widths
  // FIXME validate textWidth is a sane value (cannot be less than length of indent + quotes + trailing command/plug
})
