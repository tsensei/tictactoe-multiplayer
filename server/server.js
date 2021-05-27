//Setting up socket server
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
});

//Global object for board states and user/room lookup table
let boardState = {};
const clientRooms = {};
let turn = {};
let nameByRoom = {};
//All possible combination for winning
const winCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

//Client connect aftermath
io.on("connection", (client) => {
  console.log("connected");
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
  client.on("turnMade", handleTurnMade);
  client.on("disconnect", handleDisconnect);

  //Join p1 to the room
  function handleNewGame(name) {
    //generates a roomid
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    boardState[roomName] = initGame();

    client.join(roomName);

    nameByRoom[roomName] = [];

    nameByRoom[roomName].push(name);

    client.number = 1;

    client.emit("init", 1);
  }

  //Join p2 to room after validation
  function handleJoinGame(code, name) {
    //Checks number of client present in a room
    var numClients = io.of("/").adapter.rooms.get(code).size;

    if (numClients === 0) {
      client.emit("unknownGame");
      return;
    } else if (numClients > 1) {
      client.emit("toomanyPlayers");
      return;
    }

    clientRooms[client.id] = code;
    client.join(code);

    client.number = 2;

    nameByRoom[code].push(name);

    client.emit("init", 2);

    client.emit("gameCode", code);

    io.sockets.in(code).emit("startGame");

    turn[code] = Math.round(Math.random(0, 1)) == 0 ? 1 : 2;

    io.sockets
      .in(code)
      .emit("xoturn", turn[code], nameByRoom[code][turn[code] - 1]);
  }

  function handleTurnMade(index) {
    const roomName = clientRooms[client.id];
    const boardArr = boardState[roomName];
    boardState[roomName][index] = client.number;
    let currentTurn = turn[roomName];
    if (checkForWin(boardArr, currentTurn)) {
      io.sockets.in(roomName).emit("winner", currentTurn);
      clearData(roomName, client);
    } else if (checkForDraw(boardArr)) {
      io.sockets.in(roomName).emit("draw");
      clearData(roomName, client);
    } else {
      turn[roomName] = currentTurn == 1 ? 2 : 1;
      io.sockets
        .in(roomName)
        .emit(
          "xoturn",
          turn[roomName],
          nameByRoom[roomName][turn[roomName] - 1]
        );
      io.sockets.in(roomName).emit("boardState", boardState[roomName]);
    }
  }

  function handleDisconnect() {
    const roomName = clientRooms[client.id];
    io.sockets.in(roomName).emit("exitGame");
    clearData(roomName, client);
  }
});

//Clears room data and additionals
function clearData(roomName, client) {
  delete boardState[roomName];
  delete nameByRoom[roomName];
  delete clientRooms[client.id];
  delete turn[roomName];
}
//Checks if someone won
function checkForWin(boardArr, currentTurn) {
  return winCombinations.some((combination) => {
    return combination.every((c) => {
      if (boardArr[c] === currentTurn) {
        return true;
      }

      return false;
    });
  });
}

//Checks if board is full ,then draw
function checkForDraw(boardArr) {
  return boardArr.every((c) => {
    if (c != undefined) {
      return true;
    }
    return false;
  });
}

//Sets all 9 cell value to undefined
function initGame() {
  const state = Array.apply(null, Array(9)).map(function () {});
  return state;
}

//Generates a unique id for a room
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//Server port init
io.listen(process.env.PORT || 8080);
