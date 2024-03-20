const cards = document.querySelectorAll('.card__article');

cards.forEach(card => {
  const cardData = card.querySelector('.card__data');
  let isAnimating = false; // 애니메이션 상태를 추적하는 플래그
  let hasMouseLeft = false; // 마우스가 요소를 벗어났는지 추적하는 플래그

  card.addEventListener('mouseenter', () => {
    isAnimating = true;
    hasMouseLeft = false; // 마우스가 요소 위에 있으므로 false로 초기화
    cardData.style.animation = 'show-data 1s forwards';
    cardData.style.opacity = '1';
    cardData.style.transition = 'opacity .3s';
    card.style.animation = 'remove-overflow 2s forwards';

    setTimeout(() => {
      isAnimating = false;
      if (hasMouseLeft) { // 애니메이션이 끝났을 때 마우스가 벗어났는지 확인
        // 마우스가 벗어났다면 remove-data 애니메이션 실행
        cardData.style.animation = 'remove-data 1.5s forwards';
        card.style.animation = 'show-overflow 1s forwards';
      }
    }, 1000); // show-data 애니메이션 지속 시간
  });

  card.addEventListener('mouseleave', () => {
    hasMouseLeft = true; // 마우스가 요소를 벗어났음을 기록
    if (!isAnimating) { // 애니메이션이 진행 중이지 않다면 바로 remove-data 실행
      cardData.style.animation = 'remove-data 1.5s forwards';
      card.style.animation = 'show-overflow 1s forwards';
    }
  });
});
