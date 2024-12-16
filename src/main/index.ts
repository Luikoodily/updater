import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import * as dotenv from 'dotenv'

dotenv.config()

// Configure logging
log.transports.file.level = 'debug'
autoUpdater.logger = log
log.info('App starting...')

function determineUpdateChannel(): 'stable' | 'beta' {
  // Check environment variable first
  if (process.env.UPDATE_CHANNEL === 'beta') return 'beta'

  // Check app version for beta indicators
  const appVersion = app.getVersion()
  const isBetaVersion =
    appVersion.includes('-beta') ||
    appVersion.includes('beta') ||
    appVersion.includes('-alpha') ||
    appVersion.includes('alpha') ||
    appVersion.includes('rc')

  return isBetaVersion ? 'beta' : 'stable'
}

function configureAutoUpdater() {
  const updateChannel = determineUpdateChannel()

  // Configure auto-updater settings
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // Set allowPrerelease based on update channel
  autoUpdater.allowPrerelease = updateChannel === 'beta'

  // Optional: Log the current update channel
  console.log(`Current update channel: ${updateChannel}`)
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // Check for updates when window is ready
    if (!is.dev) {
      autoUpdater.checkForUpdates()
    }
  })

  // Auto updater events
  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update-message', 'Checking for updates...')
  })

  autoUpdater.on('update-available', (info) => {
    // Add a flag to indicate if this is a pre-release
    const enhancedInfo = {
      ...info,
      isPrerelease: autoUpdater.allowPrerelease
    }
    mainWindow.webContents.send('update-available', enhancedInfo)
  })

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-not-available')
  })

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update-error', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('download-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  // Configure auto updater before creating window
  configureAutoUpdater()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers for auto-updater
  ipcMain.on('check-for-update', () => {
    // Reconfigure updater each time to ensure current settings
    configureAutoUpdater()
    autoUpdater.checkForUpdates()
  })

  ipcMain.on('download-update', () => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
