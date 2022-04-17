(() => {
  const popup = document.querySelector('.popup');
  const closePopup = () => popup.classList.add('close');

  if (popup) {
    document.querySelector('.popup-close').addEventListener('click', closePopup)
  }
})();
