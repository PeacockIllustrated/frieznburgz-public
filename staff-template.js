// --- staff-template.js ---
// Provides HTML templating for the Staff Management page components.

/**
 * Generates the HTML for a single staff member card.
 * @param {Object} staff - The merged staff and progress data object.
 * @returns {string} The HTML string for a staff card.
 */
export function createStaffCardHtml(staff) {
    const isTrainingComplete = staff.handbookCompletion === 100;
    
    return `
        <div class="staff-card">
            <div class="staff-card-header">
                <h4 class="staff-name">${staff.name}</h4>
                <span class="staff-role">${staff.role || 'Employee'}</span>
            </div>
            <div class="staff-card-body">
                <div class="staff-contact-info">
                    <p><i class="fas fa-envelope"></i> ${staff.email}</p>
                    <p><i class="fas fa-phone"></i> ${staff.phone}</p>
                    <p><i class="fas fa-calendar-alt"></i> Start Date: ${staff.startDate}</p>
                </div>
                <hr>
                <div class="staff-training-info">
                    <div class="training-metric">
                        <label>Handbook Completion</label>
                        <div class="training-progress-bar">
                            <div class="progress-fill ${isTrainingComplete ? 'complete' : ''}" style="width: ${staff.handbookCompletion}%;"></div>
                        </div>
                        <span>${staff.handbookCompletion}%</span>
                    </div>
                    <div class="training-metric">
                        <label>Avg. Quiz Score</label>
                        <div class="training-progress-bar">
                             <div class="progress-fill" style="width: ${staff.averageQuizScore}%;"></div>
                        </div>
                        <span>${staff.averageQuizScore}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}
