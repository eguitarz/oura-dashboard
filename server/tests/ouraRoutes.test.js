const request = require('supertest');
const express = require('express');
const axios = require('axios');
const ouraRoutes = require('../routes/ouraRoutes');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/oura', ouraRoutes);

describe('Oura API Routes', () => {
  const mockToken = 'test_oura_token';
  const mockHeaders = { Authorization: `Bearer ${mockToken}` };

  describe('GET /api/oura/heartrate', () => {
    const mockHeartRateData = {
      data: [
        {
          bpm: 65,
          timestamp: '2024-02-20T10:00:00.000Z'
        },
        {
          bpm: 68,
          timestamp: '2024-02-20T10:05:00.000Z'
        }
      ]
    };

    it('should return heart rate data when properly authenticated', async () => {
      axios.get.mockResolvedValueOnce({ data: mockHeartRateData });

      const response = await request(app)
        .get('/api/oura/heartrate')
        .set(mockHeaders)
        .query({
          start_datetime: '2024-02-20T00:00:00.000Z',
          end_datetime: '2024-02-20T23:59:59.999Z'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHeartRateData);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.ouraring.com/v2/usercollection/heartrate',
        expect.any(Object)
      );
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/oura/heartrate')
        .query({
          start_datetime: '2024-02-20T00:00:00.000Z',
          end_datetime: '2024-02-20T23:59:59.999Z'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should handle Oura API errors properly', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      });

      const response = await request(app)
        .get('/api/oura/heartrate')
        .set(mockHeaders)
        .query({
          start_datetime: '2024-02-20T00:00:00.000Z',
          end_datetime: '2024-02-20T23:59:59.999Z'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/oura/sleep', () => {
    const mockSleepData = {
      data: [
        {
          bedtime_start: '2024-02-20T22:00:00.000Z',
          bedtime_end: '2024-02-21T06:00:00.000Z',
          total_sleep_duration: 28800,
          deep_sleep_duration: 7200,
          rem_sleep_duration: 9000,
          light_sleep_duration: 12600,
          efficiency: 95
        }
      ]
    };

    const mockDailySleepData = {
      data: [
        {
          day: '2024-02-20',
          score: 85
        }
      ]
    };

    it('should return transformed sleep data when properly authenticated', async () => {
      axios.get
        .mockResolvedValueOnce({ data: mockSleepData }) // sleep data
        .mockResolvedValueOnce({ data: mockDailySleepData }); // daily sleep data

      const response = await request(app)
        .get('/api/oura/sleep')
        .set(mockHeaders)
        .query({
          start_date: '2024-02-20',
          end_date: '2024-02-21'
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0]).toHaveProperty('timestamp');
      expect(response.body.data[0]).toHaveProperty('score');
      expect(response.body.data[0]).toHaveProperty('total_sleep_duration');
      expect(response.body.data[0]).toHaveProperty('deep_sleep_duration');
      expect(response.body.data[0]).toHaveProperty('rem_sleep_duration');
      expect(response.body.data[0]).toHaveProperty('light_sleep_duration');
      expect(response.body.data[0]).toHaveProperty('efficiency');
      
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/oura/sleep')
        .query({
          start_date: '2024-02-20',
          end_date: '2024-02-21'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should handle missing sleep data gracefully', async () => {
      axios.get
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } });

      const response = await request(app)
        .get('/api/oura/sleep')
        .set(mockHeaders)
        .query({
          start_date: '2024-02-20',
          end_date: '2024-02-21'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should handle Oura API errors properly', async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      });

      const response = await request(app)
        .get('/api/oura/sleep')
        .set(mockHeaders)
        .query({
          start_date: '2024-02-20',
          end_date: '2024-02-21'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed sleep data gracefully', async () => {
      const malformedSleepData = {
        data: [
          {
            bedtime_start: 'invalid-date',
            total_sleep_duration: 'not-a-number'
          }
        ]
      };

      axios.get
        .mockResolvedValueOnce({ data: malformedSleepData })
        .mockResolvedValueOnce({ data: mockDailySleepData });

      const response = await request(app)
        .get('/api/oura/sleep')
        .set(mockHeaders)
        .query({
          start_date: '2024-02-20',
          end_date: '2024-02-21'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });
}); 