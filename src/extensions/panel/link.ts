import { showById } from "./hidable";

export const linkToGPUObject = (type: string, resourceId: number): void => {
  const id = `${type}_${resourceId}`;
  const el = document.getElementById(id);
  if (el === null) {
    return;
  }
  showById(id);
  location.href = location.href.split('#')[0] + '#' + id;
};

export const createLinktToGPUObjectElement = (
  label: string,
  type: string,
  resourceId: number
): HTMLLIElement => {
  const li = document.createElement('li');
  li.innerText = `${label} `;

  const a = document.createElement('a');
  a.href = `#${type}_${resourceId}`;
  a.innerText = `${type} id: ${resourceId}`;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    linkToGPUObject(type, resourceId);
  });
  li.appendChild(a);

  return li;
}
