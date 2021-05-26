//Connect to server
const socket = io("http://localhost:8080");

//Unique player number
let playerNumber;

//Response on Socket Event
socket.on("init", (number) => {
  playerNumber = number;
});
socket.on("gameCode", handleGameCode);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);

//Reference to DOM objects
const loginContainer = document.getElementById("login-container");
const gameContainer = document.getElementById("game-container");

const newBtn = document.getElementById("newGameButton");
const joinCodeInput = document.getElementById("joinCode");
const joinBtn = document.getElementById("joinGameButton");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

//Initialize game when button clicked
newBtn.addEventListener("click", () => {
  socket.emit("newGame");
  init();
});

joinBtn.addEventListener("click", () => {
  const code = joinCodeInput.value;
  socket.emit("joinGame", code);
  init();
});

//Initialization function
function init() {
  gameCodeDisplay.innerText = "";
  loginContainer.style.display = "none";
  gameContainer.style.display = "flex";
}

function initializeGame() {
  //Sets all 9 array element to undefined

  //Clears board
  boardCells.forEach((cell) => {
    if (cell.hasChildNodes()) {
      cell.removeChild(cell.childNodes[0]);
    }
  });

  //Adds click evt listener to each cell
  boardCells.forEach((cell, index) => {
    cell.addEventListener(
      "click",
      () => {
        fillCell(cell, index);
      },
      { once: true }
    );
  });

  currentTurn = Math.round(Math.random(0, 1)) ? "X" : "O";
}

//Display room code
function handleGameCode(code) {
  gameCodeDisplay.innerText = code;
}

//Wrong game code
function handleUnknownGame() {
  reset();
  alert("Unknown Game!");
}

//Player limit exceeded
function handleTooManyPlayers() {
  reset();
  alert("Too many players!");
}

//resets to default
function reset() {
  playerNumber = null;
  joinCodeInput.value = "";
  gameCodeDisplay.innerText = "";
  loginContainer.style.display = "flex";
  gameContainer.style.display = "none";
}
