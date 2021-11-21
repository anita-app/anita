import { setHeights } from './set-heights';

/**
 * Multiplys TR in thead as many as there are TR in tbody.
 * In this way in responsive layout we can show each body row as a separate card, with its own heads on the left.
 */
export function multiplyHeadsAsBodyRows(): void {
  const tables = document.getElementsByTagName('table');
  if (tables.length)
    loopAllTables(tables);
}

/**
 * Loops all tables foundo n the page
 * @param tables 
 */
function loopAllTables(tables: HTMLCollectionOf<HTMLTableElement>): void {
  for (let i = 0; i < tables.length; i++)
    handleTable(tables[i]);
}

/**
 * Handles each table determining the number ot body rows
 * @param table  
 */
function handleTable(table: HTMLTableElement): void {
  const tbody = table.getElementsByTagName('tbody');
  const thead = table.getElementsByTagName('thead');

  if (!tbody.length || !thead.length)
    return;

  const bodyRowws = tbody[0].getElementsByTagName('tr');

  if (!bodyRowws.length)
    return;

  const headRow = thead[0].getElementsByTagName('tr')[0];
  if (!headRow)
    return;

  cloneHeadsForEachBodyRow(bodyRowws, headRow, thead);

  setHeights();
}

/**
 * Clones heads for each body row
 * @param bodyRowws an HTMLCollectionOf of the TR elements found in the table 
 * @param headRow the head row to clone
 * @param thead the element to which to append new cloned childs
 */
function cloneHeadsForEachBodyRow(bodyRowws: HTMLCollectionOf<HTMLTableRowElement>, headRow: HTMLTableRowElement, thead: HTMLCollectionOf<HTMLTableSectionElement>) {
  for (let r = 1; r < bodyRowws.length; r++) {
    const clone = headRow.cloneNode(true);
    thead[0].appendChild(clone);
  }
}
