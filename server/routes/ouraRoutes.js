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

router.get('/sleep', async (req, res) => {
  try {
    console.log('🔄 Proxying sleep request to Oura API');
    const { start_date, end_date } = req.query;
    const ouraToken = req.headers.authorization?.split(' ')[1];

    if (!ouraToken) {
      console.error('❌ No Oura token provided');
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    console.log('📅 Fetching sleep data for range:', {
      start: start_date,
      end: end_date
    });

    // First, get the detailed sleep data
    const sleepResponse = await axios.get('https://api.ouraring.com/v2/usercollection/sleep', {
      headers: {
        Authorization: `Bearer ${ouraToken}`,
      },
      params: {
        start_date,
        end_date,
      },
    });

    // Then, get the daily sleep scores
    const dailyResponse = await axios.get('https://api.ouraring.com/v2/usercollection/daily_sleep', {
      headers: {
        Authorization: `Bearer ${ouraToken}`,
      },
      params: {
        start_date,
        end_date,
      },
    });

    console.log('📊 Raw Sleep API Responses:', {
      sleepStatus: sleepResponse.status,
      dailyStatus: dailyResponse.status,
      sleepSample: sleepResponse.data?.data[0],
      dailySample: dailyResponse.data?.data[0],
      sleepDataPoints: sleepResponse.data?.data?.length || 0,
      dailyDataPoints: dailyResponse.data?.data?.length || 0
    });

    // Create a map of daily scores
    const dailyScores = new Map(
      dailyResponse.data.data.map(item => [
        item.day,
        item.score
      ])
    );

    // Transform the data to match our expected format
    const transformedData = {
      data: sleepResponse.data.data
        .map(item => {
          try {
            const day = item.bedtime_start ? 
              new Date(item.bedtime_start).toISOString().split('T')[0] : 
              item.day;
            
            // Create a proper date object at noon UTC
            const timestamp = new Date(`${day}T12:00:00.000Z`);
            
            if (isNaN(timestamp.getTime())) {
              console.warn('⚠️ Invalid date found:', { item });
              return null;
            }

            const total_sleep_duration = Math.round((item.total_sleep_duration || item.duration) / 60);
            const deep_sleep_duration = Math.round((item.deep_sleep_duration || item.deep_sleep) / 60);
            const rem_sleep_duration = Math.round((item.rem_sleep_duration || item.rem_sleep) / 60);
            const light_sleep_duration = Math.round((item.light_sleep_duration || item.light_sleep) / 60);

            if (isNaN(total_sleep_duration) || isNaN(deep_sleep_duration) || 
                isNaN(rem_sleep_duration) || isNaN(light_sleep_duration)) {
              console.warn('⚠️ Invalid duration values found:', { item });
              return null;
            }

            console.log('🛏️ Processing sleep item:', {
              originalDay: day,
              formattedTimestamp: timestamp.toISOString(),
              score: dailyScores.get(day),
              durations: {
                total: total_sleep_duration,
                deep: deep_sleep_duration,
                rem: rem_sleep_duration,
                light: light_sleep_duration
              },
              raw: JSON.stringify(item, null, 2)
            });
            
            return {
              timestamp: timestamp.toISOString(),
              score: dailyScores.get(day),
              total_sleep_duration: total_sleep_duration > 0 ? total_sleep_duration : null,
              deep_sleep_duration: deep_sleep_duration > 0 ? deep_sleep_duration : null,
              rem_sleep_duration: rem_sleep_duration > 0 ? rem_sleep_duration : null,
              light_sleep_duration: light_sleep_duration > 0 ? light_sleep_duration : null,
              efficiency: item.efficiency || item.sleep_efficiency
            };
          } catch (err) {
            console.warn('⚠️ Error processing sleep item:', { 
              error: err.message,
              item 
            });
            return null;
          }
        })
        .filter(Boolean) // Remove null entries
    };

    console.log('✨ Transformed Sleep Data:', {
      firstItem: transformedData.data[0],
      lastItem: transformedData.data[transformedData.data.length - 1],
      totalItems: transformedData.data.length,
      allItems: transformedData.data
    });

    res.json(transformedData);
  } catch (error) {
    console.error('❌ Error proxying sleep request:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      error: error
    });
    
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch sleep data'
    });
  }
});

module.exports = router; 