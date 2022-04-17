(() => {
  const toggleMenu = () => {
    const menu = document.querySelector('.header-links');
    menu.classList = (menu.classList.contains('open')) ? 'header-links close' : 'header-links open';
  };

  document.querySelector('.menu-open').addEventListener('click', toggleMenu);
  document.querySelector('.menu-close').addEventListener('click', toggleMenu);
})();
