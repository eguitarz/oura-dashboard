import React, { useState, useEffect } from 'react';
import TimeSeriesChart from './common/TimeSeriesChart';
import { fetchSleepData } from '../services/sleepApi';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const SleepGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

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

        // Transform data to match our time series format
        const transformedData = sleepData.map(sleep => {
          console.log('🛏️ Processing sleep record:', sleep);
          const date = new Date(sleep.timestamp);
          date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
          
          return {
            timestamp: date.toISOString(),
            score: sleep.score,
            duration: sleep.duration > 0 ? sleep.duration : null,
            deep_sleep_duration: sleep.deep_sleep_duration > 0 ? sleep.deep_sleep_duration : null,
            rem_sleep_duration: sleep.rem_sleep_duration > 0 ? sleep.rem_sleep_duration : null,
            light_sleep_duration: sleep.light_sleep_duration > 0 ? sleep.light_sleep_duration : null,
            efficiency: sleep.efficiency
          };
        });

        console.log('✨ Transformed sleep data:', {
          firstPoint: transformedData[0],
          lastPoint: transformedData[transformedData.length - 1]
        });

        setData(transformedData);
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
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatScore = (score) => {
    if (!score) return 'N/A';
    return `${score}%`;
  };

  return (
    <SleepGrid>
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
        title="Total Sleep"
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
    </SleepGrid>
  );
};

export default Sleep; 