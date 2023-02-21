const SignString = {
  Hidden: '+',
  Shown: '-'
};

const DisplayStyle = {
  Hidden: 'none',
  Shown: 'block'
};

const Classes = {
  Clickable: 'clickable',
  Root: 'hidable_root',
  Sign: 'sign',
  Hidable: 'hidable'
};

const showList = (listEl: HTMLUListElement, signEl: HTMLSpanElement): void => {
  listEl.style.display = DisplayStyle.Shown;
  signEl.innerText = SignString.Shown;
};

const hideList = (listEl: HTMLUListElement, signEl: HTMLSpanElement): void => {
  listEl.style.display = DisplayStyle.Hidden;
  signEl.innerText = SignString.Hidden;
};

const toggleListVisibility = (listEl: HTMLUListElement, signEl: HTMLSpanElement): void => {
  if (listEl.style.display === DisplayStyle.Hidden) {
    showList(listEl, signEl);
  } else {
    hideList(listEl, signEl);
  }
};

export const showAll = (): void => {
  for (const el of document.getElementsByClassName(Classes.Hidable)) {
    (el as HTMLElement).style.display = DisplayStyle.Shown;
  }
  for (const el of document.getElementsByClassName(Classes.Sign)) {
    (el as HTMLElement).innerText = SignString.Shown;
  }
};

export const hideAll = (): void => {
  for (const el of document.getElementsByClassName(Classes.Hidable)) {
    (el as HTMLElement).style.display = DisplayStyle.Hidden;
  }
  for (const el of document.getElementsByClassName(Classes.Sign)) {
    (el as HTMLElement).innerText = SignString.Hidden;
  }
};

export const setupHidableList = (
  li: HTMLLIElement,
  span: HTMLSpanElement,
  ul: HTMLUListElement,
  sign: HTMLSpanElement,
  hideByDefault: boolean = true
): void => {
  li.classList.add(Classes.Root);
  span.classList.add(Classes.Clickable);
  sign.classList.add(Classes.Sign);
  ul.classList.add(Classes.Hidable);

  span.addEventListener('click', (): void => {
    toggleListVisibility(ul, sign);
  });

  if (hideByDefault) {
    hideList(ul, sign);
  } else {
    showList(ul, sign);
  }
};

/*
 * <li>
 *   <span class="clickable" onclick=toggleListVisibility>
 *     <span class="sign">
 *       if (hideByDefault) {
 *         '+'
 *       } else {
 *         '-'
 *       }
 *     </span> ${label}
 *   </span>
 *   <ul class="hidable" style="display:${hideByDefault ? 'none' : 'block'}">
 *     for (let i = 0; i < ${items.length}; i++) {
 *       ${items[i]}
 *     }
 *   </ul>
 * </li>
 */
export const createHidableListElement = (
  label: string,
  items: HTMLLIElement[],
  id?: string,
  hideByDefault: boolean = true
): HTMLLIElement => {
  const li = document.createElement('li');

  if (id !== undefined) {
    li.id = id;
  }

  const span = document.createElement('span');
  li.appendChild(span);

  const sign = document.createElement('span');
  span.appendChild(sign);
  span.appendChild(document.createTextNode(' ' + label));

  const ul = document.createElement('ul');

  for (const item of items) {
    ul.appendChild(item);
  }

  li.appendChild(ul);

  setupHidableList(li, span, ul, sign, hideByDefault);

  return li;
};

export const showById = (id: string): void => {
  let el = document.getElementById(id);
  while (el !== null) {
    if (el.classList.contains(Classes.Root)) {
      // Ugh...
      const span = el.firstElementChild;
      const sign = span.firstElementChild as HTMLSpanElement;
      const ul = span.nextElementSibling as HTMLUListElement;
      showList(ul, sign);
      location.href = location.href.split('#')[0] + '#' + id;
    }
    el = el.parentElement;
  }
};
