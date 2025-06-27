// --- staff-training/script.js (Final Revised Version) ---

document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.querySelector('.sidebar-nav'); // Changed selector for precision
    const navLinks = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-page');
    const handbookContent = document.querySelector('.dashboard-content'); // Changed selector

    const STORAGE_KEY = 'fnb_training_progress';
    let trainingProgress = {};

    const loadProgress = () => {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        trainingProgress = savedProgress ? JSON.parse(savedProgress) : {};

        Object.keys(trainingProgress).forEach(accordionId => {
            if (trainingProgress[accordionId]) {
                const accordionItem = document.querySelector(`[data-accordion-id="${accordionId}"]`);
                if (accordionItem) {
                    // This now targets the icon inside the accordion header
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

    const saveProgress = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trainingProgress));
    };

    const showMainSection = (targetId) => {
        contentSections.forEach(section => {
            section.classList.remove('active-page');
        });
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active-page');
        }
    };

    const updateActiveNavLink = (targetId) => {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === targetId);
        });
    };
    
    const updateMainSectionChecks = () => {
        navLinks.forEach(navLink => {
            const sectionId = navLink.dataset.page;
            const section = document.getElementById(sectionId);
            if (!section) return;

            const accordions = section.querySelectorAll('.accordion-item');
            if (accordions.length === 0) return;

            const allRead = Array.from(accordions).every(item => {
                const accordionId = item.dataset.accordionId;
                return trainingProgress[accordionId] === true;
            });
            
            navLink.classList.toggle('is-read', allRead);
        });
    };

    navContainer.addEventListener('click', (event) => {
        const clickedLink = event.target.closest('a.nav-item');
        if (!clickedLink) return;

        event.preventDefault();
        const targetId = clickedLink.dataset.page;
        
        showMainSection(targetId);
        updateActiveNavLink(targetId);
    });

    handbookContent.addEventListener('click', (event) => {
        const target = event.target;

        if (target.matches('.accordion-header, .accordion-header *')) {
            const accordionItem = target.closest('.accordion-item');
            if (accordionItem) {
                accordionItem.classList.toggle('active');
            }
        }

        if (target.matches('.mark-as-read-btn') && !target.disabled) {
            const accordionId = target.dataset.accordionId;
            const accordionItem = target.closest('.accordion-item');
            
            trainingProgress[accordionId] = true;
            saveProgress();

            target.classList.add('completed');
            target.textContent = 'Completed ✔';
            target.disabled = true;
            accordionItem.querySelector('.accordion-header').classList.add('is-read');

            updateMainSectionChecks();
        }
    });

    const initializePage = () => {
        showMainSection(navLinks[0].dataset.page);
        updateActiveNavLink(navLinks[0].dataset.page);
        loadProgress();
    };

    initializePage();
});
