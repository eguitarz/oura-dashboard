const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/heartrate', async (req, res) => {
  try {
    console.log('🔄 Proxying heart rate request to Oura API');
    const { start_datetime, end_datetime } = req.query;
    const ouraToken = req.headers.authorization?.split(' ')[1];

    if (!ouraToken) {
      console.error('❌ No Oura token provided');
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    console.log('📅 Fetching data for range:', {
      start: start_datetime,
      end: end_datetime
    });

    const response = await axios.get('https://api.ouraring.com/v2/usercollection/heartrate', {
      headers: {
        Authorization: `Bearer ${ouraToken}`,
      },
      params: {
        start_datetime,
        end_datetime,
      },
    });

    console.log('✅ Successfully fetched heart rate data:', {
      status: response.status,
      dataPoints: response.data?.data?.length || 0
    });

    res.json(response.data);
  } catch (error) {
    console.error('❌ Error proxying heart rate request:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch heart rate data'
    });
  }
});

module.exports = router; 