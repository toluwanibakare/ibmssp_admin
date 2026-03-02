# IBMSSP ADMIN Backend

Modular Node.js backend for Registry Hub with MySQL/Sequelize ORM.

## Features
- **Modular Architecture**: Controllers, Routes, Services, and Middleware.
- **Secure**: Helmet, CORS, Rate Limiting, and API Key verification.
- **ORM**: Sequelize for MySQL.
- **Activity Logging**: Automatic logging of registration and approval actions.
- **ID Generation**: Automated category-specific membership ID generation.
- **Email Integration**: Nodemailer SMTP support.

## Prerequisites
- Node.js (v16+)
- MySQL Server

## Getting Started

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configuration**
   - Copy `.env.example` to `.env`.
   - Update database credentials and SMTP settings.
   - Set your `API_KEY` (to be used in WordPress headers as `x-api-key`).

3. **Database Initialization**
   Run the following command to create the tables:
   ```bash
   npm run init-db
   ```
   *Warning: This will drop and recreate tables. Use only for initial setup.*

4. **Run Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Registration
- `POST /api/register`
  - Headers: `x-api-key: YOUR_API_KEY`
  - Body: JSON data matching the category requirements.
  - Automatically handles category-specific details and ID generation.

### Members
- `GET /api/members`: Paginated list of members. Filters: `category`, `page`, `limit`.
- `GET /api/members/:id`: Full profile including category-specific details.
- `PATCH /api/members/:id/approve`: Set registration status to approved.

### Utilities
- `POST /api/email/send`: Send email via SMTP.
- `GET /api/logs`: View recent activity logs.

## WordPress Integration
The `/api/register` endpoint is designed to receive webhooks from WordPress Contact Form 7. Ensure the webhook sends `application/json` and includes the `x-api-key` header.
