const firstQuestion = 'Apple';
const questions = [
    'Sigma',
    'water',
    'Ukulele',
    'Yamaha F325D Acoustic Guitar',
    'Mcdonald\'s vanilla soft serve cone',
    'Chicken',
    'crimson',
    'Math',
    'ABC',
    'american',
    'ideal gas law',
    'integral',
    'north korea',
    'number',
    'black oppression',
    'graph',
    'disabled',
    'woman',
    'tokyo',
    'europe',
    'alaska',
    'Psychoanalysis and psychodynamic therapy',
    'ball',
    'omega',
    'lenny',
    'haram',
    'Sus scrofa domesticus',
    'basketball player',
    'Lenovo IdeaPad 1i 14.0 HD Laptop - Intel Celeron N4020, 4GB RAM, 64GB eMMC, Windows 11 S Mode - Cloud Grey (82V6S00000)',
    'LGBTQQIAAPPO2S'
];

const exceptionList = {
    'omega': {filename: 'omega.jpg', answer: '\u03A9'},
    'lenny': {filename: 'lenny.jpg', answer: '\u0028\u0020\u0361\u00b0\u0020\u035c\u0296\u0020\u0361\u00b0\u0029'}
};

function preloadImages() {
    const preloadContainer = document.getElementById('preload-container');
    questions.forEach(question => {
        let filename = exceptionList[question] ? exceptionList[question].filename : `${question}.jpg`;
        let img = new Image();
        img.src = `images/${filename}`;
        preloadContainer.appendChild(img);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffleArray(questions);

let isFirstStart = true;
let currentQuestionIndex = 0; 
let score = 0;
let answerCheck = false;

function startQuiz() {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';

    if (isFirstStart) {
        questions.unshift(firstQuestion);
        isFirstStart = false;
    }

    loadQuestion(currentQuestionIndex);
    if (currentQuestionIndex === 0) {
        const appleIndex = questions.indexOf(firstQuestion);
        if (appleIndex > -1) {
            questions.splice(appleIndex, 1);
        }
    }
}

function loadQuestion(index) {
    const quiz = questions[index];
    let filename = quiz + '.jpg';
    let correctAnswer = quiz;

    if (exceptionList[quiz]) {
        filename = exceptionList[quiz].filename;
        correctAnswer = exceptionList[quiz].answer;
    }
    
    document.getElementById('quiz-image').src = 'images/' + filename;
    window.correctAnswer = correctAnswer;
    document.getElementById('answer').setAttribute("autocomplete", "off");
}

function checkAnswer() {
    if(answerCheck){
        answerCheck = false;
        nextQuestion();
        return;
    }
    const answer = document.getElementById('answer').value;
    const result = document.getElementById('result');
    
    if (answer.trim() !== '') { 
        let displayedAnswer = window.correctAnswer;
        
        if (answer.trim().toLowerCase() === window.correctAnswer.trim().toLowerCase()) {
            result.innerHTML = '<span style="color:#1abc9c; font-size: 30px;">Correct!&nbsp;&nbsp;&nbsp;' + displayedAnswer + '</span>';
            score++;
        } else {
            result.innerHTML = '<span style="color:Red; font-size: 30px;">Incorrect!&nbsp;&nbsp;&nbsp;' + displayedAnswer + '</span>';
        }
        document.getElementById('score').textContent = score;
        document.getElementById('scoreTxt').textContent = 'Score: ' + score + '/' + Number(Number(currentQuestionIndex) + 1);
        answerCheck = true;
    }
}

function nextQuestion() {
    document.getElementById('answer').value = ''; 
    document.getElementById('result').textContent = ''; 

    currentQuestionIndex++;  

    if (currentQuestionIndex < 10) {
        loadQuestion(currentQuestionIndex); 
    } else {
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('end-page').style.display = 'block';
        atEnd();
    }
}

function atEnd(){
    let message = '';
    switch(score){
        case 0:
            message = 'Gursahib is that you?';
            break;
        case 1:
            message = 'A rock is smarter than you.';
            break;
        case 2:
            message = 'An amoeba outcompetes you in terms of IQ.';
            break;
        case 3:
            message = 'Disappointment to humanity.';
            break;
        case 4:
            message = 'Consider rethinking life choices.';
            break;
        case 5:
            message = 'Your prefrontal cortex is missing.';
            break;
        case 6:
            message = 'You have an extra chromosome.';
            break;
        case 7:
            message = 'Quite intelligent for a chimpanzee.';
            break;
        case 8:
            message = 'At the verge of retardation.';
            break;
        case 9:
            message = 'Missing a couple of brain cells.';
            break;
        case 10:
            message = 'You have average intelligence.';
            break;
        default:
            break;
    }
    document.getElementById('final-message').innerHTML = message;

    let finalScore = score * 10;
    let progressBar = document.getElementById('progress-bar');
    progressBar.setAttribute('aria-valuenow', finalScore);
    progressBar.style.setProperty('--value', finalScore);
}

function restartQuiz() {
    shuffleArray(questions);
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('end-page').style.display = 'none';
    startQuiz();
}

document.getElementById('quiz-next-btn').addEventListener('click', checkAnswer);

document.getElementById('quiz-form').addEventListener('submit', function(event) {
    event.preventDefault();  
    if (!answerCheck) {
        checkAnswer();
    }
});

// Preload images on window load
window.onload = preloadImages;
