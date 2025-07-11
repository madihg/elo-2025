// In-memory storage for Vercel serverless compatibility
let submissions = [];
let submissionCount = 0;
let activeUsers = new Map(); // userId -> lastSeen timestamp

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
      const { text, userId } = req.body;
      
      console.log('Received text:', text);
      console.log('User ID:', userId);
      
      if (!text || !text.trim()) {
        console.log('No text provided');
        return res.status(400).json({ error: 'Text is required' });
      }

      // Update user's last seen timestamp
      if (userId) {
        activeUsers.set(userId, Date.now());
      }

      // Clean up inactive users (haven't been seen in 2 minutes)
      const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
      for (const [id, lastSeen] of activeUsers.entries()) {
        if (lastSeen < twoMinutesAgo) {
          activeUsers.delete(id);
        }
      }

      // Add new submission to in-memory array
      const newSubmission = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        text: text.trim(),
        timestamp: Date.now(),
        userId: userId
      };
      
      submissions.push(newSubmission);
      submissionCount++;
      
      console.log('Added new submission:', newSubmission);
      console.log('Total submissions:', submissions.length);
      console.log('Active users:', activeUsers.size);
      
      res.status(200).json({ 
        success: true, 
        submission: newSubmission,
        activeUsers: activeUsers.size
      });
    } catch (error) {
      console.error('Error saving submission:', error);
      res.status(500).json({ error: 'Failed to save submission' });
    }
  } else if (req.method === 'GET') {
    console.log('Handling GET request');
    // Return all submissions
    try {
      // Clean up inactive users
      const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
      for (const [id, lastSeen] of activeUsers.entries()) {
        if (lastSeen < twoMinutesAgo) {
          activeUsers.delete(id);
        }
      }
      
      console.log('Returning submissions:', submissions);
      console.log('Active users:', activeUsers.size);
      res.status(200).json({ 
        submissions, 
        count: submissions.length,
        activeUsers: activeUsers.size
      });
    } catch (error) {
      console.error('Error reading submissions:', error);
      res.status(500).json({ error: 'Failed to read submissions' });
    }
  } else {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 