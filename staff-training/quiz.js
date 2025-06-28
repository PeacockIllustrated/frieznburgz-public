// --- staff-training/quiz.js (Final Corrected Version) ---

import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- QUESTION BANK & CONFIG ---
    const questionBank = [
        { section: "Preparation", question: "What is the correct cash float amount at the start of a shift?", options: ["£100", "£150", "£200", "£50"], answer: "£150" },
        { section: "Preparation", question: "What does FIFO stand for when stocking fridges?", options: ["Find It First, Organize", "First In, First Out", "Fill In, Fill Out", "Fast In, Fast Out"], answer: "First In, First Out" },
        { section: "Service", question: "What is the first thing you should do when a customer approaches the counter?", options: ["Ask for their order", "Check the pass for food", "Smile and greet them", "Wipe the counter"], answer: "Smile and greet them" },
        { section: "Service", question: "When upselling, what popular extra should you offer with a burger?", options: ["Extra cheese", "Bacon or pastrami", "A different bun", "Extra pickles"], answer: "Bacon or pastrami" },
        { section: "Everyday Rules", question: "When are you allowed to use your mobile phone during work hours?", options: ["Any time it's quiet", "Only in the back", "Only during your designated break", "Never"], answer: "Only during your designated break" },
        { section: "Everyday Rules", question: "Which items are NOT included in the free staff meal?", options: ["Fries and a drink", "A classic burger", "Coffee and water", "Cheesecakes and milkshakes"], answer: "Cheesecakes and milkshakes" },
        { section: "Preparation", question: "How often should milkshake machines be cleaned?", options: ["Every day", "Once a week", "Twice a week (Monday/Thursday)", "Once a month"], answer: "Twice a week (Monday/Thursday)" },
        { section: "Performance", question: "What score is 'Excellent' and eligible for bonuses?", options: ["70-79 points", "80-89 points", "90-100 points", "100+ points"], answer: "90-100 points" },
        { section: "Disciplinary", question: "What is the first step in the disciplinary process for a minor infraction?", options: ["Written Warning", "Final Warning", "Termination", "Verbal Warning"], answer: "Verbal Warning" },
        { section: "Service", question: "What must be updated daily when a new special item is launched?", options: ["The menu board", "The allergen sheets", "The price list", "The staff rota"], answer: "The allergen sheets" },
    ];
    const QUIZ_LENGTH = 8;
    const TOTAL_HANDBOOK_SECTIONS = 12;

    // --- DOM ELEMENT & STATE ---
    const quizContainer = document.getElementById('quiz-container');
    let currentUser = null;
    let progressDocRef = null;
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // --- TEMPLATING FUNCTIONS ---
    const renderOverviewHTML = (progressData) => {
        const history = progressData.quizHistory || [];
        const readSections = progressData.readSections || [];
        const percentage = TOTAL_HANDBOOK_SECTIONS > 0 ? (readSections.length / TOTAL_HANDBOOK_SECTIONS) * 100 : 0;
        let logHtml = '<li>No quiz history found.</li>';
        if (history.length > 0) {
            logHtml = history.slice().reverse().map(attempt => {
                const date = new Date(attempt.timestamp).toLocaleString();
                return `<li><span class="log-score">Score: ${attempt.score}/${attempt.total}</span> <span class="log-timestamp">${date}</span></li>`;
            }).join('');
        }
        return `
            <div id="quiz-overview-container" class="quiz-view">
                <h2 class="page-title">My Progress Overview</h2>
                <div class="overview-grid">
                    <div class="overview-card">
                        <h3>Handbook Completion</h3>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
                        </div>
                        <p id="handbook-progress-text">${Math.round(percentage)}% Complete (${readSections.length} / ${TOTAL_HANDBOOK_SECTIONS} sections read)</p>
                    </div>
                    <div class="overview-card">
                        <h3>Quiz Attempts</h3>
                        <p class="quiz-attempts-count">${history.length}</p>
                        <p>quizzes taken</p>
                    </div>
                </div>
                <div class="quiz-actions"><button id="start-quiz-btn" class="quiz-start-button">Start The Quiz</button></div>
                <div class="quiz-log-container"><h3>Quiz History</h3><ul id="quiz-log-list">${logHtml}</ul></div>
            </div>`;
    };

    const renderQuizHTML = () => `
        <div id="quiz-active-container" class="quiz-view">
            <div class="quiz-header"><h2 class="page-title">Friez & Burgz Quiz</h2><div id="quiz-progress-indicator"></div></div>
            <div class="question-container"><h3 id="question-text"></h3><div class="quiz-options" id="quiz-options-container"></div></div>
            <button id="next-question-btn" style="display: none;">Next Question</button>
        </div>`;

    const renderResultsHTML = (finalScore) => `
        <div id="quiz-results-container" class="quiz-view">
            <h2 class="page-title">Quiz Complete!</h2>
            <div class="results-summary"><p>Your Score:</p><h3 id="final-score-text">${finalScore} / ${QUIZ_LENGTH}</h3><p id="results-message">${finalScore / QUIZ_LENGTH >= 0.8 ? "Excellent work!" : "Good job! A quick review will help."}</p></div>
            <button id="return-to-overview-btn">Return to Overview</button>
        </div>`;

    // --- MAIN LOGIC ---
    async function showOverview() {
        if (!progressDocRef) return;
        try {
            const docSnap = await progressDocRef.get();
            let progressData = { readSections: [], quizHistory: [] };
            if (docSnap && docSnap.exists) {
                progressData = docSnap.data();
            } else {
                await progressDocRef.set({ readSections: [], quizHistory: [] });
            }
            quizContainer.innerHTML = renderOverviewHTML(progressData);
        } catch (error) {
            console.error("Error showing overview:", error);
            quizContainer.innerHTML = `<p style="color:red;">Could not load user progress.</p>`;
        }
    }

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
        currentQuizQuestions = shuffled.slice(0, QUIZ_LENGTH);
        quizContainer.innerHTML = renderQuizHTML();
        displayQuestion();
    }

    function displayQuestion() {
        const questionData = currentQuizQuestions[currentQuestionIndex];
        document.getElementById('quiz-progress-indicator').textContent = `Question ${currentQuestionIndex + 1} of ${QUIZ_LENGTH}`;
        document.getElementById('question-text').textContent = questionData.question;
        const optionsContainer = document.getElementById('quiz-options-container');
        optionsContainer.innerHTML = '';
        questionData.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'quiz-option-btn';
            button.textContent = option;
            optionsContainer.appendChild(button);
        });
    }

    function selectAnswer(targetButton) {
        const correctAnswer = currentQuizQuestions[currentQuestionIndex].answer;
        document.querySelectorAll('.quiz-option-btn').forEach(button => {
            button.disabled = true;
            if (button.textContent === correctAnswer) button.classList.add('correct');
        });
        if (targetButton.textContent === correctAnswer) {
            score++;
            targetButton.classList.add('correct');
        } else {
            targetButton.classList.add('incorrect');
        }
        document.getElementById('next-question-btn').style.display = 'block';
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < QUIZ_LENGTH) {
            displayQuestion();
        } else {
            finishQuiz();
        }
    }

    async function finishQuiz() {
        const newResult = { score: score, total: QUIZ_LENGTH, timestamp: new Date().toISOString() };
        if (progressDocRef) {
            try {
                 await progressDocRef.update({
                    quizHistory: firebase.firestore.FieldValue.arrayUnion(newResult)
                });
            } catch(error) {
                console.error("Error saving quiz result:", error);
            }
        }
        quizContainer.innerHTML = renderResultsHTML(score);
    }
    
    // --- EVENT LISTENERS & INITIALIZATION ---
    quizContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.id === 'start-quiz-btn') {
            startQuiz();
        } else if (target.classList.contains('quiz-option-btn')) {
            selectAnswer(target);
        } else if (target.id === 'next-question-btn') {
            nextQuestion();
        } else if (target.id === 'return-to-overview-btn') {
            showOverview();
        }
    });
    
    document.addEventListener('userAuthenticated', (event) => {
        currentUser = event.detail.user;
        // Corrected, single source of truth for the document path
        progressDocRef = db.collection('users').doc(currentUser.uid);
        showOverview();
    });
});
