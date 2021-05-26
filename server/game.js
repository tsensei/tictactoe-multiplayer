// const boardCells = document.querySelectorAll(".board-cell");

// let players = {
//   X: "Player One",
//   O: "Player Two",
// };

// //All possible combination for winning
// const winCombinations = [
//   [0, 1, 2],
//   [3, 4, 5],
//   [6, 7, 8],
//   [0, 3, 6],
//   [1, 4, 7],
//   [2, 5, 8],
//   [0, 4, 8],
//   [2, 4, 6],
// ];

// //State of current board
// let boardState = [];

// //Current Turn 'X' or 'O'
// let currentTurn;

// //Drawing 'X' or 'O' in passed cell

// function putX(cellNumber) {
//   const newImg = document.createElement("img");
//   newImg.src = "./img/close.svg";
//   newImg.className = "cell-x";
//   boardCells[cellNumber].appendChild(newImg);
// }

// function putO(cellNumber) {
//   const newImg = document.createElement("img");
//   newImg.src = "./img/rec.svg";
//   newImg.className = "cell-o";
//   boardCells[cellNumber].appendChild(newImg);
// }

// //Initialization function

// function init() {
//   //Sets all 9 array element to undefined
//
//   //Clears board
//   boardCells.forEach((cell) => {
//     if (cell.hasChildNodes()) {
//       cell.removeChild(cell.childNodes[0]);
//     }
//   });

//   //Adds click evt listener to each cell
//   boardCells.forEach((cell, index) => {
//     cell.addEventListener(
//       "click",
//       () => {
//         fillCell(cell, index);
//       },
//       { once: true }
//     );
//   });

//   currentTurn = Math.round(Math.random(0, 1)) ? "X" : "O";
// }

// //Calls each time a turn has ben used

// function fillCell(cell, index) {
//   if (cell.childNodes.length !== 0) {
//     return;
//   }

//   if (currentTurn === "X") {
//     putX(index);
//   } else if (currentTurn === "O") {
//     putO(index);
//   }

//   boardState[index] = currentTurn;
//   console.log(boardState);

//   if (checkForWin()) {
//     const restart = confirm(players[currentTurn] + " is the winnter!Restart?");
//     if (restart) {
//       init();
//     }
//   } else if (checkForDraw()) {
//     const restart = confirm("The game is draw.Restart?");
//     if (restart) {
//       init();
//     }
//   } else {
//     currentTurn = currentTurn == "X" ? "O" : "X";
//   }
// }

// //Checks if someone won
// function checkForWin() {
//   return winCombinations.some((combination) => {
//     return combination.every((c) => {
//       if (boardState[c] === currentTurn) {
//         return true;
//       }

//       return false;
//     });
//   });
// }

// //Checks if board is full ,then draw
// function checkForDraw() {
//   return boardState.every((c) => {
//     if (c != undefined) {
//       return true;
//     }
//     return false;
//   });
// }

// init();
