declare module 'simply-beautiful' {
  type JsOptions = {
    /**
     * Indentation size (default 4)
     */
    indent_size?: number
    /**
     * character to indent with (default space)
     */
    indent_char?: string
    /**
     * whether existing line breaks should be preserved (default true)
     */
    preserve_newlines?: boolean
    /**
     * maximum number of line breaks to be preserved in one chunk (default unlimited)
     */
    max_preserve_newlines?: number
    /**
     * if true, then jslint-stricter mode is enforced (default false)
     *        jslint_happy   !jslint_happy
     *      ---------------------------------
     *        function ()      function()
     */
    jslint_happy?: boolean
    /**
     * put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.
     * (default "collapse")
     */
    brace_style?: "collapse" | "expand" | "end-expand" | "expand-strict"
    /**
     * should the space before conditional statement be added, "if(true)" vs "if (true)"
     * (default true)
     */
    space_before_conditional?: boolean
    /**
     * should printable characters in strings encoded in \xNN notation be unescaped, "example" vs "\x65\x78\x61\x6d\x70\x6c\x65"
     * (default false)
     */
    unescape_strings?: boolean
  }

  const simplyBeautiful: {
    js: (source: string, options?: JsOptions) => string
  }
  export = simplyBeautiful
}