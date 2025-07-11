// API-based solution for real-time collaborative submissions
let submissions = [];
let lastSubmissionCount = 0;

async function submitSentence() {
    console.log('submitSentence function called');
    const userInput = document.getElementById('userInput');
    const text = userInput.value.trim();
    
    console.log('Text to submit:', text);
    
    if (!text) {
        console.log('No text to submit');
        return;
    }
    
    try {
        console.log('Sending POST request to /api/submit');
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Submit result:', result);
            userInput.value = ''; // Clear input
            await loadSubmissions(); // Refresh submissions
        } else {
            console.error('Failed to submit, status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Error submitting:', error);
    }
}

async function loadSubmissions() {
    console.log('Loading submissions...');
    try {
        const response = await fetch('/api/submit');
        console.log('Load response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Loaded data:', data);
            submissions = data.submissions;
            displaySubmissions();
            updateUserCount(data.count);
        } else {
            console.error('Failed to load submissions, status:', response.status);
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

function displaySubmissions() {
    console.log('Displaying submissions:', submissions);
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
    console.log('Page loaded, initializing...');
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
