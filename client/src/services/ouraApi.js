import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/oura';

export const fetchHeartRate = async (token) => {
  try {
    console.log('🔍 Fetching heart rate with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endDate = new Date();

    console.log('📅 Fetching data for range:', {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });

    const response = await axios.get(`${API_BASE_URL}/heartrate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
      },
    });

    console.log('📊 API Response:', {
      status: response.status,
      hasData: !!response.data,
      dataLength: response.data?.data?.length || 0
    });

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from API');
    }

    console.log('💓 Heart rate data received:', {
      dataPoints: response.data.data.length,
      firstPoint: response.data.data[0],
      lastPoint: response.data.data[response.data.data.length - 1],
      timestamp: new Date().toISOString()
    });

    return response.data.data;
  } catch (error) {
    console.error('❌ Error fetching heart rate:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

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
    const transformedData = response.data.data.map(sleep => ({
      timestamp: new Date(sleep.day).toISOString(),
      score: sleep.score,
      efficiency: sleep.efficiency,
      duration: sleep.duration,
      deep_sleep_duration: sleep.deep_sleep_duration,
      rem_sleep_duration: sleep.rem_sleep_duration,
      light_sleep_duration: sleep.light_sleep_duration
    }));

    console.log('😴 Sleep data received:', {
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