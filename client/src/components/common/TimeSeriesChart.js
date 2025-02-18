import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import Card from './Card';

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

  return minDistance < 50 ? closestPoint : null;
};

const TimeSeriesChart = ({
  data,
  title,
  subtitle,
  loading,
  error,
  yAxisLabel,
  valueKey,
  valueLabel,
  granularity,
  granularityOptions,
  onGranularityChange,
  formatValue = value => value,
  renderHoverCard = (point, timeString, dateString) => `
    <h4>${title} Details</h4>
    <p>Time: <span class="value">${timeString}</span></p>
    <p>Date: <span class="value">${dateString}</span></p>
    <p>${valueLabel}: <span class="value">${formatValue(point[valueKey])}</span></p>
    ${point.min_value && point.max_value ? `
      <p>Range: <span class="value">${formatValue(point.min_value)} - ${formatValue(point.max_value)}</span></p>
      <p>Samples: <span class="value">${point.count}</span></p>
    ` : ''}
  `
}) => {
  const chartRef = useRef(null);
  const hoverCardRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !chartRef.current) return;

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
      .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

    // Set up scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.timestamp)))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.min_value || d[valueKey]) - 5,
        d3.max(data, d => d.max_value || d[valueKey]) + 5
      ])
      .range([height, 0]);

    // Create line generator
    const line = d3.line()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d[valueKey]))
      .curve(d3.curveMonotoneX);

    // Add axes
    svg.append('g')
      .attr('transform', \`translate(0,\${height})\`)
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
    const dots = svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(new Date(d.timestamp)))
      .attr('cy', d => y(d[valueKey]))
      .attr('r', 4)
      .attr('fill', '#007bff')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5);

    // Add vertical hover line
    const hoverLine = svg.append('line')
      .attr('class', 'hover-line')
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#6c757d')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0);

    // Add invisible overlay for mouse tracking
    const overlay = svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all');

    const showHoverEffects = (mouseX) => {
      const closestPoint = findClosestDataPoint(mouseX, data, x);
      
      if (!closestPoint) {
        hoverLine.style('opacity', 0);
        dots.attr('r', 4).attr('stroke-width', 1.5);
        d3.select(hoverCardRef.current).classed('visible', false);
        return;
      }

      const xPos = x(new Date(closestPoint.timestamp));
      hoverLine
        .attr('x1', xPos)
        .attr('x2', xPos)
        .style('opacity', 1);

      dots.attr('r', d => d === closestPoint ? 6 : 4)
          .attr('stroke-width', d => d === closestPoint ? 2 : 1.5);

      const hoverCard = d3.select(hoverCardRef.current);
      const timestamp = new Date(closestPoint.timestamp);
      const timeString = timestamp.toLocaleTimeString();
      const dateString = timestamp.toLocaleDateString();

      hoverCard.html(renderHoverCard(closestPoint, timeString, dateString));

      const chartRect = chartRef.current.getBoundingClientRect();
      const hoverCardRect = hoverCardRef.current.getBoundingClientRect();

      let left = mouseX + margin.left - hoverCardRect.width / 2;
      let top = 10;

      left = Math.max(margin.left, Math.min(left, width + margin.left - hoverCardRect.width));

      hoverCard
        .style('left', \`\${left}px\`)
        .style('top', \`\${top}px\`)
        .classed('visible', true);
    };

    overlay
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        showHoverEffects(mouseX);
      })
      .on('mouseleave', () => {
        hoverLine.style('opacity', 0);
        dots.attr('r', 4).attr('stroke-width', 1.5);
        d3.select(hoverCardRef.current).classed('visible', false);
      });

    // Add y-axis label
    if (yAxisLabel) {
      svg.append('text')
        .attr('x', -height / 2)
        .attr('y', -30)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);
    }
  }, [data, valueKey, yAxisLabel, title, valueLabel, formatValue, renderHoverCard]);

  if (loading) {
    return (
      <Card>
        <LoadingMessage>Loading {title.toLowerCase()} data...</LoadingMessage>
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
      <ChartHeader>
        <ChartTitle>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </ChartTitle>
        {granularityOptions && (
          <GranularitySelect
            value={granularity}
            onChange={onGranularityChange}
          >
            {granularityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </GranularitySelect>
        )}
      </ChartHeader>
      <ChartContainer>
        <div ref={chartRef} />
        <HoverCard ref={hoverCardRef} />
      </ChartContainer>
    </Card>
  );
};

export default TimeSeriesChart; 