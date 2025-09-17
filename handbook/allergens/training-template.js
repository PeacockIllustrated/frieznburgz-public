import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

export function createTrainingPageLayout() {
    return `
        <div class="handbook-page">
            <header class="handbook-header">
                <h2 class="page-title">Allergen Training</h2>
            </header>
            <div id="training-modules"></div>
            <div id="quiz-container"></div>
        </div>
    `;
}

export function renderTrainingModule(module) {
    let contentHtml;
    switch (module.type) {
        case 'markdown':
            contentHtml = marked(module.content);
            break;
        case 'script':
        case 'checklist':
            contentHtml = `<pre>${module.content}</pre>`;
            break;
        default:
            contentHtml = `<p>Unsupported content type.</p>`;
    }

    return `
        <div class="training-module">
            <h3>${module.title}</h3>
            <div class="training-content">
                ${contentHtml}
            </div>
        </div>
    `;
}

export function renderQuiz(quizData) {
    return `
        <div id="quiz-overview-container" class="quiz-view">
            <h2 class="page-title">${quizData.title}</h2>
            <div class="quiz-actions">
                <button id="start-quiz-btn" class="quiz-start-button">Start The Quiz</button>
                <button id="acknowledge-btn" class="quiz-acknowledge-button">Acknowledge without Quiz</button>
            </div>
        </div>
        <div id="quiz-active-container"></div>
    `;
}

export function renderQuizResults(score, total) {
    const percentage = total > 0 ? (score / total) * 100 : 0;
    let message = "Good job! A quick review will help.";
    if (percentage >= 80) {
        message = "Excellent work!";
    }

    return `
        <div id="quiz-results-container" class="quiz-view">
            <h2 class="page-title">Quiz Complete!</h2>
            <div class="results-summary">
                <p>Your Score:</p>
                <h3 id="final-score-text">${score} / ${total}</h3>
                <p id="results-message">${message}</p>
            </div>
            <p>Your acknowledgement has been recorded.</p>
        </div>
    `;
}
