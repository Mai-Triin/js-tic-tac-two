import * as UI from "./ui.js";
import { GameBrain } from "./game.js";
import { BasicAI } from "./ai.js";

// Get mode from URL before anything else
let params = new URLSearchParams(window.location.search);
let mode = params.get("mode") || "hvh"; // Default to Human vs Human
let isVsAI = mode === "hva";

// Now you can use mode safely
let aiPlayer = "O";
let ai;
if (isVsAI) ai = new BasicAI(aiPlayer);


let game = new GameBrain();
let gameStarted = false;
let timerInterval;
let startTime;

let h1 = document.createElement("h1");
h1.innerHTML = "TIC TAC TWO";
document.body.appendChild(h1);

// Create game mode buttons
let modeButtons = document.createElement("div");
modeButtons.classList.add("mode-buttons");

let humanBtn = document.createElement("button");
humanBtn.innerText = "Human vs Human";
humanBtn.addEventListener("click", () => {
    window.location.search = "?mode=hvh";
});

let aiBtn = document.createElement("button");
aiBtn.innerText = "Human vs AI";
aiBtn.addEventListener("click", () => {
    window.location.search = "?mode=hva";
});

modeButtons.appendChild(humanBtn);
modeButtons.appendChild(aiBtn);
document.body.appendChild(modeButtons);

if (mode === "hvh") {
    humanBtn.classList.add("active-mode");
} else {
    aiBtn.classList.add("active-mode");
}

let currentModeLabel = document.createElement("p");
currentModeLabel.style.fontWeight = "bold";
currentModeLabel.style.color = "#666";
currentModeLabel.innerText = `Current Mode: ${isVsAI ? "Human vs AI 🤖" : "Human vs Human 👥"}`;
document.body.appendChild(currentModeLabel);


// Display player turn info
let turnInfo = document.createElement("h2");
turnInfo.innerHTML = `Player Turn: ${game.currentPlayer}`;
document.body.appendChild(turnInfo);

// Display game instructions/messages
let gameMessage = document.createElement("p");
gameMessage.innerHTML = "Place your pieces inside the grid.";
document.body.appendChild(gameMessage);

// Display game timer
let timerDisplay = document.createElement("p");
timerDisplay.innerHTML = "Time: 0s";
document.body.appendChild(timerDisplay);

let boardElement = UI.getInitialBoard(game.board, handleCellClick, game.gridStartX, game.gridStartY, game.gridSize);
document.body.appendChild(boardElement);

// Create move grid buttons
let controls = document.createElement("div");
controls.classList.add("controls");

const directions = ["UpLeft", "Up", "UpRight", "Left", "Right", "DownLeft", "Down", "DownRight"];
directions.forEach(direction => {
    let button = document.createElement("button");
    button.innerText = direction;
    button.addEventListener("click", () => moveGrid(direction));
    button.disabled = true; // Initially disabled
    controls.appendChild(button);
});

document.body.appendChild(controls);

// Add reset button
let resetButton = document.createElement("button");
resetButton.innerText = "Reset Game";
resetButton.classList.add("reset-btn");
resetButton.addEventListener("click", () => location.reload());
document.body.appendChild(resetButton);

function updateControls() {
    let moveAllowed = game.piecesPlaced["X"] >= 2 && game.piecesPlaced["O"] >= 2;
    document.querySelectorAll(".controls button").forEach(button => {
        button.disabled = !moveAllowed;
    });
    game.allowPieceMove = moveAllowed; // Enable moving pieces after 4 total placements
    
    updateGameMessage();
}

function updateGameMessage() {
    if (game.winner) {
        gameMessage.innerHTML = `Player ${game.winner} wins!`;
        clearInterval(timerInterval); // Stop the timer when game ends
        return;
    }
    if (game.piecesPlaced["X"] < game.maxPieces || game.piecesPlaced["O"] < game.maxPieces) {
        gameMessage.innerHTML = `Player ${game.currentPlayer}, place a piece inside the grid.`;
    } else {
        gameMessage.innerHTML = `Player ${game.currentPlayer}, you can move an existing piece inside the grid or move the grid.`;
    }
    turnInfo.innerHTML = `Player Turn: ${game.currentPlayer}`;
}

function startTimer() {
    if (!gameStarted) {
        gameStarted = true;
        startTime = Date.now();
        timerInterval = setInterval(() => {
            let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            timerDisplay.innerHTML = `Time: ${elapsedTime}s`;
        }, 1000);
    }
}


function moveGrid(direction) {
    if (game.winner) return;
    
    if (game.moveGrid(direction)) {
        UI.updateBoard(boardElement, game.board, game.gridStartX, game.gridStartY, game.gridSize);
        updateGameMessage();
        triggerAIMoveIfNeeded();
    }
}

function handleCellClick(x, y, e) {
    if (game.winner) return;
    startTimer();

    // Handle move or placement
    if (game.allowPieceMove) {
        if (game.selectedPiece) {
            if (game.isWithinGrid(x, y) && game.movePiece(x, y)) {
                UI.updateBoard(boardElement, game.board, game.gridStartX, game.gridStartY, game.gridSize);
                game.selectedPiece = null;
                updateGameMessage();
                triggerAIMoveIfNeeded();
                return;
            }
        } else if (game.isWithinGrid(x, y) && game.selectPiece(x, y)) {
            e.target.classList.add("selected");
            gameMessage.innerHTML = "Now click an empty spot inside the grid to move your piece.";
            return;
        }
    }

    if (game.piecesPlaced[game.currentPlayer] < game.maxPieces) {
        if (game.makeAMove(x, y)) {
            UI.updateBoard(boardElement, game.board, game.gridStartX, game.gridStartY, game.gridSize);
            updateControls();
            updateGameMessage();
            triggerAIMoveIfNeeded();
        } else {
            gameMessage.innerHTML = "Invalid move! Choose an empty spot inside the grid.";
        }
    }
}


function triggerAIMoveIfNeeded() {
    if (isVsAI && game.currentPlayer === aiPlayer && !game.winner) {
        setTimeout(() => {
            let decision = ai.pickMove(
                game.board,
                game.gridStartX,
                game.gridStartY,
                game.gridSize,
                game.piecesPlaced,
                game.maxPieces,
                game.boardSize
            );

            if (!decision) return;

            if (decision.type === "place") {
                game.makeAMove(decision.to.x, decision.to.y);
            } else if (decision.type === "move") {
                game.selectedPiece = decision.from;
                game.movePiece(decision.to.x, decision.to.y);
            } else if (decision.type === "grid") {
                game.moveGrid(decision.direction);
            }

            UI.updateBoard(boardElement, game.board, game.gridStartX, game.gridStartY, game.gridSize);
            updateControls();
            updateGameMessage();
        }, 500);
    }
}

