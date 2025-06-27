<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Friez n Burgz | Training Quiz</title>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=Futura:wght@400&family=Montserrat:wght@800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="quiz.css">
</head>
<body>

    <!-- Loading Spinner - Shown initially -->
    <div id="loading-spinner" class="loading-container">
        <div class="spinner"></div>
    </div>

    <!-- Login Prompt - Shown if user is not logged in -->
    <div id="login-prompt" class="login-prompt-container" style="display: none;">
        <div class="login-card">
            <img src="assets/logo-alt.png" alt="Friez n Burgz Logo" class="login-logo">
            <h2 class="login-title">Training Quiz</h2>
            <p>You must be logged in to view your progress and take the quiz.</p>
            <a href="/index.html" class="login-button">Proceed to Login</a>
        </div>
    </div>

    <!-- Main Content Wrapper - Shown only if user is logged in -->
    <div id="main-content-wrapper" style="display: none;">
        <div class="main-dashboard-container">
            <header class="dashboard-header">
                <div class="header-left"><img src="assets/logo.png" alt="Friez n Burgz Logo" class="header-logo"><span class="app-name">Quiz & Overview</span></div>
                <div class="header-center"><span class="current-location-display">Test Your Knowledge</span></div>
                <div class="header-right"><a href="index.html" class="join-team-btn">Return to Handbook</a></div>
            </header>
            <aside class="dashboard-sidebar">
                <nav class="sidebar-nav"><a href="index.html" class="nav-item"><i class="fas fa-book-open"></i> Return to Handbook</a></nav>
            </aside>
            <main class="dashboard-content">
                <div id="quiz-overview-container" class="quiz-view"></div>
                <div id="quiz-active-container" class="quiz-view" style="display: none;"></div>
                <div id="quiz-results-container" class="quiz-view" style="display: none;"></div>
            </main>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore-compat.js"></script>

    <script type="module" src="firebase-config.js"></script>
    <script type="module" src="training-auth.js"></script>
    <script type="module" src="quiz.js"></script>
    
</body>
</html>
