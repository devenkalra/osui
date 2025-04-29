# Contributing to OS UI

Thank you for your interest in contributing to OS UI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/osui.git
   cd osui
   ```
3. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. Install system dependencies:
   ```bash
   sudo apt-get update
   sudo apt-get install wmctrl xdotool
   ```

3. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## Making Changes

### Backend Development

1. Follow the existing code structure in `backend/`
2. Add appropriate logging using the Winston logger
3. Write tests for new features
4. Update API documentation in README.md

### Frontend Development

1. Follow the Material-UI component structure
2. Use the existing theme and styling patterns
3. Ensure responsive design
4. Add appropriate loading states and error handling

### Adding New Features

1. Create a new branch for your feature
2. Implement the feature following the existing patterns
3. Add necessary tests
4. Update documentation
5. Create a pull request

## Code Style

- Use consistent indentation (2 spaces)
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

1. Backend tests:
   ```bash
   cd backend
   npm test
   ```

2. Frontend tests:
   ```bash
   cd frontend
   npm test
   ```

## Submitting Changes

1. Ensure all tests pass
2. Update documentation if needed
3. Commit your changes with a descriptive message
4. Push to your fork
5. Create a pull request

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md if applicable
3. The PR will be reviewed by maintainers
4. Address any feedback or requested changes
5. Once approved, your PR will be merged

## Documentation

- Keep README.md up to date
- Document new API endpoints
- Add comments for complex code
- Update CHANGELOG.md for significant changes

## Questions?

Feel free to open an issue for any questions or concerns about contributing to the project. 