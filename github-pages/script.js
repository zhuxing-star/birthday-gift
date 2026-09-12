const cover = document.querySelector('.gift-cover');
const openGift = document.querySelector('#open-gift');
const finale = document.querySelector('#finale');
const wishButton = document.querySelector('#light-wish');
const wishTitle = document.querySelector('#wish-title');
const wishCopy = document.querySelector('#wish-copy');
const sparkles = document.querySelector('.sparkles');

openGift.addEventListener('click', () => {
  cover.classList.add('gift-cover--open');
  document.body.classList.remove('locked');
});

wishButton.addEventListener('click', () => {
  finale.classList.remove('finale--lit');
  sparkles.replaceChildren();
  requestAnimationFrame(() => {
    finale.classList.add('finale--lit');
    wishTitle.textContent = '愿望已经出发啦';
    wishCopy.textContent = '愿你所愿皆所得，往后的每一天都闪闪发光。';
    for (let index = 0; index < 42; index += 1) {
      const dot = document.createElement('i');
      dot.style.setProperty('--x', `${(index * 37) % 100}vw`);
      dot.style.setProperty('--delay', `${(index % 9) * 0.08}s`);
      dot.style.setProperty('--drift', `${(index % 2 ? 1 : -1) * (20 + (index % 5) * 8)}px`);
      dot.style.setProperty('--color', ['#ffd27d', '#f5a7bb', '#9be5f4', '#ffffff'][index % 4]);
      sparkles.append(dot);
    }
  });
});

document.querySelector('#replay').addEventListener('click', () => {
  finale.classList.remove('finale--lit');
  wishTitle.textContent = '最后，许个愿吧';
  wishCopy.textContent = '轻轻点一下蜡烛';
});
