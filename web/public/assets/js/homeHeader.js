const imgs = document.querySelectorAll('.s-homeHeader__images__wrapper img');
const wrapper = document.getElementsByClassName('s-homeHeader__images__wrapper')[0];
const floatTime = imgs.length*10;
const offSet = -0.05;

wrapper.style.animation = `floatImages ${floatTime}s linear infinite`;
imgs.forEach((img, index) => {
    img.style.animation = `floatUpDown ${floatTime}s ease-in-out ${index * floatTime/(imgs.length/2)*-1+(floatTime*offSet)}s infinite`;
});

