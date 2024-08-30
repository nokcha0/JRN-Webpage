const typingText = document.querySelector(".typing-text p"),
inpField = document.querySelector(".wrapper .input-field"),
tryAgainBtn = document.querySelector(".content button"),
timeTag = document.querySelector(".time span b"),
mistakeTag = document.querySelector(".mistake span"),
wpmTag = document.querySelector(".wpm span");

let timer, startTime,
maxTime = 60,
timeLeft = maxTime,
charIndex = mistakes = isTyping = 0;
let timeTagElem = document.querySelector(".time span");

function loadParagraph() {
    const ranIndex = Math.floor(Math.random() * paragraphs.length);
    typingText.innerHTML = "";
    paragraphs[ranIndex].split("").forEach(char => {
        let span = `<span>${char}</span>`
        typingText.innerHTML += span;
    });
    typingText.querySelectorAll("span")[0].classList.add("active");
    document.addEventListener("keydown", () => inpField.focus());
    typingText.addEventListener("click", () => inpField.focus());
}

function initTyping() {
    let characters = typingText.querySelectorAll("span");
    let typedChar = inpField.value.split("")[charIndex];
    if(charIndex < characters.length - 1 && timeLeft > 0) {
        if(!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
            startTime = new Date();
        }
        if(typedChar == null) {
            if(charIndex > 0) {
                charIndex--;
                if(characters[charIndex].classList.contains("incorrect")) {
                    mistakes--;
                }
                characters[charIndex].classList.remove("correct", "incorrect");
            }
        } else {
            if(characters[charIndex].innerText == typedChar) {
                characters[charIndex].classList.add("correct");
            } else {
                mistakes++;
                characters[charIndex].classList.add("incorrect");
            }
            charIndex++;
        }
        characters.forEach(span => span.classList.remove("active"));
        characters[charIndex].classList.add("active");
        mistakeTag.innerText = mistakes;
    } else {
        clearInterval(timer);
        inpField.value = "";
    }   
}

function initTimer() {
    if(timeLeft > 0) {
        timeLeft--;
        timeTag.innerText = timeLeft;

        let wpm;
        if (maxTime === Infinity) {
            let timePassed = (new Date() - startTime) / 60000; // convert milliseconds to minutes
            wpm = timePassed === 0 ? 0 : Math.round((charIndex / 5) / timePassed);
        } else {
            wpm = Math.round(((charIndex - mistakes)  / 5) / (maxTime - timeLeft) * 60);
        }
        wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
        wpmTag.innerText = wpm;
    }
    if(timeLeft === 0) {
        clearInterval(timer);
        timeTagElem.classList.add("flash-infinite");
    }
}

function resetGame() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    startTime = null; // reset the start time
    charIndex = mistakes = isTyping = 0;
    inpField.value = "";
    timeTagElem.style.color = "#000000";
    timeTag.innerText = maxTime === Infinity ? "∞" : maxTime + "s"; // ensure "60s" is displayed
    wpmTag.innerText = 0;
    mistakeTag.innerText = 0;
}

let timedCheckbox = document.querySelector("#timed-checkbox");

timedCheckbox.addEventListener("change", function() {
    if (this.checked) {
        maxTime = 60; 
        timeTag.innerText = maxTime + "s"; 
    } else {
        maxTime = Infinity; 
        timeTag.innerText = "∞"; 
    }
    timeLeft = maxTime; 
});

loadParagraph();
inpField.addEventListener("input", initTyping);
tryAgainBtn.addEventListener("click", resetGame);
