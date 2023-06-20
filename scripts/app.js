'use strict';

import init, { start, width, height, select, piece_at, player_at, valid_at, rewind } from './chess_rules.js';

class Piece {
    constructor(pieceID, playerID, highlight_state) {
        this.pieceID = pieceID;
        this.playerID = playerID;
        this.highlight = highlight_state;
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
    createBoard();
    createHistory();
    drawBoard();
}

function createHistory() {
    let historyElement = document.getElementById('chess-history');
    let entryElement = document.createElement('div');
    entryElement.classList.add('history-entry');
    let iconElement = document.createElement('img');
    iconElement.src = 'images/Chess_kdt45.svg';
    iconElement.classList.add('history-icon');
    entryElement.appendChild(iconElement);
    let textElement = document.createElement('span');
    textElement.classList.add('history-text');
    textElement.innerHTML = 'd4';
    entryElement.appendChild(textElement);
    historyElement.appendChild(entryElement);
    historyElement.appendChild(entryElement);
}

function createBoard() {
    let boardElement = document.getElementById('chess-board');
    for (let y = ROWS - 1; y >= 0; y--) {
        let rowElement = document.createElement('div');
        rowElement.className = 'board-row';
        // axis label
        for (let x = 0; x < COLS; x++) {
            // create square button
            let squareElement = document.createElement('button');
            squareElement.classList.add(
                (x + y) % 2 == 0 ? 'white': 'black',
                'square',
                'x' + x,
                'y' + y
            );
            squareElement.addEventListener('click', function() {
                const xCoord = parseInt(this.classList[2].slice(1));
                const yCoord = parseInt(this.classList[3].slice(1));
                console.log('selected (', xCoord, ', ', yCoord, ')');
                select(xCoord, yCoord);
                drawBoard();
            });
            squareElement.appendChild(createSprite());
            if (x == 0) {
                let rowLabel = document.createElement('span');
                rowLabel.innerHTML = y + 1;
                rowLabel.classList.add('axis-label');
                rowLabel.classList.add('row-label');
                squareElement.appendChild(rowLabel);
            }
            if (y == 0) {
                let rowLabel = document.createElement('span');
                rowLabel.innerHTML = String.fromCharCode(x + 'a'.charCodeAt(0));
                rowLabel.classList.add('axis-label');
                rowLabel.classList.add('col-label');
                squareElement.appendChild(rowLabel);
            }
            rowElement.appendChild(squareElement);
        }
        boardElement.appendChild(rowElement);
    }
}

function createSprite() {
    // put img in button, to be independently resized
    // put img inside of container, so they can be overlapped for highlight
    let container = document.createElement('div');
    container.classList.add('piece-highlight-container');
    let sprite = document.createElement('img');
    sprite.src = 'images/Sq_blank.svg';
    sprite.classList.add('piece');
    let highlight = document.createElement('img');
    highlight.src = 'images/Sq_blank.svg';
    highlight.classList.add('highlight');
    container.appendChild(sprite);
    container.appendChild(highlight);
    return container;
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
            squareElement.firstChild.children[0].src = spriteAt(x, y);
            if (board[vectorToIndex([x, y])].highlight) {
                squareElement.firstChild.children[1].src = 'images/Location_dot_black.svg';
            } else {
                squareElement.firstChild.children[1].src = 'images/Sq_blank.svg';
            }
        }
    }
}

function updateSquare(x, y) {
    board[vectorToIndex([x, y])] = new Piece(
        piece_at(x, y), player_at(x, y), valid_at(x, y)
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
    return `images/${spriteTable[spriteName]}`
}

init().then(() => {
    begin()
});
