// --- staff-training/script.js (Stage 2: Firebase Integration) ---

import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTION ---
    const navContainer = document.querySelector('.sidebar-nav');
    const mainContentContainer = document.getElementById('handbook-content-main');

    // --- STATE MANAGEMENT ---
    let currentUser = null;
    let trainingProgress = {};
    let progressDocRef = null;

    const handbookData = {
        introduction: {
            title: "Introduction",
            accordions: {
                "intro-welcome": { title: "Welcome to Friez&Burgz!", content: "<p>As a front staff member, you are the face of our restaurant... This handbook provides clear instructions for your daily work.</p>" },
                "intro-overview": { title: "Handbook Overview", content: "<p>This handbook is designed to help you work effectively... Let's deliver flawless service every day!</p>" }
            }
        },
        preparation: {
            title: "Preparation",
            accordions: {
                "prep-morning": { title: "Morning Duties (Opening)", content: "<h4>Store Environment & Music</h4><ul><li>Remove chairs, open shutters, turn on TVs, and clean glass.</li><li>Play House Chill Music, then Dance House. Ensure cash float is £150.</li></ul>" },
                "prep-night": { title: "Night Time Duties (Closing)", content: "<h4>Cleaning & Restocking</h4><ul><li>Wipe all surfaces, sweep/mop floor, empty bins.</li><li>Refill all sauce fridges using FIFO.</li></ul>" }
            }
        },
        "task-distribution": {
            title: "Task Distribution",
            accordions: {
                "task-morning": { title: "Two-Person Morning Shift", content: "<p>Fair distribution of tasks between Main Cashier and Cashier.</p><table class='task-table'>...</table>" }
            }
        },
        service: {
            title: "Service",
            accordions: {
                "service-customer": { title: "Customer Service", content: "<p>Ensure every customer feels welcomed... Always smile and maintain eye contact.</p><div class='important-box'><strong>GOAL:</strong> Every customer should leave feeling great!</div>" },
                "service-upselling": { title: "Upselling Techniques", content: "<div class='sales-script-box'><h4>Sales Script</h4><p><strong>Greeting:</strong> “Hello! Welcome to Friez&Burgz.”</p><p><strong>Extras:</strong> “Would you like to add bacon or pastrami?”</p></div>" }
            }
        },
        "sop-visuals": {
            title: "SOP Visuals",
            accordions: {
                "sop-info": { title: "Visual Guide Information", content: "<p>The original PDF handbook contains images for key procedures. Please refer to it for visual context.</p>" }
            }
        },
        "everyday-rules": {
            title: "Everyday Rules",
            accordions: {
                "rules-all": { title: "Key Everyday Rules", content: "<h4>Mobile Phone Policy:</h4><p>No phones during work hours except on your designated 20-minute break.</p><h4>Staff Meals Policy:</h4><p>One free meal and pop per shift. Premium items not included.</p>" }
            }
        },
        "performance-eval": {
            title: "Performance Evaluation",
            accordions: {
                "eval-system": { title: "Evaluation System", content: "<ul><li><strong>90-100 pts:</strong> Excellent</li><li><strong>80-89 pts:</strong> Good</li><li><strong>70-79 pts:</strong> Needs Improvement</li><li><strong>Below 70 pts:</strong> Unsatisfactory</li></ul>" }
            }
        },
        "disciplinary-actions": {
            title: "Disciplinary Actions",
            accordions: {
                "disc-process": { title: "Disciplinary Process", content: "<ol><li>Verbal Warning</li><li>Written Warning</li><li>Final Written Warning</li><li>Termination</li></ol>" }
            }
        },
        "final-words": {
            title: "Final Words",
            accordions: {
                "final-commit": { title: "Commitment to Excellence", content: "<p><strong>CONGRATULATIONS!</strong> Your role is crucial to our success.</p><p class='emphasis-text'>We appreciate your hard work!</p><a href='quiz.html' class='quiz-link-btn'>I'm Ready! Take the Quiz →</a>" }
            }
        }
    };
    
    // --- FIREBASE FUNCTIONS ---
    const loadProgressFromFirebase = async () => {
        if (!progressDocRef) return;
        try {
            const docSnap = await progressDocRef.get();
            if (docSnap.exists()) {
                const data = docSnap.data();
                trainingProgress = data.readSections ? data.readSections.reduce((acc, val) => ({...acc, [val]: true}), {}) : {};
                console.log("Progress loaded from Firebase:", trainingProgress);
            } else {
                console.log("No progress document found for user, creating one.");
                await progressDocRef.set({ readSections: [], quizHistory: [] }); // Initialize document
            }
        } catch (error) {
            console.error("Error loading progress from Firebase:", error);
        }
    };

    const saveProgressToFirebase = async (accordionId) => {
        if (!progressDocRef) return;
        try {
            await progressDocRef.update({
                readSections: firebase.firestore.FieldValue.arrayUnion(accordionId)
            });
            console.log(`Saved progress for ${accordionId} to Firebase.`);
        } catch (error) {
            console.error("Error saving progress to Firebase:", error);
        }
    };


    // --- UI RENDERING & LOGIC ---
    const renderSectionContent = (pageId) => {
        mainContentContainer.innerHTML = ''; // Clear previous content
        const sectionData = handbookData[pageId];
        if (!sectionData) return;

        let contentHtml = `<h2 class="page-title">${sectionData.title}</h2>`;
        for (const accordionId in sectionData.accordions) {
            const accordion = sectionData.accordions[accordionId];
            const isRead = trainingProgress[accordionId] === true;
            contentHtml += `
                <div class="accordion-item" data-accordion-id="${accordionId}">
                    <div class="accordion-header ${isRead ? 'is-read' : ''}">
                        <h3>${accordion.title}</h3>
                        <i class="fas fa-check-circle accordion-read-indicator"></i>
                        <i class="fas fa-plus accordion-icon"></i>
                    </div>
                    <div class="accordion-content">
                        ${accordion.content}
                        ${!isRead ? `<button class="mark-as-read-btn" data-accordion-id="${accordionId}">Mark as Read</button>` : `<button class="mark-as-read-btn completed" disabled>Completed ✔</button>`}
                    </div>
                </div>
            `;
        }
        mainContentContainer.innerHTML = contentHtml;
    };

    const updateMainSectionChecks = () => {
        document.querySelectorAll('.nav-item').forEach(navLink => {
            const sectionId = navLink.dataset.page;
            const sectionData = handbookData[sectionId];
            if (!sectionData || !sectionData.accordions) return;

            const accordionIds = Object.keys(sectionData.accordions);
            const allRead = accordionIds.every(id => trainingProgress[id] === true);
            
            navLink.classList.toggle('is-read', allRead);
        });
    };

    // --- EVENT LISTENERS ---
    function initializeApp() {
        if (!currentUser) return;

        navContainer.addEventListener('click', (event) => {
            const clickedLink = event.target.closest('a.nav-item');
            if (!clickedLink) return;

            event.preventDefault();
            const targetId = clickedLink.dataset.page;
            
            document.querySelectorAll('.nav-item').forEach(link => link.classList.remove('active'));
            clickedLink.classList.add('active');
            
            renderSectionContent(targetId);
        });

        mainContentContainer.addEventListener('click', async (event) => {
            const target = event.target;

            if (target.matches('.accordion-header, .accordion-header *')) {
                const accordionItem = target.closest('.accordion-item');
                if (accordionItem) accordionItem.classList.toggle('active');
            }

            if (target.matches('.mark-as-read-btn') && !target.disabled) {
                const accordionId = target.dataset.accordionId;
                
                trainingProgress[accordionId] = true;
                await saveProgressToFirebase(accordionId);

                target.classList.add('completed');
                target.textContent = 'Completed ✔';
                target.disabled = true;
                target.closest('.accordion-item').querySelector('.accordion-header').classList.add('is-read');

                updateMainSectionChecks();
            }
        });

        // Initial render
        document.querySelector('.nav-item').click(); // Simulate click on the first nav item
        updateMainSectionChecks();
    }

    // --- ENTRY POINT ---
    // Listen for the custom event from training-auth.js
    document.addEventListener('userAuthenticated', async (event) => {
        currentUser = event.detail.user;
        progressDocRef = db.collection('users').doc(currentUser.uid).collection('progress').doc('handbook');
        
        await loadProgressFromFirebase();
        initializeApp();
    });
});
