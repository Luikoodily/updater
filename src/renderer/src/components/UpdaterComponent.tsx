import React, { useEffect, useState } from 'react'

const UpdaterComponent: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<string>('')
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false)
  const [updateDownloaded, setUpdateDownloaded] = useState<boolean>(false)

  useEffect(() => {
    // Setup update listeners
    window.api.onUpdateMessage((message) => {
      setUpdateStatus(message)
    })

    window.api.onUpdateAvailable(() => {
      setUpdateAvailable(true)
      setUpdateStatus('Update available!')
    })

    window.api.onUpdateNotAvailable(() => {
      setUpdateStatus('No updates available')
    })

    window.api.onUpdateError((error) => {
      setUpdateStatus(`Error: ${error.message}`)
      console.log('Update Erro-----------:', error.message) // Logs the error message
      console.log('Full Error Object?????????:', error) // Logs the entire error object for detailed inspection
    })

    window.api.onDownloadProgress((progress) => {
      setDownloadProgress(progress.percent || 0)
      setUpdateStatus(`Downloading: ${Math.round(progress.percent)}%`)
    })

    window.api.onUpdateDownloaded(() => {
      setUpdateDownloaded(true)
      setUpdateStatus('Update downloaded! Ready to install.')
    })

    // Check for updates initially
    window.api.checkForUpdates()

    // Cleanup listeners
    return () => {
      window.api.removeAllListeners()
    }
  }, [])

  const handleDownload = () => {
    window.api.downloadUpdate()
  }

  const handleInstall = () => {
    window.api.installUpdate()
  }

  return (
    <div className="updater-container">
      <div className="update-status">{updateStatus}</div>
      {downloadProgress > 0 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${downloadProgress}%` }} />
        </div>
      )}
      {updateAvailable && !updateDownloaded && (
        <button onClick={handleDownload} className="update-button">
          Download Update
        </button>
      )}
      {updateDownloaded && (
        <button onClick={handleInstall} className="update-button">
          Install and Restart
        </button>
      )}
    </div>
  )
}

export default UpdaterComponent
