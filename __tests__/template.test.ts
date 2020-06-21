import * as template from '../src/template'

test.each([
  [
    '##Links <!---example\\.com=Link [l](%) % s---> s <!---checking=Link %--->',
    'https://check.com/link',
    '##Links <!---example\\.com=Link [l](%) % s---> s <!---checking=Link %--->'
  ],
  [
    '##Links <!---example\\.com=Link [l](%) % s---> s <!---checking=Link %--->',
    'https://example.com/link',
    '##Links Link [l](https://example.com/link) https://example.com/link s s <!---checking=Link %--->'
  ],
  [
    '<!---example=1%--->+<!---example=2%--->',
    'https://example.com/link',
    '1https://example.com/link+<!---example=2%--->'
  ],
  [
    '<!---example2=1%--->+<!---example=2%--->',
    'https://example.com/link',
    '<!---example2=1%--->+2https://example.com/link'
  ]
])('template', (given, link, expected) => {
  expect(template.processTemplate(given, link)).toEqual(expected)
})
