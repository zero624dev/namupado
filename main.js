const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const game = {
  startTime: 0,
  move: 0,
  startPage: "",
  endPage: "",
  history: []
}
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 800,
    minHeight: 800,
    minWidth: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false,
    }
  })

  win.loadFile('index.html')

  win.on('page-title-updated', (e) => {
    const curURL = win.webContents.getURL().replace(/\?from=?.+/, "");
    if (curURL.includes("namu.wiki")) {
      game.move++;
      game.history.push(curURL);
      win.webContents.send("block-ad")
      win.webContents.send("set-info-window", { goal: game.endPage, move: game.move, time: game.startTime })
    }
    if (curURL === game.endPage) {
      win.loadFile('index.html').then(() => {
        win.webContents.send("game-end", { ...game, endTime: Date.now() })
      })
    }

  })
}

ipcMain.on("exit-game", (event, arg) => {
  win.loadFile('index.html')
});

ipcMain.on("game-start", async (event, { start, end }) => {
  game.startTime = Date.now()
  game.move = -1
  game.history = []
  switch (start) {
    case "random":
      game.startPage = await getRandomPage()
      break
    default:
      game.startPage = "https://namu.wiki/w/" + start.slice(7)
      console.log(game.endPage)
      break
  }
  switch (end) {
    case "random":
      game.endPage = await getRandomPage()
      break
    default:
      game.endPage = "https://namu.wiki/w/" + end.slice(7)
      break
  }
  win?.loadURL(game.startPage).then(() => {
    win.webContents.clearHistory()
    setInterval(() => {
      win.webContents.send("set-info-window", { goal: game.endPage, move: game.move, time: game.startTime })
    }, 1000);
  })
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function getRandomPage() {
  return new Promise((resolve, reject) => {
    fetch("https://namu.wiki/random")
      .then((res) => {
        resolve(res.url.replace(/\?from=?.+/, ""));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

