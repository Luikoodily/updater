import React, { useEffect, useState } from 'react'

const UpdaterComponent: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<string>('Initializing update system...')
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false)
  const [updateDownloaded, setUpdateDownloaded] = useState<boolean>(false)

  useEffect(() => {
    // Ensure we have access to the API
    if (typeof window === 'undefined') {
      setUpdateStatus('Environment not supported')
      return
    }

    // Centralized error-safe method for attaching listeners
    const setupListener = () => {
      if (!window.api) {
        console.error('Update API is not available')
        setUpdateStatus('Update system not initialized')
        return
      }

      try {
        window.api.onUpdateMessage?.((message: string) => {
          console.log('Update Message:', message)
          setUpdateStatus(message)
        })

        window.api.onUpdateAvailable?.((info: any) => {
          console.log('Update Available:', info)
          setUpdateAvailable(true)
          setUpdateStatus(`Update available: ${info?.version || 'Unknown version'}`)
        })

        window.api.onUpdateNotAvailable?.(() => {
          console.log('No updates available')
          setUpdateStatus('No updates available')
          setUpdateAvailable(false)
        })

        window.api.onUpdateError?.((error: Error) => {
          console.error('Update Error:', error)
          setUpdateStatus(`Update error: ${error.message}`)
        })

        window.api.onDownloadProgress?.((progress: { percent?: number }) => {
          const percent = progress.percent || 0
          console.log('Download Progress:', percent)
          setDownloadProgress(percent)
          setUpdateStatus(`Downloading: ${percent.toFixed(0)}%`)
        })

        window.api.onUpdateDownloaded?.(() => {
          console.log('Update Downloaded')
          setUpdateDownloaded(true)
          setUpdateStatus('Update downloaded. Ready to install.')
        })

        window.api.checkForUpdates?.()
      } catch (error) {
        console.error('Failed to setup update listeners:', error)
        setUpdateStatus('Failed to initialize update system')
      }
    }

    setupListener()

    return () => {
      try {
        window.api?.removeAllListeners?.()
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    }
  }, [])

  const handleDownload = () => {
    try {
      window.api?.downloadUpdate?.()
      setUpdateStatus('Starting download...')
    } catch (error) {
      console.error('Download failed:', error)
      setUpdateStatus('Update download failed')
    }
  }

  const handleInstall = () => {
    try {
      window.api?.installUpdate?.()
      setUpdateStatus('Installing update...')
    } catch (error) {
      console.error('Install failed:', error)
      setUpdateStatus('Update installation failed')
    }
  }

  return (
    <div className="updater-container">
      <h2>Updater Component</h2>
      <div className="update-status">
        <p>{updateStatus}</p>
      </div>

      {downloadProgress > 0 && !updateDownloaded && (
        <div className="download-progress">
          <progress value={downloadProgress} max={100}></progress>
          <span>{downloadProgress.toFixed(0)}%</span>
        </div>
      )}

      {updateAvailable && !updateDownloaded && (
        <button onClick={handleDownload} className="download-button">
          Download Update
        </button>
      )}

      {updateDownloaded && (
        <button onClick={handleInstall} className="install-button">
          Install Update
        </button>
      )}

      {!updateAvailable && (
        <div className="no-update">
          <p>No updates available at the moment.</p>
        </div>
      )}
    </div>
  )
}

export default UpdaterComponent
