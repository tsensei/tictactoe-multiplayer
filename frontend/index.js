//Connect to server
const socket = io("http://localhost:8080");

//Unique player number
var playerNumber, currentTurn;
let boardState = [];

//Response on Socket Event
socket.on("init", (number) => {
  playerNumber = number;
});
socket.on("gameCode", handleGameCode);
socket.on("xoturn", handlexoturn);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("boardState", handleBoardState);

//Reference to DOM objects
const loginContainer = document.getElementById("login-container");
const gameContainer = document.getElementById("game-container");

const newBtn = document.getElementById("newGameButton");
const joinCodeInput = document.getElementById("joinCode");
const joinBtn = document.getElementById("joinGameButton");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const boardCells = document.querySelectorAll(".board-cell");

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
  boardState = [];
  gameCodeDisplay.innerText = "";
  loginContainer.style.display = "none";
  gameContainer.style.display = "flex";
  initializeGame();
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
        validateClickSendRes(index);
      },
      { once: true }
    );
  });
}

function validateClickSendRes(index) {
  if (currentTurn != undefined) {
    if (playerNumber == currentTurn) {
      socket.emit("turnMade", index);
    } else {
      alert("not your turn");
    }
  } else {
    alert("turn undefined ");
  }
}

//Draw the board everytime get boardState
function putX(cellNumber) {
  const newImg = document.createElement("img");
  newImg.src = "./img/close.svg";
  newImg.className = "cell-x";
  boardCells[cellNumber].appendChild(newImg);
}

function putO(cellNumber) {
  const newImg = document.createElement("img");
  newImg.src = "./img/rec.svg";
  newImg.className = "cell-o";
  boardCells[cellNumber].appendChild(newImg);
}

function handleBoardState(serverBoardState) {
  boardState = Array.from(serverBoardState);

  //Print the grid acc to boardState
  boardState.forEach((cell, index) => {
    if (boardCells[index].hasChildNodes()) {
      return;
    }
    if (cell == 1) {
      putX(index);
    } else if (cell == 2) {
      putO(index);
    }
  });
}

//Sets turn got from server

function handlexoturn(turn) {
  console.log("New turn " + turn);
  currentTurn = turn;
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
