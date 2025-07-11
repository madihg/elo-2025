// Simple localStorage-based solution for Vercel
let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
let userCount = parseInt(localStorage.getItem('userCount') || '0');

function submitSentence() {
    const userInput = document.getElementById('userInput').value;
    if (userInput.trim()) {
        // Add timestamp for uniqueness
        const submission = {
            text: userInput,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        };
        
        submissions.push(submission);
        localStorage.setItem('submissions', JSON.stringify(submissions));
        
        // Update user count
        userCount++;
        localStorage.setItem('userCount', userCount.toString());
        
        // Display the submission immediately
        displaySubmission(submission);
        
        // Clear input
        document.getElementById('userInput').value = '';
        
        // Update user count display
        updateUserCount();
    }
}

function displaySubmission(submission) {
    const submissionsDiv = document.getElementById('submissions');
    const sentenceDiv = document.createElement('div');
    sentenceDiv.textContent = submission.text;
    sentenceDiv.style.margin = '10px 0';
    sentenceDiv.style.padding = '10px';
    sentenceDiv.style.backgroundColor = '#f0f0f0';
    sentenceDiv.style.borderRadius = '5px';
    submissionsDiv.appendChild(sentenceDiv);
}

function updateUserCount() {
    document.getElementById('userCount').textContent = `${userCount} other(s)`;
}

function loadExistingSubmissions() {
    submissions.forEach(submission => {
        displaySubmission(submission);
    });
    updateUserCount();
}

// Load existing submissions when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadExistingSubmissions();
    
    // Poll for new submissions every 2 seconds
    setInterval(() => {
        const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const storedUserCount = parseInt(localStorage.getItem('userCount') || '0');
        
        // Check for new submissions
        if (storedSubmissions.length > submissions.length) {
            const newSubmissions = storedSubmissions.slice(submissions.length);
            newSubmissions.forEach(submission => {
                displaySubmission(submission);
            });
            submissions = storedSubmissions;
        }
        
        // Update user count if changed
        if (storedUserCount !== userCount) {
            userCount = storedUserCount;
            updateUserCount();
        }
    }, 2000);
});
