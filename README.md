# 💕 WeDate - Modern Dating App

A free, modern dating app similar to Tinder and Bumble, built with Next.js and deployed on Vercel with Railway PostgreSQL database.

## 🌟 Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Profile Management**: Create and edit your dating profile with bio and location
- **Smart Swiping**: Browse profiles and swipe right (like) or left (pass)
- **Instant Matching**: Get matched when both users like each other
- **Match Management**: View all your matches in one place
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Updates**: Instant match notifications

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Railway)
- **Authentication**: JWT with bcrypt
- **Deployment**: Vercel (Frontend) + Railway (Database)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Railway recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dannyallport-cain/we-date.git
cd we-date
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```
DATABASE_URL=postgresql://username:password@hostname:port/database
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗄️ Database Setup

The app automatically creates the necessary database tables on first run:

- `users` - User profiles and authentication
- `swipes` - User swipe history (likes/dislikes)
- `matches` - Mutual matches between users
- `messages` - Chat messages (future feature)

### Railway Setup

1. Create a PostgreSQL database on [Railway](https://railway.app)
2. Copy the connection string to your `.env` file as `DATABASE_URL`
3. The database schema will be initialized automatically on first API call

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`: Your Railway PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production
4. Deploy!

The app will automatically build and deploy. Vercel handles:
- Automatic HTTPS
- CDN distribution
- Serverless functions for API routes

### Railway Database

Railway provides:
- PostgreSQL database hosting
- Automatic backups
- Connection pooling
- SSL support

## 📱 How It Works

1. **Sign Up**: Create an account with email, password, and basic info
2. **Complete Profile**: Add bio and location to your profile
3. **Start Swiping**: Browse other users' profiles
   - Swipe ❤️ (right) if interested
   - Swipe ❌ (left) to pass
4. **Get Matches**: When both users like each other, it's a match! 🎉
5. **View Matches**: See all your matches and start conversations

## 🎨 Design Features

- Gradient backgrounds (Pink to Purple theme)
- Card-based UI for profile browsing
- Smooth animations and transitions
- Mobile-first responsive design
- Intuitive navigation

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token authentication
- SQL injection protection with parameterized queries
- Environment variables for sensitive data
- HTTPS in production

## 🛠️ Development

### Project Structure

```
we-date/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── matches/      # Match management
│   │   ├── profile/      # Profile management
│   │   ├── swipe/        # Swipe functionality
│   │   └── users/        # User queries
│   ├── auth/             # Auth pages (login/signup)
│   ├── matches/          # Matches page
│   ├── profile/          # Profile page
│   ├── swipe/            # Swipe interface
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── lib/
│   ├── auth.ts           # Authentication utilities
│   └── db.ts             # Database connection
└── public/               # Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

ISC License

## 🎯 Future Enhancements

- [ ] Real-time chat messaging
- [ ] Photo uploads
- [ ] Advanced filters (age range, distance, interests)
- [ ] Push notifications
- [ ] Video profiles
- [ ] Social media integration
- [ ] Premium features

## 💖 Made with Love

Built with modern web technologies to help people connect and find meaningful relationships.
