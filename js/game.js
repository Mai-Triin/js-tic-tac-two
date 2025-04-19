export class GameBrain {
    #board;
    currentPlayer = "X";
    moveCount = 0;
    maxPieces = 4; // Each player can only place 4 pieces
    piecesPlaced = { "X": 0, "O": 0 };
    boardSize = 5;
    gridSize = 3;
    selectedPiece = null; // Track selected piece for movement
    winner = null;
    
    constructor(boardSize = 5) {
        this.boardSize = boardSize;
        this.#board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
        this.gridStartX = Math.floor((this.boardSize - this.gridSize) / 2);
        this.gridStartY = Math.floor((this.boardSize - this.gridSize) / 2);
    }
    
    get board() {
        return this.#board;
    }

    makeAMove(x, y) {
        if (!this.isWithinGrid(x, y) || this.winner) return false;

        if (this.piecesPlaced[this.currentPlayer] < this.maxPieces) {
            if (this.#board[x][y] === null) {
                this.#board[x][y] = this.currentPlayer;
                this.piecesPlaced[this.currentPlayer]++;
                this.checkForWin();
                if (!this.winner) this.switchPlayer();
                return true;
            }
            return false;
        } 
        return false;
    }
    
    selectPiece(x, y) {
        if (this.#board[x][y] === this.currentPlayer) {
            this.selectedPiece = { x, y };
            return true;
        }
        return false;
    }
    
    movePiece(newX, newY) {
        if (!this.selectedPiece || !this.isWithinGrid(newX, newY) || this.winner) return false;

        const { x, y } = this.selectedPiece;
        if (this.#board[newX][newY] === null) {
            this.#board[newX][newY] = this.currentPlayer;
            this.#board[x][y] = null;
            this.selectedPiece = null;
            this.checkForWin();
            if (!this.winner) this.switchPlayer();
            return true;
        }
        return false;
    }

    moveGrid(direction) {
        if (this.winner) return false;

        const moves = {
            "Up": [0, -1], "Down": [0, 1], "Left": [-1, 0], "Right": [1, 0],
            "UpLeft": [-1, -1], "UpRight": [1, -1], "DownLeft": [-1, 1], "DownRight": [1, 1]
        };
        if (direction in moves) {
            let [dx, dy] = moves[direction];
            let newX = this.gridStartX + dx;
            let newY = this.gridStartY + dy;

            if (newX >= 0 && newX + this.gridSize <= this.boardSize &&
                newY >= 0 && newY + this.gridSize <= this.boardSize) {
                this.gridStartX = newX;
                this.gridStartY = newY;
                this.checkForWin();
                if (!this.winner) this.switchPlayer();
                return true;
            }
        }
        return false;
    }

    isWithinGrid(x, y) {
        return (
            x >= this.gridStartX && x < this.gridStartX + this.gridSize &&
            y >= this.gridStartY && y < this.gridStartY + this.gridSize
        );
    }

    checkForWin() {
        let winCondition = 3;
        for (let x = this.gridStartX; x < this.gridStartX + this.gridSize; x++) {
            for (let y = this.gridStartY; y < this.gridStartY + this.gridSize; y++) {
                if (this.#board[x][y] !== null) {
                    if (this.checkLine(x, y, 1, 0, winCondition) || // Check row
                        this.checkLine(x, y, 0, 1, winCondition) || // Check column
                        this.checkLine(x, y, 1, 1, winCondition) || // Check diagonal
                        this.checkLine(x, y, 1, -1, winCondition))  // Check anti-diagonal
                    {
                        this.winner = this.#board[x][y];
                        return;
                    }
                }
            }
        }
    }

    checkLine(startX, startY, dx, dy, length) {
        let piece = this.#board[startX][startY];
        for (let i = 1; i < length; i++) {
            let x = startX + i * dx;
            let y = startY + i * dy;
            if (!this.isWithinGrid(x, y) || this.#board[x][y] !== piece) {
                return false;
            }
        }
        return true;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }
}