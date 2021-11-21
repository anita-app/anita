/**
 * Ensures that on mobile TH and TD are displayed on the same line.
 * Sets the height of each TH, in the order they appear, as the height of each TD, in the order they appear.
 * Because the number of TH and TD is the same, in the card style view for mobile devices each TH is displayed on the left of each TD
 * This has to be invoked only once `multiplyHeadsAsBodyRows` has finished so we know that the number of TH and TD is the same.
 */
export function setHeights(): void {
  if (document.documentElement.clientWidth > 1024)
    return;
  const tables = document.getElementsByTagName('table');
  if (tables.length)
    loopTables(tables);
}

/**
 * Loops tables found on the page
 * @param tables  
 */
function loopTables(tables): void {
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const tbody = table.getElementsByTagName('tbody');
    const thead = table.getElementsByTagName('thead');
    if (!tbody || !thead)
      return;
    setEachThAsEachTd(tbody, thead);
  }
}

/**
 * Sets each TH heigh as the heigh of each TB matching them by their index.
  * @param tbody the table body where to search for TDs and calculate heights.
 * @param thead the table head where to search for TH and set the heights.
 * 
 * @remarkd uses `getBoundingClientRect()` and not `offsetHeight` to get the right decimals.
 */
function setEachThAsEachTd(tbody: HTMLCollectionOf<HTMLTableSectionElement>, thead: HTMLCollectionOf<HTMLTableSectionElement>) {
  const tds = tbody[0].getElementsByTagName('td');
  for (let t = 0; t < tds.length; t++) {
    const rect = tds[t].getBoundingClientRect();
    const heightDec = rect.bottom - rect.top;
    thead[0].getElementsByTagName('th')[t].setAttribute('style', `height:${heightDec.toFixed(2)}px`);
  }
}
