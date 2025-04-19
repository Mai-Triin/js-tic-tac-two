export class BasicAI {
    constructor(playerSymbol) {
        this.player = playerSymbol;
    }

    getValidPlacements(board, gridStartX, gridStartY, gridSize) {
        let moves = [];
        for (let x = gridStartX; x < gridStartX + gridSize; x++) {
            for (let y = gridStartY; y < gridStartY + gridSize; y++) {
                if (board[x][y] === null) {
                    moves.push({ x, y });
                }
            }
        }
        return moves;
    }

    getOwnPieces(board) {
        let pieces = [];
        for (let x = 0; x < board.length; x++) {
            for (let y = 0; y < board[x].length; y++) {
                if (board[x][y] === this.player) {
                    pieces.push({ x, y });
                }
            }
        }
        return pieces;
    }

    getValidGridMoves(gridStartX, gridStartY, gridSize, boardSize) {
        const directions = {
            "Up": [0, -1], "Down": [0, 1], "Left": [-1, 0], "Right": [1, 0],
            "UpLeft": [-1, -1], "UpRight": [1, -1], "DownLeft": [-1, 1], "DownRight": [1, 1]
        };
    
        let valid = [];
    
        for (let dir in directions) {
            let [dx, dy] = directions[dir];
            let newX = gridStartX + dx;
            let newY = gridStartY + dy;
    
            if (
                newX >= 0 &&
                newY >= 0 &&
                newX + gridSize <= boardSize &&
                newY + gridSize <= boardSize
            ) {
                valid.push(dir);
            }
        }
    
        return valid;
    }    
    

    pickMoveAction(board, gridStartX, gridStartY, gridSize) {
        let placements = this.getValidPlacements(board, gridStartX, gridStartY, gridSize);
        if (placements.length === 0) return null;

        // Just return a random empty spot
        return placements[Math.floor(Math.random() * placements.length)];
    }

    findWinningMove(board, gridStartX, gridStartY, gridSize) {
        const gridEndX = gridStartX + gridSize;
        const gridEndY = gridStartY + gridSize;
    
        const winningLine = (b, x, y, dx, dy) => {
            for (let i = 1; i < 3; i++) {
                let xi = x + dx * i;
                let yi = y + dy * i;
                if (
                    xi < gridStartX || xi >= gridEndX ||
                    yi < gridStartY || yi >= gridEndY ||
                    b[xi][yi] !== this.player
                ) {
                    return false;
                }
            }
            return true;
        };
    
        let pieces = this.getOwnPieces(board).filter(p =>
            p.x >= gridStartX && p.x < gridEndX &&
            p.y >= gridStartY && p.y < gridEndY
        );
    
        let targets = this.getValidPlacements(board, gridStartX, gridStartY, gridSize);
    
        for (let from of pieces) {
            for (let to of targets) {
                // Simulate board clone
                let temp = board.map(row => row.slice());
                temp[from.x][from.y] = null;
                temp[to.x][to.y] = this.player;
    
                // Check all directions from `to`
                if (
                    winningLine(temp, to.x, to.y, 1, 0) || // row
                    winningLine(temp, to.x, to.y, 0, 1) || // col
                    winningLine(temp, to.x, to.y, 1, 1) || // diag
                    winningLine(temp, to.x, to.y, 1, -1)   // anti-diag
                ) {
                    return { from, to };
                }
            }
        }
    
        return null;
    } 
    
    findBlockingMove(board, gridStartX, gridStartY, gridSize, opponent) {
        const gridEndX = gridStartX + gridSize;
        const gridEndY = gridStartY + gridSize;
    
        const winningLine = (b, x, y, dx, dy) => {
            for (let i = 1; i < 3; i++) {
                let xi = x + dx * i;
                let yi = y + dy * i;
                if (
                    xi < gridStartX || xi >= gridEndX ||
                    yi < gridStartY || yi >= gridEndY ||
                    b[xi][yi] !== opponent
                ) {
                    return false;
                }
            }
            return true;
        };
    
        let targets = this.getValidPlacements(board, gridStartX, gridStartY, gridSize);
    
        for (let to of targets) {
            // Simulate opponent placing a piece here
            let temp = board.map(row => row.slice());
            temp[to.x][to.y] = opponent;
    
            if (
                winningLine(temp, to.x, to.y, 1, 0) || // row
                winningLine(temp, to.x, to.y, 0, 1) || // col
                winningLine(temp, to.x, to.y, 1, 1) || // diag
                winningLine(temp, to.x, to.y, 1, -1)   // anti-diag
            ) {
                return to;
            }
        }
    
        return null;
    }
    
    
    
    pickMove(board, gridStartX, gridStartY, gridSize, piecesPlaced, maxPieces, boardSize) {
        const opponent = this.player === "X" ? "O" : "X";
    
        // === PHASE 1: Still placing pieces ===
        if (piecesPlaced[this.player] < maxPieces) {
            // Block if opponent can win
            const blockMove = this.findBlockingMove(board, gridStartX, gridStartY, gridSize, opponent);
            if (blockMove) {
                return { type: "place", to: blockMove };
            }
    
            // Just place randomly
            return {
                type: "place",
                to: this.pickMoveAction(board, gridStartX, gridStartY, gridSize)
            };
        }
    
        // === PHASE 2: Move phase ===
    
        // 1. Try to win
        const winMove = this.findWinningMove(board, gridStartX, gridStartY, gridSize);
        if (winMove) {
            return {
                type: "move",
                from: winMove.from,
                to: winMove.to
            };
        }
    
        // 2. Try to block opponent win
        const blockMove = this.findBlockingMove(board, gridStartX, gridStartY, gridSize, opponent);
        if (blockMove) {
            const movablePieces = this.getOwnPieces(board).filter(p =>
                p.x >= gridStartX && p.x < gridStartX + gridSize &&
                p.y >= gridStartY && p.y < gridStartY + gridSize
            );
    
            if (movablePieces.length) {
                const from = movablePieces[Math.floor(Math.random() * movablePieces.length)];
                return {
                    type: "move",
                    from,
                    to: blockMove
                };
            }
        }
    
        // 3. Fallback to random piece move or grid movement
        const allPieces = this.getOwnPieces(board);
        const targets = this.getValidPlacements(board, gridStartX, gridStartY, gridSize);
    
        const movablePieces = allPieces.filter(p =>
            p.x >= gridStartX && p.x < gridStartX + gridSize &&
            p.y >= gridStartY && p.y < gridStartY + gridSize
        );
    
        const moveOptions = [];
    
        if (movablePieces.length && targets.length) {
            let from = movablePieces[Math.floor(Math.random() * movablePieces.length)];
            let to = targets[Math.floor(Math.random() * targets.length)];
            moveOptions.push({ type: "move", from, to });
        }
    
        const gridMoves = this.getValidGridMoves(gridStartX, gridStartY, gridSize, board.length);
        if (gridMoves.length) {
            let direction = gridMoves[Math.floor(Math.random() * gridMoves.length)];
            moveOptions.push({ type: "grid", direction });
        }
    
        if (moveOptions.length === 0) return null;
        return moveOptions[Math.floor(Math.random() * moveOptions.length)];
    }
}
