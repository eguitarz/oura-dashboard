import React, { useEffect, useState, useRef, useMemo } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import Card from './common/Card';
import { fetchHeartRate } from '../services/ouraApi';
import { useAuth } from '../contexts/AuthContext';
import TimeSeriesChart from './common/TimeSeriesChart';

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 20px;
  position: relative;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ChartTitle = styled.div`
  h2 {
    margin: 0;
  }
  p {
    margin: 5px 0 0;
    color: #6c757d;
  }
`;

const GranularitySelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  color: #2c3e50;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #adb5bd;
  }

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  padding: 20px;
  text-align: center;
  background-color: #f8d7da;
  border-radius: 4px;
  margin-top: 20px;
`;

const HoverCard = styled.div`
  position: absolute;
  background: white;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
  min-width: 150px;

  &.visible {
    opacity: 1;
  }

  h4 {
    margin: 0 0 8px;
    color: #2c3e50;
    font-size: 14px;
  }

  p {
    margin: 4px 0;
    color: #6c757d;
    font-size: 13px;
  }

  .value {
    color: #007bff;
    font-weight: 600;
  }
`;

const GRANULARITY_OPTIONS = [
  { value: 'fine', label: 'Fine-grained', minutes: 1 },
  { value: '5min', label: '5 Minutes', minutes: 5 },
  { value: '15min', label: '15 Minutes', minutes: 15 },
  { value: '30min', label: '30 Minutes', minutes: 30 },
  { value: 'hourly', label: 'Hourly', minutes: 60 },
  { value: 'daily', label: 'Daily', minutes: 1440 },
];

const aggregateData = (data, granularityMinutes) => {
  if (granularityMinutes === 1) return data; // Return original data for fine-grained view

  // Group data by time intervals
  const groups = d3.group(data, d => {
    const date = new Date(d.timestamp);
    if (granularityMinutes === 1440) { // Daily
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    const minutes = date.getHours() * 60 + date.getMinutes();
    const interval = Math.floor(minutes / granularityMinutes);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, interval * granularityMinutes);
  });

  // Aggregate each group
  return Array.from(groups, ([timestamp, values]) => ({
    timestamp: timestamp.toISOString(),
    bpm: Math.round(d3.mean(values, d => d.bpm)),
    min_value: d3.min(values, d => d.bpm),
    max_value: d3.max(values, d => d.bpm),
    count: values.length
  }));
};

const findClosestDataPoint = (mouseX, data, xScale) => {
  let minDistance = Infinity;
  let closestPoint = null;

  data.forEach(d => {
    const distance = Math.abs(xScale(new Date(d.timestamp)) - mouseX);
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = d;
    }
  });

  return minDistance < 50 ? closestPoint : null; // Return null if mouse is too far from any point
};

const HeartRate = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [granularity, setGranularity] = useState('fine');
  const { ouraToken } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Starting heart rate data fetch...');
        
        if (!ouraToken) {
          throw new Error('Oura authentication token is missing');
        }

        const heartRateData = await fetchHeartRate(ouraToken);
        console.log('✅ Heart rate data fetch successful:', {
          dataPoints: heartRateData.length,
          timestamp: new Date().toISOString()
        });
        setRawData(heartRateData);
      } catch (err) {
        console.error('💔 Heart rate data error:', err);
        setError(err.message || 'Failed to load heart rate data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ouraToken]);

  const data = useMemo(() => {
    const option = GRANULARITY_OPTIONS.find(opt => opt.value === granularity);
    return aggregateData(rawData, option.minutes);
  }, [rawData, granularity]);

  return (
    <TimeSeriesChart
      data={data}
      title="Heart Rate"
      subtitle="Last 24 hours"
      loading={loading}
      error={error}
      yAxisLabel="Heart Rate (BPM)"
      valueKey="bpm"
      valueLabel="BPM"
      granularity={granularity}
      granularityOptions={GRANULARITY_OPTIONS}
      onGranularityChange={(e) => setGranularity(e.target.value)}
      formatValue={value => `${value} BPM`}
    />
  );
};

export default HeartRate; 