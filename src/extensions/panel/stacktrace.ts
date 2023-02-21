/*
 * <li>${line.replaceURLtoLink()}</li>
 */
const createStackTraceLineElement = (line: string): HTMLLIElement => {
  const li = document.createElement('li');
  // Inserts link if line includes URL starting with "https?://"
  // Expects line is like
  // "WebGPURenderer.init (https://threejs.org/examples/jsm/renderers/webgpu/WebGPURenderer.js:246:8)"
  // or
  // "https://threejs.org/examples/webgpu_loader_gltf.html:99:6"
  const match = line.match(/^([^(]*\()?(https?:\/\/.+)(:[0-9]+:[0-9]+)(\))?$/);
  if (match !== null) {
    if (match[1] !== undefined) {
      li.appendChild(document.createTextNode(match[1]));
    }

    const a = document.createElement('a');
    a.innerText = match[2];
    a.href = match[2];
    a.target = '_blank';
    li.appendChild(a);
    li.appendChild(document.createTextNode(match[3]));

    if (match[4] !== undefined) {
      li.appendChild(document.createTextNode(match[4]));
    }
  } else {
    li.innerText = line;
  }
  return li;
};

/*
 * <li>
 *   ${label}
 *   <ul>
 *     for (const line of stackTrace) {
 *       <stacktrace line=${line}>
 *     }
 *   </ul>
 * </li>
 */
export const createStackTraceElement = (lines: string[], label: string): HTMLLIElement => {
  const li = document.createElement('li');
  li.innerText = label;
  const ul = document.createElement('ul');
  for (const line of lines) {
    ul.appendChild(createStackTraceLineElement(line));
  }
  li.appendChild(ul);
  return li;
};
