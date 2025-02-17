# Oura Dashboard

An interactive web dashboard for visualizing and analyzing Oura ring data. This application provides users with detailed insights into their health metrics, including sleep quality, readiness, activity levels, and heart rate variability.

## Features

- Secure OAuth authentication with Oura API
- Interactive data visualizations using D3.js
- Historical trend analysis
- Customizable date range filtering
- Responsive design for both desktop and mobile
- Data export capabilities

## Tech Stack

- **Frontend**: React, D3.js
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: OAuth 2.0 with Passport.js

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL
- Oura API credentials

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/oura-dashboard.git
   cd oura-dashboard
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Create a `.env` file in the root directory:
   ```
   OURA_CLIENT_ID=your_client_id
   OURA_CLIENT_SECRET=your_client_secret
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
oura-dashboard/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
├── .env                   # Environment variables
└── package.json          # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 