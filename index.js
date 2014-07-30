var hljs = require('highlight.js');

/**
 * Hicat() : Hicat(str, options)
 * Highlights a given `str` string.
 *
 *   Hicat("echo 'hi'", { filename: 'script.sh' })
 *
 * Options available:
 *
 * ~ filename (string): Filename
 * ~ type (string): File type
 */

function Hicat (str, options) {
  if (!options) options = {};
  var ext = options.type || (options.filename && extname(options.filename));
  if (ext) {
    try {
      str = hljs.highlight(ext, str).value;
    } catch (e) {
      str = hljs.highlightAuto(str).value;
    }
  } else {
    str = hljs.highlightAuto(str).value;
  }

  if (!str) throw new Error("failed to highlight");
  str = html2ansi(str);
  return str;
}

Hicat.colors = {
  keyword: '1',
  built_in: 'keyword',

  title: '4', /* tags, function names */

  comment: '33',
  doctype: 'comment',
  pi: 'comment', /* xml declaration */

  string: '32',
  value: 'string', /* html/json values */

  number: '33',
  symbol: 'number', /* ruby :symbols */

  attribute: '34', /* html/json attributes */
  literal: 'attribute',

  regexp: '35'
};

function extname (fname) {
  var m = fname.match(/\.([^\.]+)$/);
  if (m) return m[1];
}

function color(token) {
  var code = token, newcode;
  while (true) {
    newcode = Hicat.colors[code];
    if (newcode) code = newcode;
    else if (token !== code) return code;
    else return;
  }
}

function html2ansi (str) {
  return str
    .replace(/<span class="hljs-([^"]*)">([^<]*)<\/span>/g, function (_, token, s) {
      var code = color(token);
      if (process.env.HICAT_DEBUG) s = s + "\033[30m[" + token + "]\033[0m";
      return code ? ("\033[" + code + "m" + s + "\033[0m") : s;
    })
    .replace(/<span class="([^"]*)">/g, '')
    .replace(/<\/span>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

module.exports = Hicat;