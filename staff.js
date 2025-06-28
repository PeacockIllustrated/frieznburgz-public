// --- staff.js (Final, Complete & Corrected Version) ---

import { db } from './firebase.js';
import { createStaffCardHtml } from './staff-template.js';
import { getLocationDisplayName } from './config.js';

// As per your instruction, the correct total number of sections is 12
const TOTAL_HANDBOOK_SECTIONS = 12;

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
        const [staffSnapshot, usersSnapshot] = await Promise.all([
            db.collection('staff').get(),
            db.collection('users').get()
        ]);

        const staffData = staffSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        const progressData = {};
        usersSnapshot.forEach(doc => {
            progressData[doc.id] = doc.data();
        });

        const mergedStaffData = staffData.map(staff => {
            const userProgress = progressData[staff.uid] || { readSections: [], quizHistory: [] };
            
            const handbookCompletion = (userProgress.readSections.length / TOTAL_HANDBOOK_SECTIONS) * 100;
            
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

        staffContent.innerHTML = `
            <h2 class="page-title">Staff Management</h2>
            <div id="staffListGrid" class="staff-list-grid"></div>
        `;
        const staffListGrid = document.getElementById('staffListGrid');
        if (mergedStaffData.length === 0) {
            staffListGrid.innerHTML = '<p>No staff members found.</p>';
            return;
        }

        const groupedByLocation = mergedStaffData.reduce((acc, staff) => {
            const location = staff.locationName || 'Unassigned';
            if (!acc[location]) acc[location] = [];
            acc[location].push(staff);
            return acc;
        }, {});

        staffListGrid.innerHTML = '';
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
