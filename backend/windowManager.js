const {exec} = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const logger = require('./logger');

class WindowManager {


    async getProcessInfo(pid) {
        try {
            const {stdout: psProps} = await execPromise(`ps -p ${pid} -o pid,user,command`);
            let lines = psProps.trim().split('\n');
            if (lines.length < 2) {
                logger.warn(`No process found with PID ${pid}`);
                return {};
            }

            if (lines.length > 1) {
                const [header, data] = lines;
                const values = data.trim().split(/\s+/);
                if (values.length >= 3) {
                    return {
                        pid: parseInt(values[0], 10),
                        user: values[1],
                        command: values.slice(2).join(' '),
                    };
                }
            }
            return {};

        } catch (error) {
            console.error(`Error getting process info for PID ${pid}:`, error);
            return null;
        }
    }

    async updateWindowsWithAccessoryData(windows) {
        try {
            for (const window of windows) {
                window.processType = "unknown";
                if (window.role === 'browser') {
                    window.processType = "browser";
                }else if (window.role.startsWith("Thunar")) {
                    window.processType = "file-manager";
                } else if (Object.keys(window.pidInfo).length > 0) {
                    if (window.pidInfo.command.includes('pycharm')) {
                        window.processType = "PyCharm";
                    } else if (window.pidInfo.command.includes("terminal")) {
                        window.processType = "terminal";
                    }
                }else if (window.title.endsWith('- Cursor')) {
                    window.processType = "Cursor";
                }
            }
            logger.debug('Updated windows with accessory data');

        } catch
            (error) {
            logger.error('Error updating windows with accessory data:', error);
        }
    }

    async listWindows() {
        try {
            logger.debug('Executing xprop command to list windows');
            // Get list of window IDs using xprop
            const {stdout: windowIds} = await execPromise('xprop -root _NET_CLIENT_LIST | cut -d "#" -f2');
            const windows = [];

            // Process each window
            for (const windowId of windowIds.trim().split(',')) {
                const id = windowId.trim();
                try {
                    // Get window properties
                    const {stdout: windowProps} = await execPromise(`xprop -id ${id} _NET_WM_NAME _NET_WM_PID _NET_WM_WINDOW_TYPE WM_WINDOW_ROLE`);

                    // Parse window properties
                    const title = windowProps.match(/_NET_WM_NAME\(UTF8_STRING\) = "([^"]*)"/)?.[1] || '';
                    const pid = windowProps.match(/_NET_WM_PID\(CARDINAL\) = (\d+)/)?.[1] || '';
                    const windowType = windowProps.match(/_NET_WM_WINDOW_TYPE = ([^\n]+)/)?.[1] || '';
                    const role = windowProps.match(/WM_WINDOW_ROLE.* = "([^"]*)"/)?.[1] || '';
                    let pidInfo = {}
                    if (pid) {
                        pidInfo = await this.getProcessInfo(pid);
                    }

                    // Get window state
                    const {stdout: windowState} = await execPromise(`xprop -id ${id} _NET_WM_STATE`);
                    const isMinimized = windowState.includes('_NET_WM_STATE_HIDDEN');

                    // Get window geometry
                    const {stdout: geometry} = await execPromise(`xdotool getwindowgeometry ${id}`);
                    const [width, height] = geometry.match(/Geometry: (\d+)x(\d+)/)?.slice(1) || ['0', '0'];
                    const [x, y] = geometry.match(/Position: (\d+),(\d+)/)?.slice(1) || ['0', '0'];

                    // Check if it's a Chrome window
                    const isChrome = title.toLowerCase().includes('google chrome') ||
                        windowType.includes('_NET_WM_WINDOW_TYPE_NORMAL');

                    windows.push({
                        id,
                        pidInfo,
                        role,
                        title,
                        pid,
                        type: isChrome ? 'chrome' : 'window',
                        state: {
                            minimized: isMinimized,
                            geometry: {
                                x: parseInt(x),
                                y: parseInt(y),
                                width: parseInt(width),
                                height: parseInt(height)
                            }
                        },
                        children: isChrome ? [] : null
                    });
                } catch (error) {
                    logger.error(`Error processing window ${id}:`, error);
                    continue;
                }
            }
            await this.updateWindowsWithAccessoryData(windows);
            logger.debug(`Found ${windows.length} windows`);
            return windows;
        } catch (error) {
            logger.error('Error listing windows:', error);
            return [];
        }
    }


    async focusWindow(windowId) {
        try {
            logger.debug(`Attempting to focus window with ID: ${windowId}`);
            // First, unminimize if minimized
            await execPromise(`xdotool windowactivate ${windowId}`);
            await execPromise(`xdotool windowraise ${windowId}`);
            logger.info(`Successfully focused window: ${windowId}`);
            return {success: true};
        } catch (error) {
            logger.error(`Error focusing window ${windowId}:`, error);
            return {success: false, error: error.message};
        }
    }

    async closeWindow(windowId) {
        try {
            logger.debug(`Attempting to close window with ID: ${windowId}`);
            // Send close request to window
            await execPromise(`xdotool windowclose ${windowId}`);
            logger.info(`Successfully closed window: ${windowId}`);
            return {success: true};
        } catch (error) {
            logger.error(`Error closing window ${windowId}:`, error);
            return {success: false, error: error.message};
        }
    }

    async cascadeWindows() {
        try {
            logger.debug('Attempting to cascade windows');
            // Get screen dimensions
            const {stdout: screenInfo} = await execPromise('xrandr | grep " connected"');
            const screenWidth = parseInt(screenInfo.match(/\d+x\d+/)[0].split('x')[0]);
            const screenHeight = parseInt(screenInfo.match(/\d+x\d+/)[0].split('x')[1]);

            // Get all windows
            const windows = await this.listWindows();
            const offset = 60;
            let x = 0;
            let y = 0;

            // Cascade each window
            for (const window of windows) {
                if (window.state.minimized) {
                    await execPromise(`xdotool windowactivate ${window.id}`);
                }

                // Set window position and size
                await execPromise(`xdotool windowmove ${window.id} ${x} ${y}`);
                await execPromise(`xdotool windowsize ${window.id} ${screenWidth / 2} ${screenHeight / 2}`);

                // Update position for next window
                x += offset;
                y += offset;

                // Reset position if it would go off screen
                if (x > screenWidth / 2 || y > screenHeight / 2) {
                    x = 0;
                    y = 0;
                }
            }

            logger.info('Successfully cascaded windows');
            return {success: true};
        } catch (error) {
            logger.error('Error cascading windows:', error);
            return {success: false, error: error.message};
        }
    }

    async getChromeTabs(windowId) {
        try {
            logger.debug(`Attempting to fetch Chrome tabs for window ${windowId}`);
            // This is a placeholder. You'll need to implement the actual Chrome API integration
            // For now, we'll return some mock data
            return [
                {id: 'tab1', title: 'Google', url: 'https://www.google.com'},
                {id: 'tab2', title: 'GitHub', url: 'https://www.github.com'},
                {id: 'tab3', title: 'Stack Overflow', url: 'https://www.stackoverflow.com'}
            ];
        } catch (error) {
            logger.error('Error getting Chrome tabs:', error);
            return [];
        }
    }
}

module
    .exports = new WindowManager();