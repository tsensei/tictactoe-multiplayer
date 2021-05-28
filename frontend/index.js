//Connect to server
const socket = io("https://sleepy-caverns-91483.herokuapp.com", {
  extraHeaders: {
    "Access-Control-Allow-Origin": "*",
  },
});

//For testing

// const socket = io("http://localhost:8080", {
//   extraHeaders: {
//     "Access-Control-Allow-Origin": "*",
//   },
// });

//Unique player number
var playerNumber,
  currentPlayer,
  currentTurn,
  p2joined = false,
  boardUpdated = true,
  gameRunning = false;
let boardState = Array.apply(null, Array(9)).map(function () {});

//Response on Socket Event
socket.on("init", (number) => {
  playerNumber = number;
  init();
});
socket.on("gameCode", handleGameCode);
socket.on("xoturn", handlexoturn);
socket.on("startGame", handleStartGame);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("boardState", handleBoardState);
socket.on("winner", handleWinner);
socket.on("draw", handleDraw);
socket.on("exitGame", handleExitGame);

//Reference to DOM objects
const loginContainer = document.getElementById("login-container");
const gameContainer = document.getElementById("game-container");

const newBtn = document.getElementById("newGameButton");
const joinCodeInput = document.getElementById("joinCode");
const joinBtn = document.getElementById("joinGameButton");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const boardCells = document.querySelectorAll(".board-cell");
const userName = document.getElementById("userName");
const playerTurn = document.getElementById("playerTurn");

//Initialize game when button clicked
newBtn.addEventListener("click", () => {
  const name = userName.value;
  socket.emit("newGame", name);
});

joinBtn.addEventListener("click", () => {
  const name = userName.value;
  const code = joinCodeInput.value;
  socket.emit("joinGame", code, name);
});

//Initialization function
function init() {
  boardState = [];
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
    cell.addEventListener("click", () => {
      validateClickSendRes(index);
    });
  });
}

function validateClickSendRes(index) {
  if (currentTurn != undefined && boardUpdated) {
    if (playerNumber == currentTurn) {
      if (boardState[index] == undefined || boardState[index] == null) {
        socket.emit("turnMade", index);
        boardUpdated = false;
      } else {
        alert("already selected!!");
      }
    } else {
      alert("not your turn!!");
    }
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
  if (serverBoardState.length == 0) {
    return;
  }
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

  boardUpdated = true;
}

//Sets turn got from server

function handlexoturn(turn, player) {
  currentTurn = turn;
  currentPlayer = player;
  if (p2joined) {
    playerTurn.innerText = currentPlayer + "'s turn";
  }
}

function handleStartGame() {
  p2joined = true;
  gameRunning = true;
}

//Display room code
function handleGameCode(code) {
  gameCodeDisplay.innerText = code;
}

//Wrong game code
function handleUnknownGame() {
  alert("Unknown Game!");
}

//Player limit exceeded
function handleTooManyPlayers() {
  alert("Too many players!");
}

function handleWinner(num) {
  playerTurn.innerText = currentPlayer + " is the winner";

  setTimeout(() => {
    reset();
  }, 2000);
}

function handleDraw() {
  playerTurn.innerText = "This is a draw";
  setTimeout(() => {
    reset();
  }, 2000);
}

function handleExitGame() {
  if (!gameRunning) {
    return;
  }
  alert("A player has left the room");
  reset();
}

//resets to default
function reset() {
  gameRunning = false;
  playerNumber = null;
  gameCodeDisplay.innerText = "";
  playerTurn.innerText = "";
  currentPlayer = undefined;
  gameContainer.style.display = "none";
  loginContainer.style.display = "flex";
  joinCodeInput.value = "";
  userName.value = "";
  boardState = Array.apply(null, Array(9)).map(function () {});
}
