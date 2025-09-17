import { db, auth } from '../../firebase.js';
import { createTrainingPageLayout, renderTrainingModule, renderQuiz, renderQuizResults } from './training-template.js';

let currentUser;
let quizData;
let currentQuestionIndex = 0;
let score = 0;

export async function renderTrainingPage() {
    const pageContainer = document.getElementById('training-page');
    if (!pageContainer) {
        console.error("Training page container not found.");
        return;
    }

    pageContainer.innerHTML = createTrainingPageLayout();
    const modulesContainer = document.getElementById('training-modules');
    const quizContainer = document.getElementById('quiz-container');

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            try {
                const modulesSnapshot = await db.collection('trainingModules').get();
                let modulesHtml = '';
                modulesSnapshot.forEach(doc => {
                    modulesHtml += renderTrainingModule(doc.data());
                });
                modulesContainer.innerHTML = modulesHtml;

                const quizSnapshot = await db.collection('trainingQuizzes').doc('allergens_quiz').get();
                if (quizSnapshot.exists) {
                    quizData = quizSnapshot.data();
                    quizContainer.innerHTML = renderQuiz(quizData);
                    setupQuizListeners();
                } else {
                    quizContainer.innerHTML = '<p>Quiz not found.</p>';
                }
            } catch (error) {
                console.error("Error fetching training content:", error);
                modulesContainer.innerHTML = '<p class="error-message">Could not load training content.</p>';
            }
        } else {
            pageContainer.innerHTML = '<p>Please log in to access training.</p>';
        }
    });
}

function setupQuizListeners() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.addEventListener('click', (event) => {
        if (event.target.id === 'start-quiz-btn') {
            startQuiz();
        } else if (event.target.classList.contains('quiz-option-btn')) {
            selectAnswer(event.target);
        } else if (event.target.id === 'next-question-btn') {
            nextQuestion();
        } else if (event.target.id === 'acknowledge-btn') {
            acknowledgeTraining(0, true);
        }
    });
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
}

function displayQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    const quizContainer = document.getElementById('quiz-active-container');
    if(quizContainer) {
        quizContainer.innerHTML = `
            <div class="quiz-header">
                <h2 class="page-title">${quizData.title}</h2>
                <div id="quiz-progress-indicator">Question ${currentQuestionIndex + 1} of ${quizData.questions.length}</div>
            </div>
            <div class="question-container">
                <h3 id="question-text">${question.question}</h3>
                <div class="quiz-options" id="quiz-options-container">
                    ${question.options.map(option => `<button class="quiz-option-btn">${option}</button>`).join('')}
                </div>
            </div>
            <button id="next-question-btn" style="display: none;">Next Question</button>
        `;
    }
}

function selectAnswer(targetButton) {
    const correctAnswer = quizData.questions[currentQuestionIndex].answer;
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
    if (currentQuestionIndex < quizData.questions.length) {
        displayQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = renderQuizResults(score, quizData.questions.length);
    acknowledgeTraining(score, false);
}

async function acknowledgeTraining(finalScore, skipped) {
    if (!currentUser) return;

    const acknowledgement = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        quizId: 'allergens_quiz',
        score: finalScore,
        total: skipped ? 0 : quizData.questions.length,
        skipped: skipped,
        acknowledgedAt: new Date()
    };

    try {
        await db.collection('trainingAcks').add(acknowledgement);
        console.log("Training acknowledged successfully.");
        if(skipped){
            document.getElementById('quiz-container').innerHTML = '<p>Thank you for acknowledging the training.</p>'
        }
    } catch (error) {
        console.error("Error saving acknowledgement:", error);
    }
}
