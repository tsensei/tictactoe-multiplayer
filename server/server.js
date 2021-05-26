//Setting up socket server
const io = require("socket.io")({
  cors: {
    origin: "*",
  },
});

//Global object for board states and user/room lookup table
let boardState = {};
const clientRooms = {};
let turn = {};

//Client connect aftermath
io.on("connection", (client) => {
  console.log("connected");
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
  client.on("turnMade", handleTurnMade);

  //Join p1 to the room
  function handleNewGame() {
    //generates a roomid
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    boardState[roomName] = initGame();

    client.join(roomName);

    client.number = 1;

    client.emit("init", 1);
  }

  //Join p2 to room after validation
  function handleJoinGame(code) {
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

    client.emit("init", 2);

    client.emit("gameCode", code);

    turn[code] = Math.round(Math.random(0, 1)) == 0 ? 1 : 2;

    io.sockets.in(code).emit("xoturn", turn[code]);
  }

  function handleTurnMade(index) {
    const roomName = clientRooms[client.id];
    const boardArr = boardState[roomName];
    if (boardArr[index] == undefined) {
      boardArr[index] = client.number;
      turn[roomName] = turn[roomName] == 1 ? 2 : 1;
      io.sockets.in(roomName).emit("xoturn", turn[roomName]);
      io.sockets.in(roomName).emit("boardState", boardState[roomName]);
    } else {
      console.log("already selected");
    }
  }
});

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
io.listen(8080);
