export function getInitialBoard(boardState, cellUpdateFn, gridStartX = 0, gridStartY = 0, gridSize = 3) {
    let board = document.createElement("div");
    board.classList.add("board");

    for (let i = 0; i < boardState.length; i++) {
        let row = document.createElement("div");
        row.classList.add("row");
        for (let j = 0; j < boardState[i].length; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");

            if (i >= gridStartX && i < gridStartX + gridSize && j >= gridStartY && j < gridStartY + gridSize) {
                cell.classList.add("active-grid");
            }

            cell.addEventListener("click", (event) => cellUpdateFn(i, j, event));
            cell.innerHTML = boardState[i][j] || "&nbsp;";
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
    return board;
}

export function updateBoard(boardElement, boardState, gridStartX, gridStartY, gridSize) {
    let cells = boardElement.getElementsByClassName("cell");
    let index = 0;
    for (let i = 0; i < boardState.length; i++) {
        for (let j = 0; j < boardState[i].length; j++) {
            let cell = cells[index];
            cell.innerHTML = boardState[i][j] || "&nbsp;";
            cell.classList.remove("active-grid");
            if (i >= gridStartX && i < gridStartX + gridSize && j >= gridStartY && j < gridStartY + gridSize) {
                cell.classList.add("active-grid");
            }
            index++;
        }
    }
}
