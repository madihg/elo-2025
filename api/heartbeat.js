// Track active users for the collaborative app
let activeUsers = new Map(); // userId -> lastSeen timestamp

module.exports = (req, res) => {
  console.log('Heartbeat endpoint called:', req.method, req.url);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Update user's last seen timestamp
      activeUsers.set(userId, Date.now());
      
      // Clean up inactive users (haven't been seen in 2 minutes)
      const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
      for (const [id, lastSeen] of activeUsers.entries()) {
        if (lastSeen < twoMinutesAgo) {
          activeUsers.delete(id);
        }
      }
      
      console.log('Active users:', activeUsers.size);
      
      res.status(200).json({ 
        success: true, 
        activeUsers: activeUsers.size 
      });
    } catch (error) {
      console.error('Error in heartbeat:', error);
      res.status(500).json({ error: 'Failed to process heartbeat' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 