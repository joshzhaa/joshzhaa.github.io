'use strict';

import init, { start, width, height, select, piece_at, player_at, valid_at, rewind } from './chess_rules.js';

class Piece {
    constructor(pieceID, playerID) {
        this.pieceID = pieceID;
        this.playerID = playerID;
    }
}

let ROOT = document.getElementById('root');

// represents m x n board as m * n array
let board = [];
// represents history as an array of previous board arrays
let history = [];
let ROWS;
let COLS;

// @@@ convert betweeen (x, y) and 1D index in board
function vectorToIndex(vector) {
    return width() * vector[1] + vector[0];
}
function indexToVector(index) {
    return [Math.floor(index / COLS), index % COLS]
}

// @@@ init state
function begin() {
    start();
    ROWS = height();
    COLS = width();
    board = Array(ROWS * COLS);
    ROOT.appendChild(createBoard());
    ROOT.appendChild(createHistory());
    drawBoard()
}

function createBoard() {
    let boardElement = document.createElement('div');
    boardElement.id = 'chess-board';
    for (let y = ROWS - 1; y >= 0; y--) {
        let rowElement = document.createElement('div');
        rowElement.className = 'board-row';
        for (let x = 0; x < COLS; x++) {
            let squareElement = document.createElement('button');
            squareElement.classList.add((x + y) % 2 == 0 ? 'white': 'black');
            squareElement.classList.add('square');
            squareElement.classList.add('x' + x);
            squareElement.classList.add('y' + y);
            squareElement.addEventListener('click', function() {
                const xCoord = parseInt(this.classList[2].slice(1));
                const yCoord = parseInt(this.classList[3].slice(1));
                console.log('selected (', xCoord, ', ', yCoord, ')');
                select(xCoord, yCoord);
                drawBoard();
            });
            rowElement.appendChild(squareElement);
        }
        boardElement.appendChild(rowElement);
    }
    return boardElement;
}

function createHistory() {
    let historyElement = document.createElement('div');
    historyElement.id = 'chess-history';
    return historyElement;
}

// @@@ rendering
function drawBoard() {
    let boardElement = document.getElementById('chess-board');
    for (let i = 0; i < boardElement.children.length; i++) {
        const y = boardElement.children.length - i - 1;
        let rowElement = boardElement.children[i];
        for (let x = 0; x < rowElement.children.length; x++) {
            updateSquare(x, y);
            let squareElement = rowElement.children[x];
            squareElement.innerHTML = spriteAt(x, y);
        }
    }
}

function updateSquare(x, y) {
    board[vectorToIndex([x, y])] = new Piece(
        piece_at(x, y), player_at(x, y)
    );
}

const spriteTable = {
    'K': 'Chess_klt45.svg',
    'Q': 'Chess_qlt45.svg',
    'R': 'Chess_rlt45.svg',
    'B': 'Chess_blt45.svg',
    'N': 'Chess_nlt45.svg',
    'P': 'Chess_plt45.svg',
    'k': 'Chess_kdt45.svg',
    'q': 'Chess_qdt45.svg',
    'r': 'Chess_rdt45.svg',
    'b': 'Chess_bdt45.svg',
    'n': 'Chess_ndt45.svg',
    'p': 'Chess_pdt45.svg',
    ' ': 'Sq_blank.svg',
};

function spriteAt(x, y) {
    const piece = board[vectorToIndex([x, y])];
    const spriteName = piece.playerID == 1 ?
        String.fromCharCode(piece.pieceID):
        String.fromCharCode(piece.pieceID).toLowerCase();
    return `<img src=images/${spriteTable[spriteName]} height="35" width="35" />`
}

init().then(() => {
    begin()
});
