import React, { useState, useEffect } from 'react';
import TimeSeriesChart from './common/TimeSeriesChart';
import { fetchSleepData } from '../services/ouraApi';
import { useAuth } from '../contexts/AuthContext';

const Sleep = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ouraToken } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Starting sleep data fetch...');
        
        if (!ouraToken) {
          throw new Error('Oura authentication token is missing');
        }

        const sleepData = await fetchSleepData(ouraToken);
        console.log('✅ Sleep data fetch successful:', {
          dataPoints: sleepData.length,
          timestamp: new Date().toISOString()
        });
        setData(sleepData);
      } catch (err) {
        console.error('😴 Sleep data error:', err);
        setError(err.message || 'Failed to load sleep data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ouraToken]);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatScore = (score) => `${score}%`;

  return (
    <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      <TimeSeriesChart
        data={data}
        title="Sleep Score"
        subtitle="Last 7 days"
        loading={loading}
        error={error}
        yAxisLabel="Score"
        valueKey="score"
        valueLabel="Score"
        formatValue={formatScore}
      />
      
      <TimeSeriesChart
        data={data}
        title="Sleep Duration"
        subtitle="Last 7 days"
        loading={loading}
        error={error}
        yAxisLabel="Duration"
        valueKey="duration"
        valueLabel="Duration"
        formatValue={formatDuration}
      />

      <TimeSeriesChart
        data={data}
        title="Deep Sleep"
        subtitle="Last 7 days"
        loading={loading}
        error={error}
        yAxisLabel="Duration"
        valueKey="deep_sleep_duration"
        valueLabel="Duration"
        formatValue={formatDuration}
      />

      <TimeSeriesChart
        data={data}
        title="REM Sleep"
        subtitle="Last 7 days"
        loading={loading}
        error={error}
        yAxisLabel="Duration"
        valueKey="rem_sleep_duration"
        valueLabel="Duration"
        formatValue={formatDuration}
      />
    </div>
  );
};

export default Sleep; 