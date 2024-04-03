let timeValue = 15;
let que_count = 0;
let que_numb = 1;
let userScore = 0;
let counter;
let counterLine;
let widthValue = 0;

const start_btn = document.querySelector(".start_btn button");
const quiz_box = document.querySelector(".quiz_box");
const result_box = document.querySelector(".result_box");
const option_list = document.querySelector(".option_list");
const time_line = document.querySelector("header .time_line");
const timeText = document.querySelector(".timer .time_left_txt");
const timeCount = document.querySelector(".timer .timer_sec");
const next_btn = document.querySelector("footer .next_btn");
const bottom_ques_counter = document.querySelector("footer .total_que");

start_btn.onclick = () => {
    quiz_box.classList.add("activeQuiz");
    main(); // Start the quiz
}
// Function to start the quiz and handle question generation from getflag.js
function main() {
    let options = [];
    const maxOptions = 4;

    while (options.length < maxOptions) {
        let country = getRandomCountry();
        if (!options.find(option => option.name === country.name)) {
            options.push(country);
        }
    }

    let correct = options[Math.floor(Math.random() * options.length)];
    for (let i = 0; i < options.length; i++) {
        let optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.innerHTML = `<span>${options[i].name}</span>`;
        optionEl.setAttribute('onclick', 'optionSelected(this, "' + correct.name + '")');
        option_list.appendChild(optionEl);
    }

    document.getElementById("flag").src = correct.flag;
    queCounter(que_numb);
    startTimer(timeValue);
    startTimerLine(widthValue);
}

// Function adapted from getflag.js for selecting an option
function optionSelected(answer, correctAns) {
    clearInterval(counter);
    clearInterval(counterLine);
    let userAns = answer.textContent.trim();
    const allOptions = option_list.children.length;

    if (userAns === correctAns) {
        userScore += 1;
        answer.classList.add("correct");
        console.log("Correct Answer");
    } else {
        answer.classList.add("incorrect");
        console.log("Wrong Answer");
        for (let i = 0; i < allOptions; i++) {
            if (option_list.children[i].textContent.trim() === correctAns) {
                option_list.children[i].classList.add("correct");
                console.log("Auto selected correct answer.");
            }
        }
    }
    updateScoreDisplay();
    for (let i = 0; i < allOptions; i++) {
        option_list.children[i].classList.add("disabled");
    }
    next_btn.classList.add("show");
}

function updateScoreDisplay() {
    let scoreDisplay = document.querySelector(".score_display");
    if (scoreDisplay) {
        scoreDisplay.innerHTML = `Score: ${userScore}`;
    }
}

function getRandomCountry() {
    return countries[Math.floor(Math.random() * countries.length)];
}

// Continuation from the initial setup

function startTimer(time) {
    counter = setInterval(timer, 1000);
    function timer() {
        timeCount.textContent = time;
        time--;
        if (time < 9) {
            let addZero = timeCount.textContent;
            timeCount.textContent = "0" + addZero;
        }
        if (time < 0) {
            clearInterval(counter);
            timeText.textContent = "Time Off";
            autoSelectCorrectAnswer();
            next_btn.classList.add("show");
        }
    }
}

function startTimerLine(time) {
    counterLine = setInterval(timer, 29);
    function timer() {
        time += 1;
        time_line.style.width = time + "px";
        if (time > 549) {
            clearInterval(counterLine);
        }
    }
}

function autoSelectCorrectAnswer() {
    let correctAns = document.querySelector(".option.correct").textContent.trim();
    const allOptions = option_list.children.length;
    for (let i = 0; i < allOptions; i++) {
        if (option_list.children[i].textContent.trim() === correctAns) {
            option_list.children[i].classList.add("disabled", "correct");
        } else {
            option_list.children[i].classList.add("disabled");
        }
    }
}

function queCounter(index) {
    let totalQueCounTag = '<span><p>' + index + '</p> of <p>' + countries.length + '</p> Questions</span>';
    bottom_ques_counter.innerHTML = totalQueCounTag;
}

function showResult() {
    quiz_box.classList.remove("activeQuiz");
    result_box.classList.add("activeResult");
    const scoreText = result_box.querySelector(".score_text");
    let scoreTag = '<span><p>' + userScore + '</p> out of <p>' + countries.length + '</p></span>';
    scoreText.innerHTML = scoreTag;
}

next_btn.onclick = () => {
    if (que_count < countries.length - 1) {
        que_count++;
        que_numb++;
        option_list.innerHTML = "";
        clearInterval(counter);
        clearInterval(counterLine);
        main();
    } else {
        clearInterval(counter);
        clearInterval(counterLine);
        showResult();
    }
};

// Restart and Quit functionality
restart_quiz.onclick = () => {
    window.location.reload(); // A simple way to restart the quiz
};

quit_quiz.onclick = () => {
    window.location.reload(); // A simple way to quit and refresh the page
};
