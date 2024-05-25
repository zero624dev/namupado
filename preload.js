const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    send: (channel, payload) => ipcRenderer.send(channel, payload)
})

window.addEventListener("load", () => {
    if (window.location.href.includes("namu.wiki")) {
        document.querySelectorAll("form")[0].parentElement.style.display = "none";
        if (document.querySelectorAll("body > div > div > div > div > div").length == 16)
            document.querySelectorAll("body > div > div > div > div > div")[10].remove()
    }
}, false)

ipcRenderer.on("set-info-window", (event, arg) => {
    if (window.location.href.includes("namu.wiki")) {
        const infoWin = document.getElementById("namuWikiPadoTagi");
        const navi = document.getElementById("namuWikiPadoTagiNavi");
        const sec = (Date.now() - arg.time) / 1000;
        const hours = Math.floor((sec % 86400) / 3600).toString().padStart(2, '0')
        const minutes = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
        const seconds = Math.floor(sec % 60).toString().padStart(2, '0')
        const getInfo = `
            <a href="${arg.goal}" target='_blank'>${decodeURI(arg.goal.slice(20))}</a><br>
            ${hours}:${minutes}:${seconds}<br>
            이동 횟수 : ${arg.move}번<br>
            <button onclick="window.api.send('exit-game')" style="color: white; background-color: #1c1d1f; border: 1px solid #444444; border-radius: 6px;">메뉴로 돌아가기</button>`
        if (!infoWin) {
            document.body.innerHTML += `
            <div id="namuWikiPadoTagi" style="position: fixed; top: 10px; right: 10px; width: 200px; color: white; z-index: 100; font-size: 20px; background-color: rgba(10,10,10,0.6); text-align: center; border-radius: 6px;">
            ${getInfo}
            </div>`
        } else {
            namuWikiPadoTagi.innerHTML = getInfo
        }
        if (!navi) {
            document.body.innerHTML += `
            <div id="namuWikiPadoTagiNavi" style="position: fixed; top: 10px; left: 10px; padding: 0px 5px; color: white; z-index: 100; font-size: 20px; background-color: rgba(10,10,10,0.6); text-align: center; border-radius: 6px;">
            <button onclick="window.history.back()" style="color: white; background-color: #1c1d1f; border: 1px solid #444444; border-radius: 6px;">◀</button>
            <button onclick="window.history.forward()" style="color: white; background-color: #1c1d1f; border: 1px solid #444444; border-radius: 6px;">▶</button>
            </div>`
        }
    }
})

ipcRenderer.on("game-end", (event, arg) => {
    const sec = (arg.endTime - arg.startTime) / 1000;
    const hours = Math.floor((sec % 86400) / 3600).toString().padStart(2, '0')
    const minutes = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const seconds = Math.floor(sec % 60).toString().padStart(2, '0')
    resultText.innerHTML = `${hours}:${minutes}:${seconds}<br>${arg.move}번 이동`;
    historyText.innerHTML = arg.history.map((url) => `<a href="${url}" target='_blank'>${decodeURI(url.slice(20))}</a><br>`).join("↓<br>");
    result.style.visibility = "visible";
});

window.addEventListener('mouseup', (event) => {
    if (event.button === 3 || event.button === 4) {
        event.preventDefault();
        event.stopPropagation();
    }
});