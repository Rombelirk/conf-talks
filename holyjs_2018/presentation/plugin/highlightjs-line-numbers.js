// jshint multistr:true

(function(w, d) {
  const TABLE_NAME = 'hljs-ln';

  const LINE_NAME = 'hljs-ln-line';

  const CODE_BLOCK_NAME = 'hljs-ln-code';

  const NUMBERS_BLOCK_NAME = 'hljs-ln-numbers';

  const NUMBER_LINE_NAME = 'hljs-ln-n';

  const DATA_ATTR_NAME = 'data-line-number';

  const BREAK_LINE_REGEXP = /\r\n|\r|\n/g;

  if (w.hljs) {
    w.hljs.initLineNumbersOnLoad = initLineNumbersOnLoad;
    w.hljs.lineNumbersBlock = lineNumbersBlock;

    addStyles();
  } else {
    w.console.error('highlight.js not detected!');
  }

  function addStyles() {
    const css = d.createElement('style');
    css.type = 'text/css';
    css.innerHTML = format(
      '.{0}{border-collapse:collapse}\
            .{0} td{padding:0}\
            .{1}:before{content:attr({2})}',
      [TABLE_NAME, NUMBER_LINE_NAME, DATA_ATTR_NAME]
    );
    d.getElementsByTagName('head')[0].appendChild(css);
  }

  function initLineNumbersOnLoad(options) {
    if (d.readyState === 'interactive' || d.readyState === 'complete') {
      documentReady(options);
    } else {
      w.addEventListener('DOMContentLoaded', () => {
        documentReady(options);
      });
    }
  }

  function documentReady(options) {
    try {
      const blocks = d.querySelectorAll('code.hljs');

      for (const i in blocks) {
        if (blocks.hasOwnProperty(i)) {
          lineNumbersBlock(blocks[i], options);
        }
      }
    } catch (e) {
      w.console.error('LineNumbers error: ', e);
    }
  }

  function lineNumbersBlock(element, options) {
    if (typeof element !== 'object') return;

    // define options or set default
    options = options || {
      singleLine: false,
    };

    // convert options
    const firstLineIndex = options.singleLine ? 0 : 1;

    async(() => {
      duplicateMultilineNodes(element);

      element.innerHTML = addLineNumbersBlockFor(element.innerHTML, firstLineIndex);
    });
  }

  function addLineNumbersBlockFor(inputHtml, firstLineIndex) {
    const lines = getLines(inputHtml);

    // if last line contains only carriage return remove it
    if (lines[lines.length - 1].trim() === '') {
      lines.pop();
    }

    if (lines.length > firstLineIndex) {
      let html = '';

      for (let i = 0, l = lines.length; i < l; i++) {
        html += format(
          '<tr>\
                        <td class="{0}">\
                            <div class="{1} {2}" {3}="{5}"></div>\
                        </td>\
                        <td class="{4}">\
                            <div class="{1}">{6}</div>\
                        </td>\
                    </tr>',
          [
            NUMBERS_BLOCK_NAME,
            LINE_NAME,
            NUMBER_LINE_NAME,
            DATA_ATTR_NAME,
            CODE_BLOCK_NAME,
            i + 1,
            lines[i].length > 0 ? lines[i] : ' ',
          ]
        );
      }

      return format('<table class="{0}">{1}</table>', [TABLE_NAME, html]);
    }

    return inputHtml;
  }

  /**
   * Recursive method for fix multi-line elements implementation in highlight.js
   * Doing deep passage on child nodes.
   * @param {HTMLElement} element
   */
  function duplicateMultilineNodes(element) {
    const nodes = element.childNodes;
    for (const node in nodes) {
      if (nodes.hasOwnProperty(node)) {
        const child = nodes[node];
        if (getLinesCount(child.textContent) > 0) {
          if (child.childNodes.length > 0) {
            duplicateMultilineNodes(child);
          } else {
            duplicateMultilineNode(child.parentNode);
          }
        }
      }
    }
  }

  /**
   * Method for fix multi-line elements implementation in highlight.js
   * @param {HTMLElement} element
   */
  function duplicateMultilineNode(element) {
    const className = element.className;

    if (!/hljs-/.test(className)) return;

    const lines = getLines(element.innerHTML);

    for (var i = 0, result = ''; i < lines.length; i++) {
      const lineText = lines[i].length > 0 ? lines[i] : ' ';
      result += format('<span class="{0}">{1}</span>\n', [className, lineText]);
    }

    element.innerHTML = result.trim();
  }

  function getLines(text) {
    if (text.length === 0) return [];
    return text.split(BREAK_LINE_REGEXP);
  }

  function getLinesCount(text) {
    return (text.trim().match(BREAK_LINE_REGEXP) || []).length;
  }

  function async(func) {
    w.setTimeout(func, 0);
  }

  /**
   * {@link https://wcoder.github.io/notes/string-format-for-string-formating-in-javascript}
   * @param {string} format
   * @param {array} args
   */
  function format(format, args) {
    return format.replace(/\{(\d+)\}/g, (m, n) => {
      return args[n] ? args[n] : m;
    });
  }
})(window, document);
