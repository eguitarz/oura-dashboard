import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import Card from './common/Card';
import { fetchHeartRate } from '../services/ouraApi';
import { useAuth } from '../contexts/AuthContext';

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 20px;
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

const HeartRate = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ouraToken } = useAuth();
  const chartRef = useRef(null);

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
        setData(heartRateData);
      } catch (err) {
        console.error('💔 Heart rate data error:', err);
        setError(err.message || 'Failed to load heart rate data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ouraToken]);

  useEffect(() => {
    if (data.length === 0 || !chartRef.current) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.timestamp)))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.bpm) - 5,
        d3.max(data, d => d.bpm) + 5
      ])
      .range([height, 0]);

    // Create line generator
    const line = d3.line()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.bpm))
      .curve(d3.curveMonotoneX);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    svg.append('g')
      .call(d3.axisLeft(y));

    // Add line path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#007bff')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(new Date(d.timestamp)))
      .attr('cy', d => y(d.bpm))
      .attr('r', 3)
      .attr('fill', '#007bff');

    // Add labels
    svg.append('text')
      .attr('x', -height / 2)
      .attr('y', -30)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Heart Rate (BPM)');

  }, [data]);

  if (loading) {
    return (
      <Card>
        <LoadingMessage>Loading heart rate data...</LoadingMessage>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorMessage>{error}</ErrorMessage>
      </Card>
    );
  }

  return (
    <Card>
      <h2>Heart Rate</h2>
      <p>Last 24 hours</p>
      <ChartContainer ref={chartRef} />
    </Card>
  );
};

export default HeartRate; 