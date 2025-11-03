import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

export function createProceduresPageLayout() {
    return `
        <div class="handbook-page">
            <header class="handbook-header">
                <h2 class="page-title">Allergen Procedures & Scripts</h2>
            </header>
            <div id="procedures-content" class="procedures-container">
                <!-- Procedures will be rendered here -->
            </div>
        </div>
    `;
}

export function renderProcedure(procedure) {
    let contentHtml;
    switch (procedure.type) {
        case 'markdown':
            contentHtml = marked(procedure.content);
            break;
        case 'script':
        case 'checklist':
            contentHtml = `<pre>${procedure.content}</pre>`;
            break;
        default:
            contentHtml = `<p>Unsupported content type.</p>`;
    }

    return `
        <div class="procedure-module">
            <h3>${procedure.title}</h3>
            <div class="procedure-content">
                ${contentHtml}
            </div>
        </div>
    `;
}
