// VS Code's extension host sets ELECTRON_RUN_AS_NODE=1 and leaks it to child
// processes (including npm scripts run from its terminal). When inherited by
// the Electron binary that electron-vite spawns, it forces Electron to run as
// plain Node — `require("electron")` then returns the binary path string and
// the main process crashes with "Cannot read properties of undefined (reading
// 'whenReady')". Strip the var before delegating to electron-vite.
delete process.env.ELECTRON_RUN_AS_NODE

const { spawn } = require('child_process')
const cmd = process.platform === 'win32' ? 'electron-vite.cmd' : 'electron-vite'
const child = spawn(cmd, ['dev'], { stdio: 'inherit', shell: process.platform === 'win32' })
child.on('exit', code => process.exit(code ?? 0))
