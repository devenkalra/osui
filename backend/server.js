const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const windowManager = require('./windowManager');
const logger = require('./logger');
const path = require('path');
const FrequentOperations = require('./frequentOperations');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));

// Serve static files from the public directory
app.use('/static', express.static(path.join(__dirname, 'public')));

const frequentOperations = new FrequentOperations(path.join(__dirname, 'config', 'operations.yaml'));

// Log the loaded operations
console.log('Loaded operations:', frequentOperations.getAllOperations());

// Routes
app.get('/api/windows', async (req, res) => {
  try {
    logger.info('Fetching windows list');
    const windows = await windowManager.listWindows();
    logger.info(`Found ${windows.length} windows`);
    res.json(windows);
  } catch (error) {
    logger.error('Failed to fetch windows:', error);
    res.status(500).json({ error: 'Failed to fetch windows' });
  }
});

app.post('/api/windows/:id/focus', async (req, res) => {
  try {
    logger.info(`Attempting to focus window with ID: ${req.params.id}`);
    const result = await windowManager.focusWindow(req.params.id);
    if (result.success) {
      logger.info(`Successfully focused window: ${req.params.id}`);
      res.json({ message: 'Window focused successfully' });
    } else {
      logger.error(`Failed to focus window: ${req.params.id}`, result.error);
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Failed to focus window:', error);
    res.status(500).json({ error: 'Failed to focus window' });
  }
});

app.post('/api/windows/:id/close', async (req, res) => {
  try {
    logger.info(`Attempting to close window with ID: ${req.params.id}`);
    const result = await windowManager.closeWindow(req.params.id);
    if (result.success) {
      logger.info(`Successfully closed window: ${req.params.id}`);
      res.json({ message: 'Window closed successfully' });
    } else {
      logger.error(`Failed to close window: ${req.params.id}`, result.error);
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Failed to close window:', error);
    res.status(500).json({ error: 'Failed to close window' });
  }
});

app.post('/api/windows/cascade', async (req, res) => {
  try {
    logger.info('Attempting to cascade windows');
    const result = await windowManager.cascadeWindows();
    if (result.success) {
      logger.info('Successfully cascaded windows');
      res.json({ message: 'Windows cascaded successfully' });
    } else {
      logger.error('Failed to cascade windows:', result.error);
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Failed to cascade windows:', error);
    res.status(500).json({ error: 'Failed to cascade windows' });
  }
});

app.get('/api/chrome-tabs', async (req, res) => {
  try {
    logger.info('Fetching Chrome tabs');
    const tabs = await windowManager.getChromeTabs();
    logger.info(`Found ${tabs.length} Chrome tabs`);
    res.json(tabs);
  } catch (error) {
    logger.error('Failed to fetch Chrome tabs:', error);
    res.status(500).json({ error: 'Failed to fetch Chrome tabs' });
  }
});

// Frequent Operations endpoints
app.get('/api/operations', (req, res) => {
  try {
    const operations = frequentOperations.getAllOperations();
    console.log('Serving operations:', operations);
    res.json(operations);
  } catch (error) {
    logger.error('Error getting operations:', error);
    res.status(500).json({ error: 'Failed to get operations' });
  }
});

app.get('/api/operations/category/:category', (req, res) => {
  try {
    const operations = frequentOperations.getOperationsByCategory(req.params.category);
    res.json(operations);
  } catch (error) {
    logger.error('Error getting operations by category:', error);
    res.status(500).json({ error: 'Failed to get operations by category' });
  }
});

app.get('/api/operations/tag/:tag', (req, res) => {
  try {
    const operations = frequentOperations.getOperationsByTag(req.params.tag);
    res.json(operations);
  } catch (error) {
    logger.error('Error getting operations by tag:', error);
    res.status(500).json({ error: 'Failed to get operations by tag' });
  }
});

app.get('/api/operations/search', (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const operations = frequentOperations.searchOperations(query);
    res.json(operations);
  } catch (error) {
    logger.error('Error searching operations:', error);
    res.status(500).json({ error: 'Failed to search operations' });
  }
});

app.post('/api/operations/:id/execute', async (req, res) => {
  try {
    const { args } = req.body;
    const result = await frequentOperations.executeOperation(req.params.id, args);
    res.json(result);
  } catch (error) {
    logger.error('Error executing operation:', error);
    res.status(500).json({ error: 'Failed to execute operation' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 