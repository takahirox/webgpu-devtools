import { argNamesTable } from "../../common/args";
import { createHidableListElement } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import { createAnyElement } from "./any";

/*
 * <li>
 * </li>
 */
// TODO: Avoid any
const createArgsElement = (command: any): HTMLLIElement => {
  const args = command.args as any[];
  const argNames = argNamesTable[command.name];

  const li = document.createElement('li');
  li.innerText = `Args[${command.args.length}]: `;
  for (let i = 0; i < args.length; i++) {
    const argName = argNames !== undefined && i < argNames.length ? argNames[i] : '';
    const label = `[${i}]: ${argName}:`;
    const ul = document.createElement('ul');
    ul.appendChild(createAnyElement(args[i], label, argName));
    li.appendChild(ul);
  }
  return li;
};

/*
 * <hidable-list
 *   label=`[${index}]: ${command.name}`
 *   items=[
 *     <thisObject thisObject=${command.thisObject} />,
 *     <arg arg=${command.args} />,
 *     <stacktrace stacktrace=${command.stacktrace} />
 *   ]
 * />
 */
// TODO: Avoid any
const createCommandElement = (index: number, command: any): HTMLLIElement => {
  const items = [];

  items.push(createAnyElement(command.thisObject, 'this:'));
  items.push(createArgsElement(command));
  items.push(createAnyElement(command.result, 'result:'));

  if (command.errorMessage !== undefined) {
    const li = createAnyElement(command.errorMessage, 'error:');
    // TODO: Remove magic strings
    li.classList.add('errorLeaf');
    items.push(li);
  }

  items.push(createStackTraceElement(command.stackTrace, 'Stacktrace'));

  return createHidableListElement(`[${index}]: ${command.name}`, items);
};

/*
 * <hidable-list
 *   label=`Commands: [${commands.length}]`
 *   item=[
 *     for (let i = 0; i < commands.length; i++) {
 *       <command index=${i} command=${commands[i]} />
 *     }
 *   ]
 * />
 */
// TODO: Avoid any
export const createCommandsElement = (commands: any[]): HTMLLIElement => {
  const items = [];

  for (let i = 0; i < commands.length; i++) {
    items.push(createCommandElement(i, commands[i]));
  }

  return createHidableListElement(`Commands: [${commands.length}]`, items);
};
