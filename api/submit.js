const fs = require('fs');
const path = require('path');

// Simple file-based storage for submissions
const submissionsFile = path.join(__dirname, '../data/submissions.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize submissions file if it doesn't exist
if (!fs.existsSync(submissionsFile)) {
  fs.writeFileSync(submissionsFile, JSON.stringify([]));
}

module.exports = (req, res) => {
  console.log('API endpoint called:', req.method, req.url);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    console.log('Handling POST request');
    console.log('Request body:', req.body);
    
    // Handle new submission
    try {
      const { text } = req.body;
      
      console.log('Received text:', text);
      
      if (!text || !text.trim()) {
        console.log('No text provided');
        return res.status(400).json({ error: 'Text is required' });
      }

      // Read existing submissions
      const submissions = JSON.parse(fs.readFileSync(submissionsFile, 'utf8'));
      console.log('Current submissions:', submissions);
      
      // Add new submission
      const newSubmission = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        text: text.trim(),
        timestamp: Date.now()
      };
      
      submissions.push(newSubmission);
      console.log('Added new submission:', newSubmission);
      
      // Write back to file
      fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));
      
      res.status(200).json({ success: true, submission: newSubmission });
    } catch (error) {
      console.error('Error saving submission:', error);
      res.status(500).json({ error: 'Failed to save submission' });
    }
  } else if (req.method === 'GET') {
    console.log('Handling GET request');
    // Return all submissions
    try {
      const submissions = JSON.parse(fs.readFileSync(submissionsFile, 'utf8'));
      console.log('Returning submissions:', submissions);
      res.status(200).json({ submissions, count: submissions.length });
    } catch (error) {
      console.error('Error reading submissions:', error);
      res.status(500).json({ error: 'Failed to read submissions' });
    }
  } else {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 