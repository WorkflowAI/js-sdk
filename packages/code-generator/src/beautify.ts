import simplyBeautiful from 'simply-beautiful'

export const beautifyTypescript = (uglyCode: string): string => {
  return simplyBeautiful.js(uglyCode, {
    indent_size: 2,
    indent_char: ' ',
    brace_style: 'collapse',
    space_before_conditional: true,
  })
}
