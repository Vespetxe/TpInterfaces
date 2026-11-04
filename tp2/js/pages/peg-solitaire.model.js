// ===== Model de Peg Solitaire =====
// Guarda el tablero y aplica las reglas. No dibuja ni recibe eventos del mouse.

const PEG_DIRECTIONS = [
    { row: -1, col: 0 }, // arriba
    { row: 1, col: 0 },  // abajo
    { row: 0, col: -1 }, // izquierda
    { row: 0, col: 1 }   // derecha
];

// Cada fila usa x para una casilla del tablero y . para un espacio exterior.
// Las tres formas comparten las mismas reglas de movimiento.
const PEG_BOARD_LAYOUTS = [
    {
        id: "classic",
        name: "Classic",
        rows: ["..xxx..", "..xxx..", "xxxxxxx", "xxxxxxx", "xxxxxxx", "..xxx..", "..xxx.."]
    },
    {
        id: "european",
        name: "European",
        rows: ["..xxx..", ".xxxxx.", "xxxxxxx", "xxxxxxx", "xxxxxxx", ".xxxxx.", "..xxx.."]
    },
    {
        id: "diamond",
        name: "Diamond",
        rows: ["...x...", "..xxx..", ".xxxxx.", "xxxxxxx", ".xxxxx.", "..xxx..", "...x..."]
    }
];

class PegSolitaireModel {
    // Crea el tablero clásico. Las esquinas no forman parte de la cruz.
    constructor(options) {
        options = options || {};
        this.size = 7;
        this.layoutId = options.layoutId || "classic";
        this.layout = PEG_BOARD_LAYOUTS[0];

        // Busca el diseño elegido; si no existe, usa el clásico.
        for (let i = 0; i < PEG_BOARD_LAYOUTS.length; i++) {
            if (PEG_BOARD_LAYOUTS[i].id === this.layoutId) {
                this.layout = PEG_BOARD_LAYOUTS[i];
            }
        }
        this.layoutId = this.layout.id;
        this.cells = [];

        // Arma la lista de casillas válidas para la forma elegida usando dos bucles.
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.layout.rows[row].charAt(col) === "x") {
                    this.cells.push({ row: row, col: col });
                }
            }
        }

        // Si se reciben fichas, guarda esa posición; si no, ocupa todo menos el centro.
        this.initialPegs = [];
        if (options.occupied) {
            for (let i = 0; i < options.occupied.length; i++) {
                this.initialPegs.push({
                    row: options.occupied[i].row,
                    col: options.occupied[i].col
                });
            }
        } else {
            for (let j = 0; j < this.cells.length; j++) {
                const cell = this.cells[j];
                if (cell.row !== 3 || cell.col !== 3) {
                    this.initialPegs.push({ row: cell.row, col: cell.col });
                }
            }
        }

        this.reset();
    }

    // Comprueba si una posición pertenece a la forma de tablero elegida.
    isValidCell(row, col) {
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) return false;
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].row === row && this.cells[i].col === col) return true;
        }
        return false;
    }

    // Indica si hay una ficha en la posición indicada.
    hasPeg(row, col) {
        for (let i = 0; i < this.pegs.length; i++) {
            if (this.pegs[i].row === row && this.pegs[i].col === col) return true;
        }
        return false;
    }

    // Determina si Bob o Plankton ya no tiene fichas en el tablero.
    getWinner() {
        let hasBob = false;
        let hasPlankton = false;

        for (let i = 0; i < this.pegs.length; i++) {
            const peg = this.pegs[i];
            if ((peg.row + peg.col) % 2 === 0) {
                hasBob = true;
            } else {
                hasPlankton = true;
            }
            if (hasBob && hasPlankton) return null;
        }

        if (hasPlankton && !hasBob) return "plankton";
        if (hasBob && !hasPlankton) return "bob";
        return null;
    }

    // Devuelve una copia del estado para que la View pueda dibujar el tablero.
    getState() {
        const stateCells = [];
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            stateCells.push({
                row: cell.row,
                col: cell.col,
                occupied: this.hasPeg(cell.row, cell.col)
            });
        }
        return {
            cells: stateCells,
            pegCount: this.pegs.length,
            status: this.status,
            winner: this.getWinner(),
            layoutId: this.layoutId
        };
    }

    // Vuelve a colocar las fichas en su posición inicial.
    reset() {
        this.pegs = [];
        for (let i = 0; i < this.initialPegs.length; i++) {
            this.pegs.push({
                row: this.initialPegs[i].row,
                col: this.initialPegs[i].col
            });
        }

        this.status = "playing";
        if (this.getWinner()) {
            this.status = "won";
        } else if (this.getLegalMoves().length === 0) {
            this.status = "lost";
        }
        return this.getState();
    }

    // Busca saltos posibles probando las cuatro direcciones desde cada ficha.
    getLegalMoves() {
        const moves = [];
        if (this.status !== "playing") return moves;

        for (let i = 0; i < this.pegs.length; i++) {
            const peg = this.pegs[i];
            for (let j = 0; j < PEG_DIRECTIONS.length; j++) {
                const direction = PEG_DIRECTIONS[j];
                const overRow = peg.row + direction.row;
                const overCol = peg.col + direction.col;
                const toRow = peg.row + direction.row * 2;
                const toCol = peg.col + direction.col * 2;

                if (
                    this.isValidCell(overRow, overCol) &&
                    this.isValidCell(toRow, toCol) &&
                    this.hasPeg(overRow, overCol) &&
                    !this.hasPeg(toRow, toCol)
                ) {
                    moves.push({
                        from: { row: peg.row, col: peg.col },
                        over: { row: overRow, col: overCol },
                        to: { row: toRow, col: toCol }
                    });
                }
            }
        }
        return moves;
    }

    // Valida el salto, mueve la ficha, quita la ficha saltada y revisa el resultado.
    move(from, to) {
        if (this.status !== "playing") {
            return { valid: false, reason: "finished", state: this.getState() };
        }

        const moves = this.getLegalMoves();
        let chosenMove = null;
        for (let i = 0; i < moves.length; i++) {
            if (
                moves[i].from.row === from.row && moves[i].from.col === from.col &&
                moves[i].to.row === to.row && moves[i].to.col === to.col
            ) {
                chosenMove = moves[i];
                break;
            }
        }

        if (!chosenMove) {
            return { valid: false, reason: "illegal", state: this.getState() };
        }

        // Quita del array las dos fichas que participaron y agrega la que aterrizó.
        this.removePeg(chosenMove.from.row, chosenMove.from.col);
        this.removePeg(chosenMove.over.row, chosenMove.over.col);
        this.pegs.push({ row: chosenMove.to.row, col: chosenMove.to.col });

        if (this.getWinner()) {
            this.status = "won";
        } else if (this.getLegalMoves().length === 0) {
            this.status = "lost";
        }
        return { valid: true, move: chosenMove, state: this.getState() };
    }

    // Elimina una ficha del array buscando su fila y columna.
    removePeg(row, col) {
        for (let i = 0; i < this.pegs.length; i++) {
            if (this.pegs[i].row === row && this.pegs[i].col === col) {
                this.pegs.splice(i, 1);
                return;
            }
        }
    }

    // Posición preparada para mostrar una victoria con un solo salto.
    static createDemoWin(layoutId) {
        return new PegSolitaireModel({
            layoutId: layoutId,
            occupied: [{ row: 3, col: 0 }, { row: 3, col: 1 }]
        });
    }

    // Posición preparada para mostrar una derrota porque no tiene saltos posibles.
    static createDemoLoss(layoutId) {
        return new PegSolitaireModel({
            layoutId: layoutId,
            occupied: [{ row: 0, col: 3 }, { row: 3, col: 1 }]
        });
    }
}

// Hace que el Model esté disponible para los otros archivos del juego.
window.PegSolitaireModel = PegSolitaireModel;
window.PEG_BOARD_LAYOUTS = PEG_BOARD_LAYOUTS;
