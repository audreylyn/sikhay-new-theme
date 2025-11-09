let sections = [];
let currentSectionIndex = 0;
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let wrongAttempts = 0;
let quizActive = false;
let answered = false;
let allowedSections = []; // Will store which sections to show based on access code

// Student information for Google Sheets integration
let studentInfo = {
  name: '',
  yearSection: '',
  email: '',
  accessCode: '',
  startTime: '',
  endTime: '',
  answers: [] // Will store all answers with questions
};

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
const studentNameInput = document.getElementById('studentName');
const yearSectionInput = document.getElementById('yearSection');
const studentEmailInput = document.getElementById('studentEmail');
const submitAccessCodeBtn = document.getElementById('submitAccessCode');
const accessError = document.getElementById('accessError');

const chatContainer = document.getElementById('chatContainer');
const chatSpacer = document.getElementById('chatSpacer');
const optionsContainer = document.getElementById('optionsContainer');
const startBtn = document.getElementById('startBtn');
const headerScore = document.getElementById('headerScore');

let synth = window.speechSynthesis;

// Helper function to format date as readable string
function formatDateTime(date) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

// Access Code Handler
function checkAccessCode() {
  const enteredCode = accessCodeInput.value.trim().toUpperCase();
  const studentName = studentNameInput.value.trim();
  const yearSection = yearSectionInput.value.trim();
  const studentEmail = studentEmailInput.value.trim();
  
  // Validate all fields
  if (!studentName) {
    accessError.textContent = 'Pakilagay ang iyong buong pangalan.';
    accessError.classList.remove('hidden');
    studentNameInput.focus();
    return;
  }
  
  if (!yearSection) {
    accessError.textContent = 'Pakilagay ang iyong taon at seksyon.';
    accessError.classList.remove('hidden');
    yearSectionInput.focus();
    return;
  }
  
  if (!studentEmail) {
    accessError.textContent = 'Pakilagay ang iyong email address.';
    accessError.classList.remove('hidden');
    studentEmailInput.focus();
    return;
  }
  
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(studentEmail)) {
    accessError.textContent = 'Mali ang format ng email address.';
    accessError.classList.remove('hidden');
    studentEmailInput.focus();
    return;
  }
  
  if (ACCESS_CODES.hasOwnProperty(enteredCode)) {
    // Store student information
    studentInfo.name = studentName;
    studentInfo.yearSection = yearSection;
    studentInfo.email = studentEmail;
    studentInfo.accessCode = enteredCode;
    studentInfo.startTime = formatDateTime(new Date());
    
    allowedSections = ACCESS_CODES[enteredCode];
    accessCodeScreen.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    accessError.classList.add('hidden');
    
    // Filter sections based on access code
    filterSections();
  } else {
    accessError.textContent = 'Mali ang access code. Subukan ulit.';
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
  headerScore.textContent = `Puntos: 0/${totalQuestions}`;
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
  addBotMessage(`${section.title}`);
  
  setTimeout(() => {
    // Show instruction
    addBotMessage(section.instruction);
    
    setTimeout(() => {
      // Special handling for ACTIVITY section with story
      if (section.section === 'ACTIVITY' && section.story) {
        addBotMessage(`${section.story.title}`);
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
        addBotMessage(`Mga Pagpipilian: ${section.wordBank.join(', ')}`);
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
      // Check if it's ACTIVITY section - use text input
      if (section.section === 'ACTIVITY') {
        setTimeout(() => {
          addBotMessage('Ito ay bukas na tanong. Ilagay ang iyong sagot sa kahon sa ibaba.');
          displayTextInputOption(question);
        }, 1000);
      } else {
        // For other open-ended, show a note
        setTimeout(() => {
          addBotMessage('Ito ay bukas na tanong. Pag-isipan ang iyong sagot at pindutin ang "Ipakita ang Sagot" upang makita ang tamang sagot.');
          displayOpenEndedOption(question);
        }, 1000);
      }
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
  btn.textContent = 'Ipakita ang Sagot';
  btn.onclick = () => showOpenEndedAnswer(question);
  optionsContainer.appendChild(btn);
  
  // Update spacer to push chat content up
  updateChatSpacer();
}

function displayTextInputOption(question) {
  optionsContainer.innerHTML = '';
  
  // Create textarea for student answer
  const textarea = document.createElement('textarea');
  textarea.className = 'w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-700 text-amber-950 resize-none';
  textarea.placeholder = 'Ilagay ang iyong sagot dito...';
  textarea.rows = 4;
  textarea.id = 'studentAnswer';
  
  // Create submit button
  const submitBtn = document.createElement('button');
  submitBtn.className = 'option-btn w-full bg-amber-700 border-2 border-amber-800 hover:bg-amber-800 text-center p-3 sm:p-4 rounded-lg font-semibold text-amber-50 transition-all mt-2';
  submitBtn.textContent = 'Ipasa ang Sagot';
  submitBtn.onclick = () => submitTextAnswer(question, textarea);
  
  optionsContainer.appendChild(textarea);
  optionsContainer.appendChild(submitBtn);
  
  // Update spacer to push chat content up
  updateChatSpacer();
  
  // Focus on textarea
  setTimeout(() => textarea.focus(), 100);
}

function submitTextAnswer(question, textarea) {
  const studentAnswer = textarea.value.trim();
  
  if (!studentAnswer) {
    addBotMessage('Mangyaring magsulat ng sagot bago ipasa.');
    return;
  }
  
  answered = true;
  textarea.disabled = true;
  disableAllOptions();
  
  addUserMessage(studentAnswer);
  
  // Store answer for Google Sheets
  const section = sections[currentSectionIndex];
  studentInfo.answers.push({
    section: section.section,
    questionNumber: getGlobalQuestionNumber(),
    question: question.question,
    studentAnswer: studentAnswer,
    correctAnswer: question.answer,
    isCorrect: true, // Credit given for open-ended
    attempts: 1
  });
  
  setTimeout(() => {
    addBotMessage('Salamat sa iyong sagot! Narito ang inaasahang sagot:');
    setTimeout(() => {
      addBotMessage(question.answer);
      score++; // Give credit for answering
      updateScore();
      
      setTimeout(() => {
        addBotMessage('ANEK WOW! Matalas ang iyong pagsusuri at pag-unawa sa aralin. Kaya naman magtutungo na tayo sa susunod na katanungan.');
        
        setTimeout(() => {
          currentQuestionIndex++;
          showQuestion();
        }, 2000);
      }, 1500);
    }, 1000);
  }, 500);
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
  
  // Store answer for Google Sheets
  const section = sections[currentSectionIndex];
  studentInfo.answers.push({
    section: section.section,
    questionNumber: getGlobalQuestionNumber(),
    question: question.question,
    studentAnswer: 'Viewed answer directly',
    correctAnswer: question.answer,
    isCorrect: true, // Credit given
    attempts: 1
  });
  
  setTimeout(() => {
    addBotMessage('Inaasahang Sagot:');
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
  
  const isCorrect = selectedOption === question.correct;

  // Store answer for Google Sheets
  studentInfo.answers.push({
    section: section.section,
    questionNumber: getGlobalQuestionNumber(),
    question: question.question,
    studentAnswer: selectedText,
    correctAnswer: question.options ? question.options[question.correct] : question.correct,
    isCorrect: isCorrect,
    attempts: wrongAttempts + 1
  });

  if (isCorrect) {
    score++;
    updateScore();
    addBotMessage('ANEK WOW! Tumpak! Matalas ang iyong pagsusuri at pag-unawa sa aralin. Kaya naman magtutungo na tayo sa susunod na katanungan.');
    // speakText('Tumpak! Correct!'); // Voice disabled

    setTimeout(() => {
      currentQuestionIndex++;
      showQuestion();
    }, 2000);
  } else {
    wrongAttempts++;
    
    if (wrongAttempts < 3) {
      addBotMessage(`ANEK DAW? Subukan muli! Balikan at suriin pang mabuti ang aralin. (${wrongAttempts}/3)`);
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
  headerScore.textContent = `Puntos: ${score}/${totalQuestions}`;
}

function endQuiz() {
  quizActive = false;
  optionsContainer.innerHTML = '';
  
  // Set end time
  studentInfo.endTime = formatDateTime(new Date());
  studentInfo.score = score;
  studentInfo.totalQuestions = totalQuestions;
  studentInfo.percentage = ((score / totalQuestions) * 100).toFixed(1);

  const percentage = ((score / totalQuestions) * 100).toFixed(1);
  let message = '';

  if (percentage >= 90) {
      message = 'Napakagaling! Perpekto ang iyong pag-unawa sa aralin!';
    } else if (percentage >= 75) {
      message = 'Mahusay! Lubos mong naunawaan ang mga pangunahing konsepto!';
    } else if (percentage >= 60) {
      message = 'Mabuti! Ipagpatuloy ang pag-aaral upang lalong humusay.';
    } else {
      message = 'Kailangan pa ng kaunting pagsasanay. Balikan ang aralin at subukan muli!';
    }

  addBotMessage(`Tapos na ang pagsusulit! Ang iyong iskor: ${score}/${totalQuestions} (${percentage}%)`);
  addBotMessage(message);
  // speakText(`Tapos na ang pagsusulit! Ang iyong iskor: ${score} out of ${totalQuestions}`); // Voice disabled
  
  // Log student data for Google Sheets integration (you can see this in browser console)
  console.log('Student Quiz Data for Google Sheets:', studentInfo);
  
  // Send data to Google Sheets
  sendToGoogleSheets(studentInfo);

  const restartBtn = document.createElement('button');
  restartBtn.className = 'w-full bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-amber-50 font-semibold py-3 text-base sm:text-lg rounded-lg transition-all transform hover:scale-105 active:scale-95';
  restartBtn.textContent = 'Subukan Muli';
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

// Google Sheets Integration
// IMPORTANT: Replace this URL with your own Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzWfAL7EFFoFxYMMpUODgFBjAziHNp0I2Bo_kWBLITFHZGf5xHxPM2PN5-AcNiH5_4A/exec';

async function sendToGoogleSheets(data) {
  try {
    // Show sending message
    addBotMessage('Ipinapadala ang iyong mga sagot sa Google Sheets...');
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Important for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    // Note: With 'no-cors', we can't read the response, but the data is sent
    console.log('Data sent to Google Sheets successfully');
    addBotMessage('Matagumpay na naipadala ang iyong mga sagot!');
    
  } catch (error) {
    console.error('Error sending to Google Sheets:', error);
    addBotMessage('May problema sa pagpapadala ng data. Ngunit naitala na ang iyong score.');
  }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', initializeQuiz);
