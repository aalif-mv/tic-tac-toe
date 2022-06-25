const code = document.getElementById("room_code");
const create_code = document.getElementById("create_room_code");
const name_input = document.getElementById("name");
const color_input = document.getElementById("color");
const home = document.getElementById("homePageContainer");
const game_container = document.getElementById("gameContainer");
const roomManager = document.getElementById("room_manager");
const player_inputs = document.getElementById("player_inputs");
const player_join = document.getElementById("player_join");
const active_players = document.getElementById("active_players");
const wait_for_players = document.getElementById("waitForPlayers");
const playerList = document.getElementById("playerList");
const copy_code = document.getElementById("copyCode");
const copy_link = document.getElementById("copyLink");

let room = undefined;
let playerNumber = 0;
let player = {name: "", color: ""};
let isFromLink = false;
let host = false;

const socket = io('https://pure-falls-71096.herokuapp.com/');

socket.on('init', handleInit);
socket.on('joined', handleJoined);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('recv', handleRecv);
socket.on('recv_id', mark);
socket.on('recv_won', handleWon);


function handleInit() {
    home.style.display = "none";
    game_container.style.display = "grid";
    wait_for_players.style.display = "none";
}
function handleJoined(name) {
    playerNumber += 1;
    player_join.style.display = "none";
    player_join.innerText = name + " joined";
    player_join.style.display = "block";
    if (host == true) {
        let player = document.createElement("li");
        playerList.append(player);
        player.innerText = name;
    }
}
function newGame() {
    let code = create_code.value.trim();
    socket.emit('newGame', {code: code, color:player.color, name:player.name});
}
function joinGame(room_code) {
    if (player.name != null && player.color != null) {
        socket.emit('joinGame', {code: room_code, color:player.color, name:player.name});
        return;
    }
}
function handleGameCode(dat) {
    let data = JSON.parse(dat);
    room = data.code;
    setUrl("?"+data.code);
    copy_code.innerText = "Code: " + data.code;
    copy_link.innerText = window.location.href;
    wait_for_players.style.display = "grid";
    home.style.display = "none";
    host = data.host;
    if (data.host == true) {
        document.getElementById("reset").style.display = "block";
        active_players.style.display = "block";
        document.getElementById("startBtn").style.display = "block";
        let player = document.createElement("li");
        playerList.append(player);
        player.innerText = data.name;
    } else {
        document.getElementById("startBtn").style.display = "none";
        active_players.style.display = "none";
        wait_for_players.style.marginRight = "0";
        game_container.style.marginRight = "0";
    }
}
function handleUnknownCode() {
    setUrl("");
}
function handleTooManyPlayers() {
    alert('This game is already in progress');
}
function handleRecv(msg) {
    if (JSON.parse(msg) == "reset") {
        resetGame();
    }
}
function handleWon(msg) {
    let win = document.getElementById('win_msg');
    win.innerText = JSON.parse(msg);
    win.style.top = '50px';
    
    setTimeout(() => {win.style.top = '-100px'}, 4000);
}
function buttonPress(id) {
    socket.emit('btnPress', {id: id, room: room});
}
function mark(msg) {
    const btn = document.getElementById(JSON.parse(msg).id);
    console.log(JSON.parse(msg).player.color);
    btn.style.backgroundColor = JSON.parse(msg).player.color;
    btn.disabled = true;
}
function start() {
    if (playerNumber >= 2) {
        socket.emit('startGame', room)
    }
}
function reset() {
    socket.emit('reset', room);
}
function resetGame() {
    let buttons = document.getElementsByClassName("game_button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.backgroundColor = "aqua";
        buttons[i].disabled = false;
    }
}
function updatePlayer() {
    player.name = name_input.value
    player.color = color_input.value
    roomManager.style.display = 'block';
    saveData();
    if (isFromLink) {
        joinGame(getUrl());
        isFromLink = false;
    }
    home.style.gridTemplateColumns = "auto auto";
}

function copy(str, id) {
    navigator.permissions.query({name: "clipboard-write"}).then(result => {
        if (result.state == "granted" || result.state == "prompt") {
            navigator.clipboard.writeText(str).then(function() {
                document.getElementById(id).title = "Copied "+ document.getElementById(id).innerText;
              }, function() {
                alert("cant copy text your browser is no suported");
              });
        } else {
            console.log("cant copy");
        }
      });
}

function setUrl(code) {
    let url;
    try {
        url = window.location.href.split("?")[0];
    } catch (e) {
        url = window.location.href;
    }
    window.history.pushState(null, code, url + code);
}
function getUrl() {
    if (window.location.href.includes("?")) {
        if (window.location.href.split("?")[1] = "") {
            window.history.pushState(null, "home", window.location.href.replace("?", ""));
            return null;
        } else {
            return window.location.href.split("?")[1]
        }
    } else {
        return null;
    }
}
function saveData() {
    localStorage.setItem("player", JSON.stringify(player));
}
function getData() {
    player = JSON.parse(localStorage.getItem("player"));
}
function isData() {
    if (JSON.parse(localStorage.getItem("player") === null)) {
        return false;
    } else {
        return true;
    }
}

if (isData()) {
    getData();
}
if (getUrl() == null && !isData()) {
    roomManager.style.display = 'none';
    home.style.gridTemplateColumns = "auto";
}
if (getUrl() != null) {
    if (!isData()) {
        roomManager.style.display = 'none';
        player_inputs.style.display = 'block';
        isFromLink = true;
    } else {
        joinGame(getUrl());
    }
}
getUrl();
