import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchHeartRate } from '../services/ouraApi';
import { useAuth } from '../contexts/AuthContext';

const HeartRateChart = () => {
  const [heartRateData, setHeartRateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ouraToken } = useAuth();

  useEffect(() => {
    const loadHeartRateData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Starting heart rate data fetch...');
        
        if (!ouraToken) {
          throw new Error('Oura authentication token is missing');
        }

        const data = await fetchHeartRate(ouraToken);
        console.log('✅ Heart rate data fetch successful:', {
          dataPoints: data.length,
          timestamp: new Date().toISOString()
        });

        // Transform data for the chart
        const formattedData = data.map(item => ({
          timestamp: new Date(item.timestamp).toLocaleTimeString(),
          bpm: item.bpm
        }));

        setHeartRateData(formattedData);
      } catch (err) {
        console.error('💔 Error in HeartRateChart:', {
          message: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
        setError(err.message || 'Failed to load heart rate data');
      } finally {
        setLoading(false);
      }
    };

    loadHeartRateData();
  }, [ouraToken]);

  if (loading) {
    return <div className="loading">Loading heart rate data...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Heart Rate Data</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!heartRateData.length) {
    return <div>No heart rate data available for the selected time period.</div>;
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h2>Heart Rate Over Time</h2>
      <ResponsiveContainer>
        <LineChart data={heartRateData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="bpm" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeartRateChart; 