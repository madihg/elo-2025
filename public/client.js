// API-based solution for real-time collaborative submissions
let submissions = [];
let lastSubmissionCount = 0;

async function submitSentence() {
    const userInput = document.getElementById('userInput');
    const text = userInput.value.trim();
    
    if (!text) return;
    
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        if (response.ok) {
            const result = await response.json();
            userInput.value = ''; // Clear input
            await loadSubmissions(); // Refresh submissions
        } else {
            console.error('Failed to submit');
        }
    } catch (error) {
        console.error('Error submitting:', error);
    }
}

async function loadSubmissions() {
    try {
        const response = await fetch('/api/submit');
        if (response.ok) {
            const data = await response.json();
            submissions = data.submissions;
            displaySubmissions();
            updateUserCount(data.count);
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

function displaySubmissions() {
    const submissionsDiv = document.getElementById('submissions');
    submissionsDiv.innerHTML = ''; // Clear existing
    
    submissions.forEach(submission => {
        const sentenceDiv = document.createElement('div');
        sentenceDiv.textContent = submission.text;
        sentenceDiv.style.margin = '10px 0';
        sentenceDiv.style.padding = '10px';
        sentenceDiv.style.backgroundColor = '#f0f0f0';
        sentenceDiv.style.borderRadius = '5px';
        sentenceDiv.style.borderLeft = '4px solid #007bff';
        submissionsDiv.appendChild(sentenceDiv);
    });
}

function updateUserCount(count) {
    const userCountElement = document.getElementById('userCount');
    if (userCountElement) {
        userCountElement.textContent = `${count} contribution(s)`;
    }
}

// Load submissions when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSubmissions();
    
    // Poll for new submissions every 3 seconds
    setInterval(async () => {
        try {
            const response = await fetch('/api/submit');
            if (response.ok) {
                const data = await response.json();
                
                // Check if there are new submissions
                if (data.count > lastSubmissionCount) {
                    submissions = data.submissions;
                    displaySubmissions();
                    updateUserCount(data.count);
                    lastSubmissionCount = data.count;
                }
            }
        } catch (error) {
            console.error('Error polling for updates:', error);
        }
    }, 3000);
});
