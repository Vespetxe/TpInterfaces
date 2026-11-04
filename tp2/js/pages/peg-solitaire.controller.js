// ===== Controller de Peg Solitaire =====
// Recibe clics y arrastres, consulta las reglas al Model y actualiza la View.
class PegSolitaireController {
    // Conecta el Model, el Canvas, la View y la función que actualiza la interfaz.
    constructor(model, canvas, view, onChange) {
        this.model = model;
        this.canvas = canvas;
        this.view = view;
        this.onChange = onChange;
        this.selectedCell = null;
        this.draggingCell = null;
        this.pointerPosition = null;
        this.hintMove = null;
        this.invalidPoint = null;
        this.invalidTimeout = null;
        this.started = false;
        this.finished = model.getState().status !== "playing";
        this.result = model.getState().status;
        this.timeLimit = 120000;
        this.remainingTime = this.timeLimit;
        this.startedAt = null;
        this.timerInterval = null;

        // Los eventos de puntero funcionan con mouse y con pantallas táctiles.
        const controller = this;
        canvas.addEventListener("pointerdown", function (event) {
            controller.selectPiece(event);
        });
        canvas.addEventListener("pointermove", function (event) {
            controller.dragPiece(event);
        });
        canvas.addEventListener("pointerup", function (event) {
            controller.dropPiece(event);
        });

        this.updateView();
    }

    // Habilita las jugadas e inicia el tiempo máximo cuando comienza la partida.
    start() {
        if (this.finished || this.started) return;
        this.started = true;
        this.startedAt = performance.now();
        const controller = this;
        this.timerInterval = window.setInterval(function () {
            const elapsed = performance.now() - controller.startedAt;
            controller.remainingTime = Math.max(0, controller.timeLimit - elapsed);

            if (controller.remainingTime === 0) {
                controller.finish("timeout");
            } else {
                controller.updateView();
            }
        }, 250);
        this.updateView();
    }

    // Detiene el intervalo para que el reloj no siga luego de terminar o reiniciar.
    stopTimer() {
        window.clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.startedAt = null;
    }

    // Selecciona una ficha, o intenta mover la ficha seleccionada con un clic.
    selectPiece(event) {
        if (!this.started || this.finished || event.button !== 0) return;

        const cell = this.view.getCellAt(event);
        const point = this.view.getCanvasPoint(event);

        if (!cell) {
            // Un clic fuera del tablero no cambia la selección ni muestra una marca.
            return;
        }

        if (!this.model.hasPeg(cell.row, cell.col)) {
            // Un segundo clic en una casilla vacía intenta completar el salto.
            if (this.selectedCell) this.tryMove(this.selectedCell, cell);
            return;
        }

        // Al hacer clic en otra ficha, esa ficha pasa a ser la seleccionada.
        this.selectedCell = { row: cell.row, col: cell.col };
        this.draggingCell = { row: cell.row, col: cell.col };
        this.pointerPosition = point;
        this.canvas.setPointerCapture(event.pointerId);
        this.updateView();
    }

    // Mueve visualmente la ficha seleccionada mientras el usuario la arrastra.
    dragPiece(event) {
        if (!this.draggingCell) return;
        this.pointerPosition = this.view.getCanvasPoint(event);
        this.updateView();
    }

    // Al soltar la ficha, intenta el salto o muestra que el destino no está permitido.
    dropPiece(event) {
        if (!this.draggingCell || this.finished) return;

        const origin = this.draggingCell;
        const destination = this.view.getCellAt(event);
        this.draggingCell = null;
        this.pointerPosition = null;

        if (!destination) {
            // Si se suelta fuera del tablero, la ficha vuelve a su lugar sin marcar una X.
            this.selectedCell = origin;
            this.updateView();
            return;
        }

        if (destination.row === origin.row && destination.col === origin.col) {
            this.selectedCell = origin;
            this.updateView();
            return;
        }

        if (this.model.hasPeg(destination.row, destination.col)) {
            this.selectedCell = destination;
            this.updateView();
            return;
        }

        this.tryMove(origin, destination);
    }

    // Pide al Model validar una jugada. Si la rechaza, conserva seleccionada la ficha.
    tryMove(origin, destination) {
        const result = this.model.move(origin, destination);

        if (!result.valid) {
            this.selectedCell = origin;
            const point = this.view.getCellCenter(destination.row, destination.col);
            this.showForbidden(point);
            return;
        }

        this.selectedCell = null;
        this.hintMove = null;
        this.invalidPoint = null;
        if (result.state.status !== "playing") {
            this.finish(result.state.status);
            return;
        }
        this.updateView();
    }

    // Marca temporalmente un destino prohibido para que la View muestre una señal roja.
    showForbidden(point) {
        this.invalidPoint = {
            x: Math.max(24, Math.min(this.view.logicalWidth - 24, point.x)),
            y: Math.max(24, Math.min(this.view.logicalHeight - 24, point.y))
        };

        window.clearTimeout(this.invalidTimeout);
        this.updateView();
        const controller = this;
        this.invalidTimeout = window.setTimeout(function () {
            controller.invalidPoint = null;
            controller.updateView();
        }, 650);
    }

    // Elige una jugada válida para que la View anime su origen y destino.
    showHint() {
        const moves = this.getMovesForSelected();
        let availableMoves = moves;

        // Si no hay ficha seleccionada, se puede mostrar cualquier jugada legal.
        if (!this.selectedCell) availableMoves = this.model.getLegalMoves();
        if (!this.started || this.finished || availableMoves.length === 0) return;

        this.hintMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        this.updateView();
    }

    // Devuelve las jugadas legales que empiezan en la ficha seleccionada.
    getMovesForSelected() {
        const moves = this.model.getLegalMoves();
        const selectedMoves = [];
        if (!this.selectedCell) return selectedMoves;

        for (let i = 0; i < moves.length; i++) {
            if (
                moves[i].from.row === this.selectedCell.row &&
                moves[i].from.col === this.selectedCell.col
            ) {
                selectedMoves.push(moves[i]);
            }
        }
        return selectedMoves;
    }

    // Reinicia la posición actual y deja la partida detenida hasta pulsar Start.
    reset() {
        window.clearTimeout(this.invalidTimeout);
        this.stopTimer();
        this.model.reset();
        this.started = false;
        this.finished = this.model.getState().status !== "playing";
        this.result = this.model.getState().status;
        this.selectedCell = null;
        this.draggingCell = null;
        this.pointerPosition = null;
        this.hintMove = null;
        this.invalidPoint = null;
        this.remainingTime = this.timeLimit;
        this.updateView();
    }

    // Cambia la forma o la posición inicial del tablero elegido.
    setModel(model) {
        window.clearTimeout(this.invalidTimeout);
        this.stopTimer();
        this.model = model;
        this.started = false;
        this.finished = model.getState().status !== "playing";
        this.result = model.getState().status;
        this.selectedCell = null;
        this.draggingCell = null;
        this.pointerPosition = null;
        this.hintMove = null;
        this.invalidPoint = null;
        this.remainingTime = this.timeLimit;
        this.updateView();
    }

    // Finaliza al ganar o cuando no quedan movimientos posibles.
    finish(result) {
        this.stopTimer();
        this.finished = true;
        this.result = result;
        this.selectedCell = null;
        this.draggingCell = null;
        this.updateView();
    }

    // Envía a la View el tablero y los datos visuales de la selección y el hint.
    updateView() {
        this.onChange({
            state: this.model.getState(),
            legalMoves: this.model.getLegalMoves(),
            selectedMoves: this.getMovesForSelected(),
            selectedCell: this.selectedCell,
            draggingCell: this.draggingCell,
            pointerPosition: this.pointerPosition,
            hintMove: this.hintMove,
            invalidPoint: this.invalidPoint,
            started: this.started,
            finished: this.finished,
            result: this.result,
            remainingTime: this.remainingTime
        });
    }
}

// Permite que el archivo de inicio cree el Controller.
window.PegSolitaireController = PegSolitaireController;
