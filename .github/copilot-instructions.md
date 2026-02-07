# WeDate - Dating App

## Project Overview
WeDate is a free, modern dating app similar to Tinder and Bumble. The app provides a swipe-based interface for users to discover and connect with potential matches. The platform is built to be deployed on Vercel (frontend) and Railway (backend/database).

## Tech Stack
- **Frontend**: React/Next.js (deployed on Vercel)
- **Backend**: Node.js/Express or similar API framework (deployed on Railway)
- **Database**: PostgreSQL or similar relational database (hosted on Railway)
- **Authentication**: OAuth 2.0 / JWT-based authentication
- **File Storage**: Cloud storage for user photos (AWS S3, Cloudinary, or similar)
- **Real-time Features**: WebSockets or similar for instant messaging

## Core Features
- User registration and profile creation
- Photo uploads and profile customization
- Swipe-based match discovery (like/pass)
- Match notifications
- Real-time chat messaging between matches
- User preferences and filters (age, distance, interests)
- Privacy and safety features (reporting, blocking)

## Coding Guidelines

### General
- Use TypeScript for both frontend and backend code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Add JSDoc comments for public APIs and complex functions

### Frontend
- Use functional components with React Hooks
- Implement responsive design (mobile-first approach)
- Use CSS modules or styled-components for styling
- Keep component files under 300 lines; split into smaller components if needed
- Use proper state management (Context API, Redux, or Zustand)

### Backend
- Follow RESTful API conventions for endpoints
- Use async/await for asynchronous operations
- Implement proper error handling middleware
- Validate all user inputs at the API level
- Use environment variables for all configuration

### Database
- Use parameterized queries to prevent SQL injection
- Create proper indexes for frequently queried fields
- Implement database migrations for schema changes
- Never store sensitive data in plain text

## Security Requirements

### Authentication & Authorization
- Always validate JWT tokens on protected endpoints
- Implement proper session management
- Use bcrypt or similar for password hashing (minimum 10 rounds)
- Enforce strong password requirements (min 8 chars, mixed case, numbers, symbols)
- Implement rate limiting on authentication endpoints

### Data Privacy
- Never log sensitive user information (passwords, tokens, personal details)
- Implement GDPR-compliant data handling
- Use HTTPS for all communications
- Set secure cookie attributes: `httpOnly`, `secure`, `sameSite: "strict"`
- Implement proper CORS policies

### Input Validation
- Validate and sanitize all user inputs
- Implement file upload restrictions (type, size, dimensions)
- Use allowlists rather than denylists for validation
- Protect against XSS, CSRF, and injection attacks

### User Safety
- Implement user reporting and blocking features
- Store and review flagged content
- Implement age verification (18+ requirement)
- Provide clear privacy policy and terms of service

## Testing Requirements
- Write unit tests for all utility functions and API endpoints
- Implement integration tests for critical user flows
- Aim for minimum 80% code coverage
- Test edge cases and error conditions
- Use Jest for JavaScript/TypeScript testing
- Mock external dependencies in tests

## Performance Guidelines
- Optimize image loading (lazy loading, proper compression)
- Implement pagination for user discovery
- Use caching strategies for frequently accessed data
- Optimize database queries (avoid N+1 problems)
- Implement CDN for static assets
- Monitor and optimize bundle sizes

## Deployment
- Use environment-specific configuration files
- Never commit secrets or API keys to version control
- Use `.env.example` files to document required environment variables
- Implement proper logging and monitoring
- Set up CI/CD pipelines for automated testing and deployment

## Documentation
- Update README.md with setup instructions
- Document API endpoints with proper request/response examples
- Include architecture diagrams for complex features
- Document deployment procedures
- Keep inline code comments focused on "why" not "what"

## Dependencies
- Review and approve all new dependencies before adding
- Keep dependencies up to date (regular security audits)
- Prefer well-maintained packages with active communities
- Document the purpose of each major dependency

## Accessibility
- Follow WCAG 2.1 AA standards
- Ensure proper keyboard navigation
- Use semantic HTML elements
- Provide alt text for images
- Ensure sufficient color contrast ratios
