const slider = document.querySelector('.s-squareCarousel__images__wrapper');
const leftArrow = document.querySelector('.s-squareCarousel__nav.left');
const rightArrow = document.querySelector('.s-squareCarousel__nav.right');

function updateNavButtons() {
  const scrollLeft = slider.scrollLeft;
  const scrollWidth = slider.scrollWidth;
  const clientWidth = slider.clientWidth;

  // At the beginning
  if (scrollLeft <= 0) {
    leftArrow.classList.add('is-disabled');
  } else {
    leftArrow.classList.remove('is-disabled');
  }

  // At the end
  if (scrollLeft + clientWidth >= scrollWidth - 1) {
    rightArrow.classList.add('is-disabled');
  } else {
    rightArrow.classList.remove('is-disabled');
  }
}

// Initial state
updateNavButtons();

// On scroll
slider.addEventListener('scroll', updateNavButtons);

// On arrow click
leftArrow.addEventListener('click', () => {
  slider.scrollBy({ left: -500, behavior: 'smooth' });
});

rightArrow.addEventListener('click', () => {
  slider.scrollBy({ left: 500, behavior: 'smooth' });
});

