import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/oura';

export const fetchSleepData = async (token) => {
  try {
    console.log('🔍 Fetching sleep data with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const endDate = new Date();

    console.log('📅 Fetching sleep data for range:', {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    const response = await axios.get(`${API_BASE_URL}/sleep`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      },
    });

    console.log('📊 Sleep API Response:', {
      status: response.status,
      hasData: !!response.data,
      dataLength: response.data?.data?.length || 0
    });

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from API');
    }

    // Transform data to match our time series format
    const transformedData = response.data.data.map(sleep => {
      console.log('🛏️ Raw sleep record:', sleep);
      
      // Parse the date string and ensure it's valid
      let date;
      try {
        // Add time component if it's just a date
        const timestamp = sleep.timestamp.includes('T') ? 
          sleep.timestamp : 
          `${sleep.timestamp}T12:00:00.000Z`;
        
        date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        
        console.log('📅 Date parsing:', {
          input: sleep.timestamp,
          parsed: date.toISOString(),
          isValid: !isNaN(date.getTime())
        });
      } catch (err) {
        console.error('❌ Date parsing error:', {
          input: sleep.timestamp,
          error: err.message
        });
        return null;
      }
      
      return {
        timestamp: date.toISOString(),
        score: sleep.score,
        duration: (sleep.total_sleep_duration || sleep.duration) > 0 ? 
          (sleep.total_sleep_duration || sleep.duration) : null,
        deep_sleep_duration: sleep.deep_sleep_duration > 0 ? sleep.deep_sleep_duration : null,
        rem_sleep_duration: sleep.rem_sleep_duration > 0 ? sleep.rem_sleep_duration : null,
        light_sleep_duration: sleep.light_sleep_duration > 0 ? sleep.light_sleep_duration : null,
        efficiency: sleep.efficiency
      };
    }).filter(Boolean); // Remove any null entries from failed date parsing

    console.log('😴 Sleep data processed:', {
      dataPoints: transformedData.length,
      firstPoint: transformedData[0],
      lastPoint: transformedData[transformedData.length - 1],
      timestamp: new Date().toISOString()
    });

    return transformedData;
  } catch (error) {
    console.error('❌ Error fetching sleep data:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}; 