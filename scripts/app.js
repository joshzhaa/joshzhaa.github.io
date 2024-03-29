'use strict';

import init, { start, width, height, select, piece_at, player_at, valid_at, rewind } from './chess_rules.js';

class Piece {
    constructor(pieceID, playerID, highlight_state) {
        this.pieceID = pieceID;
        this.playerID = playerID;
        this.highlight = highlight_state;
    }
}

class Move {
    constructor(pieceID, playerID, target) {
        this.pieceID = pieceID;
        this.playerID = playerID;
        this.target = target;
    }
}

let ROOT = document.getElementById('root');

// represents m x n board as m * n array
let board = [];
// represents history as 
let history = [];
let ROWS;
let COLS;
let started = false;

// @@@ convert betweeen (x, y) and 1D index in board
function vectorToIndex(vector) {
    return width() * vector[1] + vector[0];
}
function indexToVector(index) {
    return [Math.floor(index / COLS), index % COLS]
}

// @@@ for detecting whether board state has changed
function pieceEquals(left, right) {
    return left.pieceID == right.pieceID && left.playerID == right.playerID;
}

// @@@ init state
function begin() {
    start();
    ROWS = height();
    COLS = width();
    board = Array(ROWS * COLS);
    createBoard();
    drawBoard();
    started = true;
    initUndoButton();
}

function createBoard() {
    let boardElement = document.getElementById('chess-board');
    for (let y = ROWS - 1; y >= 0; y--) {
        let rowElement = document.createElement('div');
        rowElement.className = 'board-row';
        // axis label
        for (let x = 0; x < COLS; x++) {
            board[vectorToIndex([x, y])] = new Piece(' ', 0, false);
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
    const index = vectorToIndex([x, y])
    const prev = board[index];
    board[index] = new Piece(
        piece_at(x, y), player_at(x, y), valid_at(x, y)
    );
    const next = board[index];
    if (!pieceEquals(prev, next) && next.pieceID != 32) {
        recordHistory(next.pieceID, next.playerID, String.fromCharCode(x + 'a'.charCodeAt(0)) + (y + 1).toString());
    }
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

function recordHistory(pieceID, playerID, target) {
    if (!started) return;
    history.push(new Move(pieceID, target));
    // add element to history
    let historyElement = document.getElementById('chess-history');
    let entryElement = document.createElement('div');
    entryElement.classList.add('history-entry');
    const halfmoveIndex = history.length;
    entryElement.classList.add(
        'h' + halfmoveIndex, 
        halfmoveIndex % 2 == 0 ?
            'light-green':
            'dark-green',
    );
    // halfmove index
    const indexElement = document.createElement('span');
    indexElement.classList.add('history-index');
    indexElement.innerHTML = halfmoveIndex + '.';
    entryElement.appendChild(indexElement);
    // sprite icon
    let iconElement = document.createElement('img');
    const spriteName = playerID == 1 ?
        String.fromCharCode(pieceID):
        String.fromCharCode(pieceID).toLowerCase();
    iconElement.src = `images/${spriteTable[spriteName]}`;
    iconElement.classList.add('history-icon');
    entryElement.appendChild(iconElement);
    // text
    let textElement = document.createElement('span');
    textElement.classList.add('history-text');
    textElement.innerHTML = target;
    entryElement.appendChild(textElement);
    historyElement.insertBefore(entryElement, historyElement.children[1]);
}

// other controls
function undo() {
    console.log('rewinding');
    rewind(1);
    drawBoard();
}
function initUndoButton() {
    const undoButton = document.getElementById('rewind-button');
    console.log(undoButton);
    undoButton.addEventListener('click', function() {
        console.log('here');
    });
    console.log(undoButton);
}


init().then(() => {
    begin()
});
