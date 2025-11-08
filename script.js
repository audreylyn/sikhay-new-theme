let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongAttempts = 0;
let timeRemaining = 20;
let timerInterval = null;
let quizActive = false;
let answered = false;

const ACCESS_CODE = 'SIKHAY'; // Change this to your desired access code

const accessCodeScreen = document.getElementById('accessCodeScreen');
const quizContainer = document.getElementById('quizContainer');
const accessCodeInput = document.getElementById('accessCode');
const submitAccessCodeBtn = document.getElementById('submitAccessCode');
const accessError = document.getElementById('accessError');

const chatContainer = document.getElementById('chatContainer');
const optionsContainer = document.getElementById('optionsContainer');
const startBtn = document.getElementById('startBtn');
const timerDisplay = document.getElementById('timerDisplay');
const headerScore = document.getElementById('headerScore');

let synth = window.speechSynthesis;

// Access Code Handler
function checkAccessCode() {
  const enteredCode = accessCodeInput.value.trim().toUpperCase();
  if (enteredCode === ACCESS_CODE) {
    accessCodeScreen.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    accessError.classList.add('hidden');
  } else {
    accessError.classList.remove('hidden');
    accessCodeInput.value = '';
    accessCodeInput.focus();
  }
}

submitAccessCodeBtn.addEventListener('click', checkAccessCode);
accessCodeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    checkAccessCode();
  }
});

function initializeQuiz() {
  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      questions = data;
      startBtn.addEventListener('click', startQuiz);
    })
    .catch(error => console.error('Error loading questions:', error));
}

function startQuiz() {
  quizActive = true;
  currentQuestionIndex = 0;
  score = 0;
  wrongAttempts = 0;
  startBtn.style.display = 'none';
  optionsContainer.innerHTML = '';
  chatContainer.innerHTML = '';

  addBotMessage('Magsimula na tayo! Ang unang tanong ay paparating na...');
  setTimeout(() => {
    showQuestion();
  }, 1500);
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }

  answered = false;
  wrongAttempts = 0;
  timeRemaining = 20;
  optionsContainer.innerHTML = '';

  const question = questions[currentQuestionIndex];

  addBotMessage(`Tanong ${currentQuestionIndex + 1} ng ${questions.length}:`);

  setTimeout(() => {
    addBotMessage(question.question);
    speakText(question.question);
    startTimer();
  }, 800);
}

function addBotMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-bubble flex gap-2';
  messageDiv.innerHTML = `
    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex-shrink-0 flex items-center justify-center text-amber-50 text-sm sm:text-base font-bold">
      S
    </div>
    <div class="bg-white border-2 border-amber-200 rounded-lg rounded-tl-none p-3 sm:p-4 max-w-[75%] sm:max-w-md text-amber-950">
      <p class="text-sm sm:text-base">${text}</p>
    </div>
  `;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addUserMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'user-bubble flex gap-2 justify-end';
  messageDiv.innerHTML = `
    <div class="bg-amber-800 rounded-lg rounded-tr-none p-3 sm:p-4 max-w-[75%] sm:max-w-md text-amber-50">
      <p class="text-sm sm:text-base">${text}</p>
    </div>
    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex-shrink-0 flex items-center justify-center text-white text-sm sm:text-base font-bold">
      U
    </div>
  `;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function displayOptions() {
  if (answered) return;

  const question = questions[currentQuestionIndex];
  optionsContainer.innerHTML = '';

  const options = ['a', 'b', 'c', 'd'];

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn w-full bg-white border-2 border-amber-300 hover:border-amber-700 hover:bg-amber-50 text-left p-3 sm:p-4 rounded-lg font-medium text-amber-950 transition-all';
    btn.textContent = `${option.toUpperCase()}: ${question.options[option]}`;
    btn.onclick = () => checkAnswer(option, question.options[option]);
    optionsContainer.appendChild(btn);
  });
}

function checkAnswer(selectedOption, selectedText) {
  if (answered) return;

  const question = questions[currentQuestionIndex];
  answered = true;
  disableAllOptions();
  clearInterval(timerInterval);

  addUserMessage(selectedText);

  if (selectedOption === question.correct) {
    score++;
    updateScore();
    addBotMessage('Tumpak! Correct! 🎉');
    speakText('Tumpak! Correct!');
    setTimeout(() => {
      currentQuestionIndex++;
      showQuestion();
    }, 2000);
  } else {
    wrongAttempts++;

    if (wrongAttempts < 3) {
      addBotMessage(`Subukan muli! Try again! ❌ (${wrongAttempts}/3)`);
      speakText(`Subukan muli! Try again!`);
      setTimeout(() => {
        answered = false;
        wrongAttempts--;
        timeRemaining = 20;
        displayOptions();
        startTimer();
      }, 2000);
    } else {
      addBotMessage(`Lubos na pagsubok! Ang tamang sagot ay: ${question.correct.toUpperCase()}: ${question.options[question.correct]}`);
      speakText(`Ang tamang sagot ay ${question.options[question.correct]}`);
      setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
      }, 3000);
    }
  }
}

function startTimer() {
  displayOptions();
  timeRemaining = 20;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining === 10) {
      addBotMessage('10 segundo na lang! 10 seconds left! ⏱️');
      speakText('10 seconds left!');
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleTimeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerRing = document.getElementById('timerDisplay');
  timerRing.textContent = timeRemaining;

  timerRing.className = 'timer-ring';

  if (timeRemaining <= 3) {
    timerRing.classList.add('timer-danger');
  } else if (timeRemaining <= 10) {
    timerRing.classList.add('timer-warning');
  } else {
    timerRing.classList.add('timer-normal');
  }
}

function handleTimeUp() {
  if (!answered) {
    answered = true;
    disableAllOptions();
    addBotMessage('Nagtandaan! Time\'s up! Moving to next question. ⏰');
    speakText('Time\'s up!');

    setTimeout(() => {
      currentQuestionIndex++;
      showQuestion();
    }, 2500);
  }
}

function disableAllOptions() {
  const buttons = optionsContainer.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = true);
}

function updateScore() {
  headerScore.textContent = `Score: ${score}/${questions.length}`;
}

function endQuiz() {
  quizActive = false;
  optionsContainer.innerHTML = '';
  clearInterval(timerInterval);

  const percentage = Math.round((score / questions.length) * 100);
  const message = percentage >= 80
    ? 'ANEK WOW! Kahanga-hangang resulta!'
    : percentage >= 60
    ? 'Maganda ang iyong gawain!'
    : 'Subukan muli at pag-aralan ang aralin nang mabuti!';

  addBotMessage(`🎉 Quiz complete! Your score: ${score}/${questions.length} (${percentage}%)`);
  addBotMessage(message);
  speakText(`Quiz complete! Your score: ${score} out of ${questions.length}`);

  sendResults(score, questions.length);

  setTimeout(() => {
    startBtn.textContent = 'Restart Quiz';
    startBtn.style.display = 'block';
  }, 2000);
}

function speakText(text) {
  if (!synth.speaking) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tl-PH';
    utterance.rate = 0.95;
    synth.speak(utterance);
  }
}

function sendResults(finalScore, totalQuestions) {
  const resultsData = {
    score: finalScore,
    total: totalQuestions,
    percentage: Math.round((finalScore / totalQuestions) * 100),
    timestamp: new Date().toISOString(),
    testName: 'SIKHAY Anekdota Quiz'
  };

  console.log('Quiz Results:', resultsData);

  // Placeholder for webhook integration
  // Uncomment and modify to send to your backend:
  // fetch('https://your-webhook-url.com/submit-results', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(resultsData)
  // })
  // .catch(error => console.error('Error sending results:', error));
}

initializeQuiz();
