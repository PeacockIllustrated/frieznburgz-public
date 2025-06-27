// --- staff-training/quiz.js ---

document.addEventListener('DOMContentLoaded', () => {
    // --- QUESTION BANK ---
    const questionBank = [
        { section: "Preparation", question: "What is the correct cash float amount at the start of a shift?", options: ["£100", "£150", "£200", "£50"], answer: "£150" },
        { section: "Preparation", question: "What does FIFO stand for when stocking fridges?", options: ["Find It First, Organize", "First In, First Out", "Fill In, Fill Out", "Fast In, Fast Out"], answer: "First In, First Out" },
        { section: "Service", question: "What is the first thing you should do when a customer approaches the counter?", options: ["Ask for their order", "Check the pass for food", "Smile and greet them", "Wipe the counter"], answer: "Smile and greet them" },
        { section: "Service", question: "When upselling, what popular extra should you offer with a burger?", options: ["Extra cheese", "Bacon or pastrami", "A different bun", "Extra pickles"], answer: "Bacon or pastrami" },
        { section: "Service", question: "If multiple burger boxes are on the pass, what should a cashier do first?", options: ["Call out all order numbers", "Start taking a new order", "Finish the current order, then pass out food", "Ask the kitchen for help"], answer: "Finish the current order, then pass out food" },
        { section: "Everyday Rules", question: "When are you allowed to use your mobile phone during work hours?", options: ["Any time it's quiet", "Only in the back", "Only during your designated break", "Never"], answer: "Only during your designated break" },
        { section: "Everyday Rules", question: "Which items are NOT included in the free staff meal?", options: ["Fries and a drink", "A classic burger", "Coffee and water", "Cheesecakes and milkshakes"], answer: "Cheesecakes and milkshakes" },
        { section: "Preparation", question: "How often should milkshake machines be cleaned according to the handbook?", options: ["Every day", "Once a week", "Twice a week (Monday/Thursday)", "Once a month"], answer: "Twice a week (Monday/Thursday)" },
        { section: "Service", question: "After a customer chooses corn bites, what should you ask them?", options: ["If they want sauce", "If they want spicy or plain", "If they want a fork", "If that completes their order"], answer: "If they want spicy or plain" },
        { section: "Performance", question: "What score is considered 'Excellent' and eligible for bonuses in the performance evaluation?", options: ["70-79 points", "80-89 points", "90-100 points", "100+ points"], answer: "90-100 points" },
        { section: "Disciplinary", question: "What is the first step in the disciplinary action process for a minor infraction?", options: ["Written Warning", "Final Warning", "Termination", "Verbal Warning"], answer: "Verbal Warning" },
        { section: "Service", question: "What must be updated daily when a new special item is launched?", options: ["The menu board", "The allergen sheets", "The price list", "The staff rota"], answer: "The allergen sheets" },
        { section: "Preparation", question: "Where is the 'Backup Small Fridge' located?", options: ["In the main kitchen", "Next to the front door", "Under the milkshake machine", "Outside"], answer: "Under the milkshake machine" },
        { section: "Service", question: "What is the maximum shelf life for a Strawberry Cheesecake?", options: ["1 day", "3 days", "5 days", "7 days"], answer: "3 days" },
        { section: "Service", question: "How many days can an Oreo Cheesecake's shelf life be extended by?", options: ["It cannot be extended", "By 1 more day", "By 3 more days", "By 7 more days"], answer: "By 3 more days" },
    ];
    const QUIZ_LENGTH = 8;

    // --- DOM ELEMENT SELECTION ---
    const overviewContainer = document.getElementById('quiz-overview-container');
    const activeQuizContainer = document.getElementById('quiz-active-container');
    const resultsContainer = document.getElementById('quiz-results-container');
    
    // Overview elements
    const progressBar = document.getElementById('handbook-progress-bar');
    const progressText = document.getElementById('handbook-progress-text');
    const attemptsCountText = document.getElementById('quiz-attempts-count');
    const quizLogList = document.getElementById('quiz-log-list');
    const startQuizBtn = document.getElementById('start-quiz-btn');

    // Active Quiz elements
    const quizProgressIndicator = document.getElementById('quiz-progress-indicator');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('quiz-options-container');
    const nextQuestionBtn = document.getElementById('next-question-btn');

    // Results elements
    const finalScoreText = document.getElementById('final-score-text');
    const resultsMessage = document.getElementById('results-message');
    const returnToOverviewBtn = document.getElementById('return-to-overview-btn');

    // --- STATE & STORAGE ---
    const HANDBOOK_STORAGE_KEY = 'fnb_training_progress';
    const QUIZ_STORAGE_KEY = 'fnb_quiz_history';
    let currentQuizQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // --- FUNCTIONS ---

    // Function to render the main overview screen
    function renderOverview() {
        // 1. Calculate and display handbook progress
        const savedProgress = localStorage.getItem(HANDBOOK_STORAGE_KEY);
        const progressData = savedProgress ? JSON.parse(savedProgress) : {};
        const totalSections = document.querySelectorAll('.accordion-item').length;
        const completedSections = Object.values(progressData).filter(Boolean).length;
        const percentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
        
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}% Complete (${completedSections} / ${totalSections} sections read)`;

        // 2. Load and display quiz history
        const savedHistory = localStorage.getItem(QUIZ_STORAGE_KEY);
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        attemptsCountText.textContent = history.length;
        quizLogList.innerHTML = '';
        if (history.length === 0) {
            quizLogList.innerHTML = '<li>No quiz history found.</li>';
        } else {
            history.slice().reverse().forEach(attempt => {
                const li = document.createElement('li');
                const date = new Date(attempt.timestamp).toLocaleString();
                li.innerHTML = `<span class="log-score">Score: ${attempt.score}/${attempt.total}</span> <span class="log-timestamp">${date}</span>`;
                quizLogList.appendChild(li);
            });
        }

        // 3. Show the overview container
        overviewContainer.style.display = 'block';
        activeQuizContainer.style.display = 'none';
        resultsContainer.style.display = 'none';
    }

    // Function to start a new quiz
    function startQuiz() {
        // Reset state
        currentQuestionIndex = 0;
        score = 0;
        
        // Shuffle question bank and pick 8 questions
        const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
        currentQuizQuestions = shuffled.slice(0, QUIZ_LENGTH);
        
        // Switch views
        overviewContainer.style.display = 'none';
        activeQuizContainer.style.display = 'block';
        
        displayQuestion();
    }
    
    // Function to display the current question
    function displayQuestion() {
        nextQuestionBtn.style.display = 'none';
        optionsContainer.innerHTML = ''; // Clear previous options
        
        const questionData = currentQuizQuestions[currentQuestionIndex];
        
        quizProgressIndicator.textContent = `Question ${currentQuestionIndex + 1} of ${QUIZ_LENGTH}`;
        questionText.textContent = questionData.question;
        
        questionData.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'quiz-option-btn';
            button.textContent = option;
            button.addEventListener('click', selectAnswer);
            optionsContainer.appendChild(button);
        });
    }

    // Function to handle answer selection
    function selectAnswer(e) {
        const selectedButton = e.target;
        const correctAnswer = currentQuizQuestions[currentQuestionIndex].answer;

        // Disable all buttons after one is clicked
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = true;
            // Reveal the correct answer
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            }
        });

        // Mark the selected answer
        if (selectedButton.textContent === correctAnswer) {
            score++;
            selectedButton.classList.add('correct');
        } else {
            selectedButton.classList.add('incorrect');
        }

        nextQuestionBtn.style.display = 'block';
    }

    // Function to move to the next question or show results
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < QUIZ_LENGTH) {
            displayQuestion();
        } else {
            showResults();
        }
    }

    // Function to display the final results
    function showResults() {
        activeQuizContainer.style.display = 'none';
        resultsContainer.style.display = 'block';

        finalScoreText.textContent = `${score} / ${QUIZ_LENGTH}`;
        if (score / QUIZ_LENGTH >= 0.8) {
            resultsMessage.textContent = "Excellent work! You're a Friez & Burgz pro!";
        } else if (score / QUIZ_LENGTH >= 0.5) {
            resultsMessage.textContent = "Good job! A quick review of the handbook will make you an expert.";
        } else {
            resultsMessage.textContent = "Nice try! We recommend reviewing the handbook again to master the material.";
        }

        // Save the result to localStorage
        const savedHistory = localStorage.getItem(QUIZ_STORAGE_KEY);
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        history.push({
            score: score,
            total: QUIZ_LENGTH,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(history));
    }


    // --- EVENT LISTENERS ---
    startQuizBtn.addEventListener('click', startQuiz);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    returnToOverviewBtn.addEventListener('click', renderOverview);
    
    // --- INITIALIZATION ---
    renderOverview();
});
