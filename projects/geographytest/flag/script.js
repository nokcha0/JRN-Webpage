const countries = {
    "af": "Afghanistan",
    "kr": "South Korea",
    "us": "United States",
    // 이 부분에 다른 국가 코드와 이름을 추가하세요.
};

const flagImg = document.getElementById('flag-img');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const result = document.getElementById('result');

function loadNewFlag() {
    const countryCodes = Object.keys(countries);
    const randomIndex = Math.floor(Math.random() * countryCodes.length);
    const selectedCountryCode = countryCodes[randomIndex];

    flagImg.src = `${selectedCountryCode}.svg`; // 깃발 이미지 파일 경로를 설정하세요.
    flagImg.alt = countries[selectedCountryCode];

    return countries[selectedCountryCode];
}

let correctAnswer = loadNewFlag();

submitBtn.addEventListener('click', () => {
    if (answerInput.value.toLowerCase() === correctAnswer.toLowerCase()) {
        result.textContent = "정답입니다!";
        correctAnswer = loadNewFlag();
        answerInput.value = "";
    } else {
        result.textContent = "틀렸습니다. 다시 시도해 보세요.";
    }
});
