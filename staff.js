// --- staff.js ---
// Manages the rendering and logic for the Staff Management page.

import { db } from './firebase.js';
import { createStaffCardHtml } from './staff-template.js';
import { getLocationDisplayName } from './config.js';

const TOTAL_HANDBOOK_SECTIONS = 18; // Define this constant, as it's needed for calculations

/**
 * Renders the Staff Management page.
 */
export async function renderStaffPage() {
    const staffContent = document.getElementById('staffContent');
    if (!staffContent) {
        console.error("Staff content container not found!");
        return;
    }
    staffContent.innerHTML = `<h2 class="page-title">Staff Management</h2><p>Loading staff information...</p>`;

    try {
        // Step 1: Fetch all staff HR data from the '/staff' collection
        const staffSnapshot = await db.collection('staff').get();
        const staffData = staffSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

        // Step 2: Fetch all user progress data from the '/users' collection
        const usersSnapshot = await db.collection('users').get();
        const progressData = {};
        usersSnapshot.forEach(doc => {
            progressData[doc.id] = doc.data();
        });

        // Step 3: Merge the two datasets
        const mergedStaffData = staffData.map(staff => {
            const userProgress = progressData[staff.uid] || { readSections: [], quizHistory: [] };
            
            // Calculate training completion percentage
            const handbookCompletion = (userProgress.readSections.length / TOTAL_HANDBOOK_SECTIONS) * 100;
            
            // Calculate average quiz score
            let averageQuizScore = 0;
            if (userProgress.quizHistory && userProgress.quizHistory.length > 0) {
                const totalScore = userProgress.quizHistory.reduce((sum, quiz) => sum + (quiz.score / quiz.total), 0);
                averageQuizScore = (totalScore / userProgress.quizHistory.length) * 100;
            }

            return {
                ...staff,
                locationName: getLocationDisplayName(staff.locationId),
                handbookCompletion: Math.round(handbookCompletion),
                averageQuizScore: Math.round(averageQuizScore)
            };
        });

        // Step 4: Render the page with the merged data
        staffContent.innerHTML = `
            <h2 class="page-title">Staff Management</h2>
            <div id="staffListGrid" class="staff-list-grid">
                <!-- Staff cards will be rendered here -->
            </div>
        `;
        const staffListGrid = document.getElementById('staffListGrid');
        if (mergedStaffData.length === 0) {
            staffListGrid.innerHTML = '<p>No staff members found. Add staff information in the Firestore database.</p>';
            return;
        }

        // Group staff by location
        const groupedByLocation = mergedStaffData.reduce((acc, staff) => {
            const location = staff.locationName || 'Unassigned';
            if (!acc[location]) {
                acc[location] = [];
            }
            acc[location].push(staff);
            return acc;
        }, {});

        // Render each group
        staffListGrid.innerHTML = ''; // Clear container
        for (const location in groupedByLocation) {
            const groupContainer = document.createElement('div');
            groupContainer.className = 'staff-group-container';
            groupContainer.innerHTML = `<h3 class="subsection-title">${location}</h3>`;
            
            const groupGrid = document.createElement('div');
            groupGrid.className = 'staff-group-grid';

            groupedByLocation[location].forEach(staffMember => {
                groupGrid.innerHTML += createStaffCardHtml(staffMember);
            });
            
            groupContainer.appendChild(groupGrid);
            staffListGrid.appendChild(groupContainer);
        }

    } catch (error) {
        console.error("Error rendering staff page:", error);
        staffContent.innerHTML = `<h2 class="page-title">Staff Management</h2><p style="color:red;">Error loading staff data: ${error.message}</p>`;
    }
}
