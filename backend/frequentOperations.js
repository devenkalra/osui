const fs = require('fs');
const yaml = require('js-yaml');
const { exec } = require('child_process');
const logger = require('./logger');

class FrequentOperations {
  constructor(configPath) {
    this.configPath = configPath;
    this.operations = [];
    this.loadConfig();
  }

  loadConfig() {
    try {
      const fileContents = fs.readFileSync(this.configPath, 'utf8');
      this.operations = yaml.load(fileContents);
      logger.info('Frequent operations config loaded successfully');
    } catch (error) {
      logger.error('Error loading frequent operations config:', error);
      this.operations = [];
    }
  }

  getAllOperations() {
    return this.operations;
  }

  getOperationsByCategory(category) {
    return this.operations.filter(op => op.category === category);
  }

  getOperationsByTag(tag) {
    return this.operations.filter(op => op.tags && op.tags.includes(tag));
  }

  async executeOperation(id, customArgs = '') {
    const operation = this.operations.find(op => op.id === id);
    if (!operation) {
      throw new Error('Operation not found');
    }

    return new Promise((resolve, reject) => {
      const command = operation.command;
      const args = operation.args || [];
      const cwd = operation.cwd || process.cwd();

      // Combine the operation's default args with any custom args
      const allArgs = [...args];
      if (customArgs) {
        allArgs.push(customArgs);
      }

      // Build the base command
      let fullCommand = `${command} ${allArgs.join(' ')}`;

      // Add pipe commands if specified
      if (operation.pipe_command) {
        // Sort pipe commands by their numeric keys
        const sortedPipeCommands = Object.entries(operation.pipe_command)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([_, cmd]) => cmd);

        // Add each pipe command to the full command
        fullCommand += ' | ' + sortedPipeCommands.join(' | ');
      }

      logger.info(`Executing operation: ${fullCommand} in ${cwd}`);

      exec(fullCommand, { cwd }, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Error executing operation ${id}:`, error);
          reject(error);
        } else {
          logger.info(`Successfully executed operation ${id}`);
          resolve({ stdout, stderr });
        }
      });
    });
  }

  searchOperations(query) {
    const lowerQuery = query.toLowerCase();
    return this.operations.filter(op => 
      op.title.toLowerCase().includes(lowerQuery) ||
      op.description?.toLowerCase().includes(lowerQuery) ||
      op.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

module.exports = FrequentOperations; 