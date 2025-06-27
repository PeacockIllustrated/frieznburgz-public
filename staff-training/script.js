// --- staff-training/script.js ---

document.addEventListener('DOMContentLoaded', () => {
    // Select all necessary elements once the DOM is ready
    const navContainer = document.querySelector('.handbook-nav');
    const navLinks = document.querySelectorAll('.handbook-nav .nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    // Function to set the initial state of the page
    const showInitialContent = () => {
        // Hide all content sections first
        contentSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Remove 'active' class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show the first section and activate the first link
        const firstSection = contentSections[0];
        const firstLink = navLinks[0];

        if (firstSection && firstLink) {
            firstSection.style.display = 'block';
            firstLink.classList.add('active');
        }
    };

    // Use event delegation for efficient event handling
    navContainer.addEventListener('click', (event) => {
        // Find the link that was clicked, if any
        const clickedLink = event.target.closest('a.nav-link');

        // If a link wasn't clicked, do nothing
        if (!clickedLink) {
            return;
        }

        // Prevent the default link behavior (like jumping to '#')
        event.preventDefault();

        // Get the target content ID from the link's data attribute
        const targetId = clickedLink.dataset.target;
        const targetSection = document.getElementById(targetId);

        // If the target section doesn't exist, do nothing
        if (!targetSection) {
            console.warn(`Content section with ID "${targetId}" not found.`);
            return;
        }

        // Hide all content sections
        contentSections.forEach(section => {
            section.style.display = 'none';
        });

        // Remove the 'active' class from all navigation links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show the target section and add the 'active' class to the clicked link
        targetSection.style.display = 'block';
        clickedLink.classList.add('active');
    });

    // Set the initial view when the page loads
    showInitialContent();
});
