function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Пример работы IPC
          </a>
        </div>
      </div>
    </>
  )
}

export default App
