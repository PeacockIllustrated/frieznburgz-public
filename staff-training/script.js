// --- staff-training/script.js (Interactive Version) ---

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTION ---
    const navContainer = document.querySelector('.handbook-nav');
    const navLinks = document.querySelectorAll('.handbook-nav .nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const handbookContent = document.querySelector('.handbook-content');

    // --- STATE MANAGEMENT ---
    const STORAGE_KEY = 'fnb_training_progress';
    let trainingProgress = {};

    // Load progress from localStorage
    const loadProgress = () => {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        trainingProgress = savedProgress ? JSON.parse(savedProgress) : {};

        // Apply visual state based on loaded progress
        Object.keys(trainingProgress).forEach(accordionId => {
            if (trainingProgress[accordionId]) {
                const accordionItem = document.querySelector(`[data-accordion-id="${accordionId}"]`);
                if (accordionItem) {
                    accordionItem.querySelector('.accordion-header').classList.add('is-read');
                    const button = accordionItem.querySelector('.mark-as-read-btn');
                    if (button) {
                        button.classList.add('completed');
                        button.textContent = 'Completed ✔';
                        button.disabled = true;
                    }
                }
            }
        });
        updateMainSectionChecks();
    };

    // Save progress to localStorage
    const saveProgress = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trainingProgress));
    };

    // --- UI FUNCTIONS ---

    // Function to show a main content section
    const showMainSection = (targetId) => {
        // Hide all main sections
        contentSections.forEach(section => section.style.display = 'none');
        // Show the target one
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    };

    // Function to update the 'active' state of sidebar links
    const updateActiveNavLink = (targetId) => {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.target === targetId);
        });
    };
    
    // Check if all accordions in a main section are read and update the sidebar
    const updateMainSectionChecks = () => {
        contentSections.forEach(section => {
            const sectionId = section.id;
            const accordions = section.querySelectorAll('.accordion-item');
            if (accordions.length === 0) return; // Skip sections with no accordions

            const allRead = Array.from(accordions).every(item => {
                const accordionId = item.dataset.accordionId;
                return trainingProgress[accordionId] === true;
            });
            
            const mainNavLink = document.querySelector(`.nav-link[data-target="${sectionId}"]`);
            if(mainNavLink) {
                mainNavLink.parentElement.classList.toggle('is-read', allRead);
            }
        });
    };

    // --- EVENT LISTENERS ---

    // 1. Sidebar Navigation (Event Delegation)
    navContainer.addEventListener('click', (event) => {
        const clickedLink = event.target.closest('a.nav-link');
        if (!clickedLink) return;

        event.preventDefault();
        const targetId = clickedLink.dataset.target;
        
        showMainSection(targetId);
        updateActiveNavLink(targetId);
    });

    // 2. Accordion and "Mark as Read" clicks (Event Delegation on content area)
    handbookContent.addEventListener('click', (event) => {
        const target = event.target;

        // Handle Accordion Header clicks
        if (target.matches('.accordion-header, .accordion-header *')) {
            const accordionItem = target.closest('.accordion-item');
            if (accordionItem) {
                accordionItem.classList.toggle('active');
            }
        }

        // Handle "Mark as Read" button clicks
        if (target.matches('.mark-as-read-btn') && !target.disabled) {
            const accordionId = target.dataset.accordionId;
            const accordionItem = target.closest('.accordion-item');
            
            // Update state
            trainingProgress[accordionId] = true;
            saveProgress();

            // Update UI
            target.classList.add('completed');
            target.textContent = 'Completed ✔';
            target.disabled = true;
            accordionItem.querySelector('.accordion-header').classList.add('is-read');

            // Check if the parent section is now fully complete
            updateMainSectionChecks();
        }
    });


    // --- INITIALIZATION ---
    const initializePage = () => {
        // Set initial view: show first section, activate first link
        showMainSection(navLinks[0].dataset.target);
        updateActiveNavLink(navLinks[0].dataset.target);
        
        // Load and apply any saved progress
        loadProgress();
    };

    initializePage();
});
