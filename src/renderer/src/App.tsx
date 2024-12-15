import { useEffect, useState } from 'react'
import Versions from './components/Versions'
import UpdaterComponent from './components/UpdaterComponent'
import electronLogo from './assets/electron.svg'
import { ipcEndpoints } from '../src/constants/ipc'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const [appVersion, setAppVersion] = useState<string>('loading...')

  useEffect(() => {
    const getVersion = async () => {
      try {
        const version = await window.api.invoke(ipcEndpoints.GET_APP_VERSION)
        setAppVersion(version)
      } catch (error) {
        console.error('Failed to get app version:', error)
        setAppVersion('unknown')
      }
    }

    getVersion()
  }, [])

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="version-info">
        <p>Current Version: v{appVersion}</p>
      </div>
      <UpdaterComponent />
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
