import { db } from '../../firebase.js';
import { createProceduresPageLayout, renderProcedure } from './procedures-template.js';

export async function renderProceduresPage() {
    const pageContainer = document.getElementById('procedures-page');
    if (!pageContainer) {
        console.error("Procedures page container not found.");
        return;
    }

    pageContainer.innerHTML = createProceduresPageLayout();
    const contentContainer = document.getElementById('procedures-content');
    contentContainer.innerHTML = '<p class="loading-message">Loading procedures...</p>';

    try {
        const modulesSnapshot = await db.collection('trainingModules').get();
        if (modulesSnapshot.empty) {
            contentContainer.innerHTML = '<p class="error-message">No procedures found.</p>';
            return;
        }

        let proceduresHtml = '';
        modulesSnapshot.forEach(doc => {
            const procedure = doc.data();
            proceduresHtml += renderProcedure(procedure);
        });

        contentContainer.innerHTML = proceduresHtml;
    } catch (error) {
        console.error("Error fetching procedures:", error);
        contentContainer.innerHTML = '<p class="error-message">Could not load procedures. Please check your connection.</p>';
    }
}
