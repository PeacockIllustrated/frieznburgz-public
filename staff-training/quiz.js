// --- staff-training/quiz.js (Corrected Path) ---

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
    const TOTAL_HANDBOOK_SECTIONS = 18;

    // --- DOM ELEMENT & STATE ---
    const quizContainer = document.getElementById('quiz-container');
    let currentUser = null;
    let progressDocRef = null;
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // --- TEMPLATING & LOGIC FUNCTIONS (abbreviated, no change here) ---
    const renderOverviewHTML = (progressData) => { /* ... same as before ... */ };
    const renderQuizHTML = () => { /* ... same as before ... */ };
    const renderResultsHTML = (finalScore) => { /* ... same as before ... */ };
    
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
            quizContainer.innerHTML = `<div id="quiz-overview-container" class="quiz-view"><h2 class="page-title">My Progress Overview</h2><div class="overview-grid"><div class="overview-card"><h3>Handbook Completion</h3><div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${percentage}%;"></div></div><p id="handbook-progress-text">${Math.round(percentage)}% Complete (${readSections.length} / ${TOTAL_HANDBOOK_SECTIONS} sections read)</p></div><div class="overview-card"><h3>Quiz Attempts</h3><p class="quiz-attempts-count">${history.length}</p><p>quizzes taken</p></div></div><div class="quiz-actions"><button id="start-quiz-btn" class="quiz-start-button">Start The Quiz</button></div><div class="quiz-log-container"><h3>Quiz History</h3><ul id="quiz-log-list">${logHtml}</ul></div></div>`;
            document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
        } catch (error) {
            console.error("Error showing overview:", error);
        }
    }
    function startQuiz() { /* ... same as before ... */ }
    function displayQuestion() { /* ... same as before ... */ }
    function selectAnswer(e) { /* ... same as before ... */ }
    function nextQuestion() { /* ... same as before ... */ }
    async function finishQuiz() {
        const newResult = { score, total: QUIZ_LENGTH, timestamp: new Date().toISOString() };
        if (progressDocRef) {
            await progressDocRef.update({ quizHistory: firebase.firestore.FieldValue.arrayUnion(newResult) });
        }
        quizContainer.innerHTML = `<div id="quiz-results-container" class="quiz-view"><h2 class="page-title">Quiz Complete!</h2><div class="results-summary"><p>Your Score:</p><h3>${score} / ${QUIZ_LENGTH}</h3><p>${score / QUIZ_LENGTH >= 0.8 ? "Excellent work!" : "Good job!"}</p></div><button id="return-to-overview-btn">Return to Overview</button></div>`;
        document.getElementById('return-to-overview-btn').addEventListener('click', showOverview);
    }
    
    // --- APP INITIALIZATION ---
    document.addEventListener('userAuthenticated', (event) => {
        currentUser = event.detail.user;
        // *** FIX IS HERE: Corrected the document path ***
        progressDocRef = db.collection('users').doc(currentUser.uid);
        showOverview();
    });
});
