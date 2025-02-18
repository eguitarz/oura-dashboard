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