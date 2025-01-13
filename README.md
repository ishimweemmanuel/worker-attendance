# Work Attendance Tracker

A modern work attendance tracking application built with Next.js 15, featuring real-time attendance management, sheet tracking, and data visualization.

## Features

- Interactive dashboard with attendance analytics
- Sheet management and tracking
- Real-time attendance monitoring
- Data visualization using ApexCharts and Recharts
- Dark/Light theme support
- Responsive design
<<<<<<< HEAD
- MongoDB Atlas for remote database access
=======
- Modern UI with Tailwind CSS

>>>>>>> 5d4a81b152920b32c54d4f3464fedcaa3812d1de

## Tech Stack

- **Framework:** Next.js 15
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Charts:** ApexCharts, Recharts
- **Forms:** React Hook Form with Zod validation
- **Database:** MongoDB Atlas with Mongoose
- **Type Safety:** TypeScript
- **State Management:** React Hooks
- **Notifications:** React Hot Toast, Sonner

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up MongoDB Atlas:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Create a new cluster (free tier M0 is sufficient)
   - Set up database access (create a database user)
   - Configure network access (allow your IP or set to allow all IPs for development)
   - Get your connection string from the Connect button

4. Set up your environment variables:
   Create a `.env` file in the root directory with:
   ```
   MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority"
   ```
   Replace:
   - `<username>` with your MongoDB Atlas username
   - `<password>` with your MongoDB Atlas user password
   - `<cluster-url>` with your cluster URL

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Project Structure

- `/src/app` - Main application pages and API routes
- `/src/components` - Reusable UI components
- `/src/models` - MongoDB models and schemas
- `/src/lib` - Utility functions and shared logic
- `/src/config` - Configuration files

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Required environment variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string

Important:
- Never commit your `.env` file to version control
- Keep your database credentials secure
- Use different databases for development and production

## Contributing

Feel free to contribute to this project by submitting issues and/or pull requests.

## License

This project is private and proprietary.
