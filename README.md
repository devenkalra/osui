# OS UI - Operating System Management Interface

A modern web interface for managing your operating system, built with React and Node.js.

## Features

- **Window Management**
  - List all open windows
  - Focus windows
  - Close windows
  - Cascade window arrangement
  - Search windows by title
  - Chrome tab management
  - Window icons and details

- **Frequent Operations**
  - Execute common system commands
  - Custom argument support
  - Real-time output display
  - Error handling and logging
  - Category and tag filtering
  - Search functionality

- **User Interface**
  - Modern Material-UI design
  - Responsive layout
  - Hideable sidebar
  - Dark/Light theme support
  - Real-time notifications
  - Loading states and error handling

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Linux-based operating system
- `wmctrl` package installed
- `xdotool` package installed

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/osui.git
cd osui
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Install system dependencies:
```bash
sudo apt-get update
sudo apt-get install wmctrl xdotool
```

## Configuration

1. Backend Configuration:
   - Create a `.env` file in the backend directory:
   ```
   PORT=3001
   LOG_LEVEL=info
   ```

2. Frontend Configuration:
   - Update `frontend/src/App.js` if you need to change the backend URL
   - Configure icons in `frontend/public/icons/`

3. Frequent Operations:
   - Edit `backend/operations.yaml` to add or modify operations
   - Each operation can have:
     - title
     - command
     - description
     - category
     - tags
     - default arguments

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3000`

## Development

- Backend: Node.js with Express
- Frontend: React with Material-UI
- State Management: React Context API
- Logging: Winston
- Configuration: YAML

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Structure

```
os-services-manager/
├── backend/
│   ├── server.js
│   ├── windowManager.js
│   ├── serviceManager.js
│   ├── processManager.js
│   └── logger.js
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   └── public/
│   └── package.json
├── DESIGN.md
└── README.md
```

## API Documentation

### Window Management

- `GET /api/windows`
  - Returns a list of all open windows
  - Response format:
    ```json
    [
      {
        "id": "window_id",
        "title": "Window Title",
        "processType": "browser",
        "desktop": 1
      }
    ]
    ```

- `POST /api/windows/:id/focus`
  - Focuses the specified window
  - Returns success status

- `POST /api/windows/:id/close`
  - Closes the specified window
  - Returns success status

- `POST /api/windows/cascade`
  - Arranges all windows in a cascade pattern
  - Returns success status

### Service Management

- `GET /api/services`
  - Returns a list of all system services
  - Response format:
    ```json
    [
      {
        "name": "service_name",
        "status": "active",
        "description": "Service description"
      }
    ]
    ```

- `POST /api/services/:name/start`
  - Starts the specified service
  - Returns success status

- `POST /api/services/:name/stop`
  - Stops the specified service
  - Returns success status

- `POST /api/services/:name/restart`
  - Restarts the specified service
  - Returns success status

## Acknowledgments

- Material-UI for the UI components
- React team for the amazing framework
- Node.js community for the backend runtime
- All contributors and users of the application 