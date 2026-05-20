window.addEventListener('scroll', function() {
  const header = document.querySelector('.s-globalMenu');

  if (!header) return;

  if (window.scrollY > 10) {
      header.classList.remove('top');
  } else {
      header.classList.add('top');
  }
});


const toggle = document.querySelector('.s-globalMenu__toggle');
const menu = document.querySelector('.s-globalMenu');

const scrollLock = (() => {
  let y = 0;
  return {
    lock() {
      y = window.scrollY;
      document.body.style.top = `-${y}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    },
    unlock() {
      const top = parseInt(document.body.style.top || '0') * -1;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, top || 0);
    }
  };
})();

toggle.addEventListener('click', () => {
  menu.classList.toggle('open');

  if (menu.classList.contains('open')) {
    scrollLock.lock();
  } else {
    scrollLock.unlock();
  }
});
