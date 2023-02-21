import CodeMirror from "codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ayu-dark.css';
import './wgsl-mode.js';

const ERROR_MARK_CLASS_NAME = 'errorMark';
const styleEl = document.createElement('style');
styleEl.type = 'text/css';
styleEl.appendChild(document.createTextNode(`
  .${ERROR_MARK_CLASS_NAME} {
    background: #660;
  }
`));
document.getElementsByTagName('head')[0].appendChild(styleEl);

/*
 * <li>
 *   <codemirror value=${code} />
 * </li>
 */
export const createShaderCodeElement = (
  code: string,
  label: string,
  info?: GPUCompilationInfo
): HTMLLIElement => {
  const li = document.createElement('li');
  li.appendChild(document.createTextNode(label));
  li.appendChild(document.createElement('br'));

  const editor = CodeMirror(li, {
    value: code,
    lineNumbers: true,
    indentWithTabs: true,
    tabSize: 4,
    indentUnit: 4,
    autofocus: true,
    readOnly: true,
    mode: 'wgsl',
    theme: 'ayu-dark'
  });

  if (info !== undefined) {
    for (const message of info.messages) {
      editor.markText(
        {
          line: message.lineNum - 1,
          ch: message.linePos - 1
        },
        {
          line: message.lineNum - 1,
          ch: message.linePos - 1 + message.length
        },
        {
          className: ERROR_MARK_CLASS_NAME,
          attributes: { title: message.message }
        }
      );
    }
  }

  // CodeMirror seems to need to be refreshed when visible.
  // Otherwise it's blank until it is clicked (and refreshed).
  // TODO: Can we observe the visibility check rather than polling?
  const refreshWhenVisible = () => {
    // offsetParent seems to return null if an element is invisible.
    if (editor.getWrapperElement().offsetParent === null) {
      // Try again 1 sec away from now.
      setTimeout(refreshWhenVisible, 1000);
    } else {
      editor.refresh();
    }
  };
  refreshWhenVisible();

  return li;
};
