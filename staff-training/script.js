// --- staff-training/script.js (Definitive Final Version) ---

import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM ELEMENTS
    const navContainer = document.querySelector('.sidebar-nav');
    const mainContentContainer = document.getElementById('handbook-content-main');

    // STATE
    let currentUser = null;
    let progressDocRef = null;
    let trainingProgress = { readSections: [], quizHistory: [] };

    // DATA
    const handbookData = {
        introduction: { title: "Introduction", icon: "fa-book-open", accordions: {
            "intro-welcome": { title: "Welcome to Friez&Burgz!", content: "<p>As a front staff member, you are the face of our restaurant, ensuring that every customer receives outstanding service. Your role is essential in creating a smooth and enjoyable customer experience.</p>" },
            "intro-overview": { title: "Handbook Overview", content: "<p>This handbook is designed to help you work effectively. By following these instructions, you will contribute to maintaining the high standards of Friez&Burgz.</p><p class='emphasis-text'>Let's work together to deliver fast, friendly, and flawless service every day!</p>" }
        }},
        preparation: { title: "Preparation", icon: "fa-clipboard-list", accordions: {
            "prep-morning": { title: "Morning Duties (Opening)", content: "<h4>Store Environment & Music</h4><ul><li>Remove chairs, open shutters, turn on TVs, and clean glass.</li><li>Play House Chill Music, then Dance House. Ensure cash float is £150.</li></ul>" },
            "prep-night": { title: "Night Time Duties (Closing)", content: "<h4>Cleaning & Restocking</h4><ul><li>Wipe all surfaces, sweep/mop floor, empty bins.</li><li>Refill all sauce fridges using FIFO.</li></ul>" }
        }},
        "task-distribution": { title: "Task Distribution", icon: "fa-users", accordions: {
            "task-morning": { title: "Two-Person Morning Shift", content: "<p>Fair distribution of tasks between Main Cashier and Cashier.</p><table class='task-table'><thead><tr><th>Task</th><th>Main Cashier</th><th>Cashier</th></tr></thead><tbody><tr><td>Verify till & float</td><td><i class='fas fa-check'></i></td><td></td></tr><tr><td>Ensure machines are on</td><td><i class='fas fa-check'></i></td><td></td></tr><tr><td>Check temps & allergens</td><td><i class='fas fa-check'></i></td><td></td></tr><tr><td>Remove chairs & Open shutters</td><td></td><td><i class='fas fa-check'></i></td></tr><tr><td>Prepare milkshake mixes</td><td></td><td><i class='fas fa-check'></i></td></tr></tbody></table>" }
        }},
        service: { title: "Service", icon: "fa-concierge-bell", accordions: {
            "service-customer": { title: "Customer Service", content: "<p>Ensure every customer feels welcomed, valued, and satisfied. Always smile, maintain eye contact, and use a warm, friendly tone.</p><div class='important-box'><strong>GOAL:</strong> Every customer should leave feeling great!</div>" },
            "service-upselling": { title: "Upselling Techniques", content: "<div class='sales-script-box'><h4>Sales Script</h4><p><strong>Greeting:</strong> “Hello! Welcome to Friez&Burgz.”</p><p><strong>Extras:</strong> “Would you like to add bacon or pastrami?”</p></div>" }
        }},
        "sop-visuals": { title: "SOP Visuals", icon: "fa-camera-retro", accordions: {
            "sop-info": { title: "Visual Guide Information", content: "<p>The original PDF handbook contains images for key procedures. Please refer to it for visual context for tasks like End-of-Day cash float, allergen documentation, and cleaning procedures.</p>" }
        }},
        "everyday-rules": { title: "Everyday Rules", icon: "fa-gavel", accordions: {
            "rules-all": { title: "Key Everyday Rules", content: "<h4>Mobile Phone Policy:</h4><p>No phones during work hours except on your designated 20-minute break.</p><h4>Staff Meals Policy:</h4><p>One free meal and pop per shift. Premium items not included.</p>" }
        }},
        "performance-eval": { title: "Performance", icon: "fa-chart-bar", accordions: {
            "eval-system": { title: "Evaluation System", content: "<ul><li><strong>90-100 pts:</strong> Excellent</li><li><strong>80-89 pts:</strong> Good</li><li><strong>70-79 pts:</strong> Needs Improvement</li><li><strong>Below 70 pts:</strong> Unsatisfactory</li></ul>" }
        }},
        "disciplinary-actions": { title: "Disciplinary", icon: "fa-exclamation-triangle", accordions: {
            "disc-process": { title: "Disciplinary Process", content: "<ol><li>Verbal Warning</li><li>Written Warning</li><li>Final Written Warning</li><li>Termination</li></ol>" }
        }},
        "final-words": { title: "Final Words", icon: "fa-award", accordions: {
            "final-commit": { title: "Commitment to Excellence", content: "<p><strong>CONGRATULATIONS!</strong> Your role is crucial to our success.</p><p class='emphasis-text'>We appreciate your hard work!</p><a href='quiz.html' class='quiz-link-btn'>I'm Ready! Take the Quiz →</a>" }
        }}
    };
    
    // --- FIREBASE FUNCTIONS ---
    async function loadProgressFromFirebase() {
        if (!progressDocRef) return;
        try {
            const docSnap = await progressDocRef.get();
            // *** THE FIX IS HERE ***
            // Use the robust check that works with the compat library.
            if (docSnap && docSnap.exists) {
                trainingProgress = docSnap.data();
                 if (!trainingProgress.readSections) trainingProgress.readSections = [];
                 if (!trainingProgress.quizHistory) trainingProgress.quizHistory = [];
            } else {
                // If the document doesn't exist, create it.
                await progressDocRef.set({ readSections: [], quizHistory: [] });
                trainingProgress = { readSections: [], quizHistory: [] };
            }
        } catch (error) {
            console.error("Error loading progress from Firebase:", error);
        }
    }

    async function saveProgressToFirebase(accordionId) {
        if (!progressDocRef) return;
        try {
            await progressDocRef.update({
                readSections: firebase.firestore.FieldValue.arrayUnion(accordionId)
            });
        } catch (error) {
            console.error("Error saving progress to Firebase:", error);
        }
    }

    // --- UI RENDERING & LOGIC ---
    function buildNav() {
        navContainer.innerHTML = '';
        for (const sectionId in handbookData) {
            const section = handbookData[sectionId];
            const navLink = document.createElement('a');
            navLink.href = '#';
            navLink.className = 'nav-item';
            navLink.dataset.page = sectionId;
            navLink.innerHTML = `<i class="fas ${section.icon}"></i> ${section.title}<i class="fas fa-check-circle read-indicator"></i>`;
            navContainer.appendChild(navLink);
        }
    }

    function renderSectionContent(pageId) {
        mainContentContainer.innerHTML = '';
        const sectionData = handbookData[pageId];
        if (!sectionData) return;
        let contentHtml = `<h2 class="page-title">${sectionData.title}</h2>`;
        const readSections = trainingProgress.readSections || [];
        for (const accordionId in sectionData.accordions) {
            const accordion = sectionData.accordions[accordionId];
            const isRead = readSections.includes(accordionId);
            contentHtml += `<div class="accordion-item" data-accordion-id="${accordionId}"><div class="accordion-header ${isRead ? 'is-read' : ''}"><h3>${accordion.title}</h3><i class="fas fa-check-circle accordion-read-indicator"></i><i class="fas fa-plus accordion-icon"></i></div><div class="accordion-content">${accordion.content}${!isRead ? `<button class="mark-as-read-btn" data-accordion-id="${accordionId}">Mark as Read</button>` : `<button class="mark-as-read-btn completed" disabled>Completed ✔</button>`}</div></div>`;
        }
        mainContentContainer.innerHTML = contentHtml;
    }

    function updateMainSectionChecks() {
        document.querySelectorAll('.nav-item').forEach(navLink => {
            const sectionId = navLink.dataset.page;
            const sectionData = handbookData[sectionId];
            if (!sectionData || !sectionData.accordions) return;
            const accordionIds = Object.keys(sectionData.accordions);
            const allRead = trainingProgress.readSections && accordionIds.every(id => trainingProgress.readSections.includes(id));
            navLink.classList.toggle('is-read', allRead);
        });
    }

    // --- APP INITIALIZATION ---
    async function initializeApp() {
        if (!currentUser) return;
        
        buildNav();
        updateMainSectionChecks();

        navContainer.addEventListener('click', (event) => {
            const clickedLink = event.target.closest('a.nav-item');
            if (clickedLink) {
                event.preventDefault();
                const targetId = clickedLink.dataset.page;
                document.querySelectorAll('.nav-item').forEach(link => link.classList.remove('active'));
                clickedLink.classList.add('active');
                renderSectionContent(targetId);
            }
        });

        mainContentContainer.addEventListener('click', async (event) => {
            const target = event.target;
            if (target.matches('.accordion-header, .accordion-header *')) {
                const accordionItem = target.closest('.accordion-item');
                if (accordionItem) accordionItem.classList.toggle('active');
            }
            if (target.matches('.mark-as-read-btn') && !target.disabled) {
                const accordionId = target.dataset.accordionId;
                await saveProgressToFirebase(accordionId);
                if (!trainingProgress.readSections.includes(accordionId)) {
                    trainingProgress.readSections.push(accordionId);
                }
                target.classList.add('completed');
                target.textContent = 'Completed ✔';
                target.disabled = true;
                target.closest('.accordion-item').querySelector('.accordion-header').classList.add('is-read');
                updateMainSectionChecks();
            }
            if (target.matches('.quiz-link-btn')) {
                event.preventDefault();
                window.location.href = 'quiz.html';
            }
        });
        
        const firstNavLink = document.querySelector('.nav-item');
        if (firstNavLink) {
            const firstPageId = firstNavLink.dataset.page;
            firstNavLink.classList.add('active');
            renderSectionContent(firstPageId);
        }
    }

    // --- ENTRY POINT ---
    document.addEventListener('userAuthenticated', async (event) => {
        currentUser = event.detail.user;
        progressDocRef = db.collection('users').doc(currentUser.uid);
        
        await loadProgressFromFirebase();
        initializeApp();
    });
});
