import { Typewriter } from './typewriter.class';
import { multiplyHeadsAsBodyRows } from './responsive-table/multiply-heads-as-body-rows.function';
import { setHeights } from './responsive-table/set-heights';

window['toggleNavbar'] = collapseID => {
  document.getElementById(collapseID).classList.toggle('hidden');
  document.getElementById(collapseID).classList.toggle('block');
};


multiplyHeadsAsBodyRows();

window.onresize = setHeights;

// on window ready
window.onload = () => {
  Typewriter.type()
}