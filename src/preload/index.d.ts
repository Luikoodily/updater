import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      checkForUpdates: () => void
      downloadUpdate: () => void
      installUpdate: () => void
      onUpdateMessage: (callback: (message: string) => void) => void
      onUpdateAvailable: (callback: (info: any) => void) => void
      onUpdateNotAvailable: (callback: () => void) => void
      onUpdateError: (callback: (error: Error) => void) => void
      onDownloadProgress: (callback: (progress: any) => void) => void
      onUpdateDownloaded: (callback: () => void) => void
      removeAllListeners: () => void
    }
  }
}
