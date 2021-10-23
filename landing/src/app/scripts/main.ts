window['toggleNavbar'] = collapseID => {
  document.getElementById(collapseID).classList.toggle('hidden');
  document.getElementById(collapseID).classList.toggle('block');
};
