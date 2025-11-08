let sections = [];
let currentSectionIndex = 0;
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let wrongAttempts = 0;
let quizActive = false;
let answered = false;
let allowedSections = []; // Will store which sections to show based on access code

// Access code mapping
const ACCESS_CODES = {
  'SIKHAY': 'all', // All sections
  'SIKHAY-PRETEST': ['PRETEST'],
  'SIKHAY-ACTIVITY': ['ACTIVITY'],
  'SIKHAY-ANALISIS': ['ANALISIS'],
  'SIKHAY-ABSTRACT': ['ABSTRACT'],
  'SIKHAY-APPLICATION': ['APPLICATION'],
  'SIKHAY-POSTTEST': ['POST-TEST'],
  'SIKHAY-PRE-POST': ['PRETEST', 'POST-TEST'], // Combined
  'SIKHAY-ALL': 'all' // Alternative for all sections
};

const accessCodeScreen = document.getElementById('accessCodeScreen');
const quizContainer = document.getElementById('quizContainer');
const accessCodeInput = document.getElementById('accessCode');
const submitAccessCodeBtn = document.getElementById('submitAccessCode');
const accessError = document.getElementById('accessError');

const chatContainer = document.getElementById('chatContainer');
const chatSpacer = document.getElementById('chatSpacer');
const optionsContainer = document.getElementById('optionsContainer');
const startBtn = document.getElementById('startBtn');
const headerScore = document.getElementById('headerScore');

let synth = window.speechSynthesis;

// Access Code Handler
function checkAccessCode() {
  const enteredCode = accessCodeInput.value.trim().toUpperCase();
  
  if (ACCESS_CODES.hasOwnProperty(enteredCode)) {
    allowedSections = ACCESS_CODES[enteredCode];
    accessCodeScreen.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    accessError.classList.add('hidden');
    
    // Filter sections based on access code
    filterSections();
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

let allSections = []; // Store all sections from JSON

function initializeQuiz() {
  fetch('questions-new.json')
    .then(response => response.json())
    .then(data => {
      allSections = data;
      startBtn.addEventListener('click', startQuiz);
    })
    .catch(error => console.error('Error loading questions:', error));
}

function filterSections() {
  if (allowedSections === 'all') {
    // Show all sections
    sections = allSections;
  } else {
    // Filter only allowed sections
    sections = allSections.filter(section => allowedSections.includes(section.section));
  }
  
  // Calculate total questions for filtered sections
  totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
  headerScore.textContent = `Score: 0/${totalQuestions}`;
}

function startQuiz() {
  quizActive = true;
  currentSectionIndex = 0;
  currentQuestionIndex = 0;
  score = 0;
  wrongAttempts = 0;
  startBtn.style.display = 'none';
  optionsContainer.innerHTML = '';
  chatContainer.innerHTML = '';
  
  // Score is now in header, no need to show/hide
  updateScore();

  addBotMessage('Magsimula na tayo! Ang unang seksyon ay paparating na...');
  setTimeout(() => {
    showSection();
  }, 1500);
}

function showSection() {
  if (currentSectionIndex >= sections.length) {
    endQuiz();
    return;
  }

  const section = sections[currentSectionIndex];
  currentQuestionIndex = 0;

  // Show section title
  addBotMessage(`📚 ${section.title}`);
  
  setTimeout(() => {
    // Show instruction
    addBotMessage(section.instruction);
    
    setTimeout(() => {
      // Special handling for ACTIVITY section with story
      if (section.section === 'ACTIVITY' && section.story) {
        addBotMessage(`📖 ${section.story.title}`);
        setTimeout(() => {
          addBotMessage(section.story.content);
          setTimeout(() => {
            addBotMessage('Mga Gabay na Tanong:');
            setTimeout(() => {
              showQuestion();
            }, 1000);
          }, 2000);
        }, 1500);
      } 
      // Special handling for ABSTRACT section with word bank
      else if (section.section === 'ABSTRACT' && section.wordBank) {
        addBotMessage(`📝 Mga Pagpipilian: ${section.wordBank.join(', ')}`);
        setTimeout(() => {
          addBotMessage(section.context);
          setTimeout(() => {
            showQuestion();
          }, 1000);
        }, 1500);
      } 
      else {
        setTimeout(() => {
          showQuestion();
        }, 1000);
      }
    }, 1500);
  }, 1000);
}

function showQuestion() {
  const section = sections[currentSectionIndex];
  
  if (currentQuestionIndex >= section.questions.length) {
    // Move to next section
    currentSectionIndex++;
    setTimeout(() => {
      showSection();
    }, 1500);
    return;
  }

  answered = false;
  wrongAttempts = 0;
  optionsContainer.innerHTML = '';

  const question = section.questions[currentQuestionIndex];
  const globalQuestionNumber = getGlobalQuestionNumber();

  addBotMessage(`Tanong ${globalQuestionNumber} ng ${totalQuestions}:`);

  setTimeout(() => {
    addBotMessage(question.question);
    // speakText(question.question); // Voice disabled
    
    // Display options based on question type
    if (question.type === 'open-ended') {
      // For open-ended, show a note
      setTimeout(() => {
        addBotMessage('💡 Ito ay bukas na tanong. Pag-isipan ang iyong sagot at pindutin ang "Ipakita ang Sagot" upang makita ang tamang sagot.');
        displayOpenEndedOption(question);
      }, 1000);
    } else if (question.type === 'fill-in-blank') {
      // For fill-in-blank, show word bank as options
      displayFillInBlankOptions(question);
    } else {
      // Regular multiple choice
      displayOptions();
    }
  }, 800);
}

function getGlobalQuestionNumber() {
  let count = 0;
  for (let i = 0; i < currentSectionIndex; i++) {
    count += sections[i].questions.length;
  }
  return count + currentQuestionIndex + 1;
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
  
  // Force scroll after a brief delay to ensure rendering is complete
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 100);
}

function displayOptions() {
  if (answered) return;

  const section = sections[currentSectionIndex];
  const question = section.questions[currentQuestionIndex];
  optionsContainer.innerHTML = '';

  const options = ['a', 'b', 'c', 'd'];

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn w-full bg-white border-2 border-amber-300 hover:border-amber-700 hover:bg-amber-50 text-left p-3 sm:p-4 rounded-lg font-medium text-amber-950 transition-all';
    btn.textContent = `${option.toUpperCase()}: ${question.options[option]}`;
    btn.onclick = () => checkAnswer(option, question.options[option]);
    optionsContainer.appendChild(btn);
  });
  
  // Update spacer to push chat content up
  updateChatSpacer();
}

function displayFillInBlankOptions(question) {
  if (answered) return;

  const section = sections[currentSectionIndex];
  const wordBank = section.wordBank;
  optionsContainer.innerHTML = '';

  wordBank.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'option-btn w-full bg-white border-2 border-amber-300 hover:border-amber-700 hover:bg-amber-50 text-center p-3 sm:p-4 rounded-lg font-medium text-amber-950 transition-all';
    btn.textContent = word;
    btn.onclick = () => checkAnswer(word, word);
    optionsContainer.appendChild(btn);
  });
  
  // Update spacer to push chat content up
  updateChatSpacer();
}

function displayOpenEndedOption(question) {
  optionsContainer.innerHTML = '';
  
  const btn = document.createElement('button');
  btn.className = 'option-btn w-full bg-amber-700 border-2 border-amber-800 hover:bg-amber-800 text-center p-3 sm:p-4 rounded-lg font-semibold text-amber-50 transition-all';
  btn.textContent = '💡 Ipakita ang Sagot';
  btn.onclick = () => showOpenEndedAnswer(question);
  optionsContainer.appendChild(btn);
  
  // Update spacer to push chat content up
  updateChatSpacer();
}

function updateChatSpacer() {
  // Wait for options to render, then set spacer height
  setTimeout(() => {
    const optionsHeight = optionsContainer.offsetHeight;
    chatSpacer.style.height = `${optionsHeight + 20}px`; // Add extra 20px padding
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 100);
}

function showOpenEndedAnswer(question) {
  answered = true;
  disableAllOptions();
  
  addUserMessage('Nais kong makita ang sagot.');
  
  setTimeout(() => {
    addBotMessage('✅ Inaasahang Sagot:');
    setTimeout(() => {
      addBotMessage(question.answer);
      score++; // Give credit for open-ended questions
      updateScore();
      
      setTimeout(() => {
        addBotMessage('ANEK WOW! Tumpak! Matalas ang iyong pagsusuri at pag-unawa sa aralin. Kaya naman magtutungo na tayo sa susunod na katanungan.');
        // speakText('Tumpak!'); // Voice disabled
        
        setTimeout(() => {
          currentQuestionIndex++;
          showQuestion();
        }, 2000);
      }, 1500);
    }, 1000);
  }, 500);
}

function checkAnswer(selectedOption, selectedText) {
  if (answered) return;

  const section = sections[currentSectionIndex];
  const question = section.questions[currentQuestionIndex];
  answered = true;
  disableAllOptions();

  addUserMessage(selectedText);

  if (selectedOption === question.correct) {
    score++;
    updateScore();
    addBotMessage('ANEK WOW! Tumpak! Matalas ang iyong pagsusuri at pag-unawa sa aralin. Kaya naman magtutungo na tayo sa susunod na katanungan. 🎉');
    // speakText('Tumpak! Correct!'); // Voice disabled

    setTimeout(() => {
      currentQuestionIndex++;
      showQuestion();
    }, 2000);
  } else {
    wrongAttempts++;
    
    if (wrongAttempts < 3) {
      addBotMessage(`ANEK DAW? Subukan muli! Balikan at suriin pang mabuti ang aralin. ❌ (${wrongAttempts}/3)`);
      // speakText('Subukan muli!'); // Voice disabled
      answered = false;
      enableAllOptions();
    } else {
      const correctAnswer = question.options ? 
        `${question.correct.toUpperCase()}: ${question.options[question.correct]}` : 
        question.correct;
      
      addBotMessage(`Lubos na pagsubok! Ang tamang sagot ay: ${correctAnswer}`);
      // speakText('Ang tamang sagot ay'); // Voice disabled

      setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
      }, 3000);
    }
  }
}

// Timer functions removed - No longer needed

function disableAllOptions() {
  const buttons = optionsContainer.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = true);
}

function enableAllOptions() {
  const buttons = optionsContainer.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = false);
}

function updateScore() {
  headerScore.textContent = `Score: ${score}/${totalQuestions}`;
}

function endQuiz() {
  quizActive = false;
  optionsContainer.innerHTML = '';

  const percentage = ((score / totalQuestions) * 100).toFixed(1);
  let message = '';

  if (percentage >= 90) {
    message = '🌟 Napakahusay! Excellent work! Perpekto ang iyong pag-unawa!';
  } else if (percentage >= 75) {
    message = '👏 Mahusay! Very good! Mataas ang iyong marka!';
  } else if (percentage >= 60) {
    message = '✅ Mabuti! Good job! Mayroon kang mabuting pag-unawa.';
  } else {
    message = '📚 Kailangan mo pang mag-aral. Keep trying!';
  }

  addBotMessage(`🎉 Quiz complete! Your score: ${score}/${totalQuestions} (${percentage}%)`);
  addBotMessage(message);
  // speakText(`Quiz complete! Your score: ${score} out of ${totalQuestions}`); // Voice disabled

  const restartBtn = document.createElement('button');
  restartBtn.className = 'w-full bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-amber-50 font-semibold py-3 text-base sm:text-lg rounded-lg transition-all transform hover:scale-105 active:scale-95';
  restartBtn.textContent = 'Subukan Muli / Restart Quiz';
  restartBtn.onclick = () => location.reload();
  optionsContainer.appendChild(restartBtn);
}

// Voice/Speech function (DISABLED - Uncomment to enable)
function speakText(text) {
  // if (synth.speaking) {
  //   synth.cancel();
  // }
  // const utterance = new SpeechSynthesisUtterance(text);
  // utterance.lang = 'tl-PH';
  // utterance.rate = 0.9;
  // synth.speak(utterance);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', initializeQuiz);
