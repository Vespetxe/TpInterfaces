// ===== Controller de Peg Solitaire =====
// Recibe las acciones del usuario, se las comunica al Model y actualiza la View.
class PegSolitaireController {
    // Conecta el modelo con el canvas y las funciones de dibujo de la View.
    constructor(model, canvas, view, onChange, timeLimitSeconds) {
        this.model = model;
        this.canvas = canvas;
        this.view = view;
        this.onChange = onChange;
        if (timeLimitSeconds === undefined) timeLimitSeconds = 120;
        this.timeLimitSeconds = timeLimitSeconds; // null deja el tiempo sin límite.
        this.selectedCell = null;
        this.draggingCell = null;
        this.pointerPosition = null;
        this.hintMove = null;
        this.started = false;
        this.finished = model.getState().status !== "playing";
        this.result = model.getState().status;
        this.seconds = 0;
        this.timerId = null;

        // Los eventos de puntero sirven para mouse y también para pantallas táctiles.
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

    // Comienza la partida y activa el reloj.
    start() {
        if (this.finished || this.started) return;
        this.started = true;
        const controller = this;
        this.timerId = window.setInterval(function () {
            controller.updateTimer();
        }, 1000);
        this.updateView();
    }

    // Suma el tiempo o resta el tiempo límite; al llegar a cero termina la partida.
    updateTimer() {
        this.seconds++;
        if (this.timeLimitSeconds !== null && this.seconds >= this.timeLimitSeconds) {
            this.finish("timeout");
            return;
        }
        this.updateView();
    }

    // Selecciona una ficha y guarda que el usuario empezó a arrastrarla.
    selectPiece(event) {
        if (!this.started || this.finished || event.button !== 0) return;
        const cell = this.view.getCellAt(event);
        if (!cell || !this.model.hasPeg(cell.row, cell.col)) return;

        this.selectedCell = cell;
        this.draggingCell = cell;
        this.pointerPosition = { x: event.offsetX, y: event.offsetY };
        this.canvas.setPointerCapture(event.pointerId);
        this.updateView();
    }

    // Actualiza la vista mientras la ficha sigue al puntero.
    dragPiece(event) {
        if (!this.draggingCell) return;
        this.pointerPosition = { x: event.offsetX, y: event.offsetY };
        this.updateView();
    }

    // Al soltar, intenta realizar el salto. El Model decide si es válido.
    dropPiece(event) {
        if (!this.draggingCell || this.finished) return;

        const destination = this.view.getCellAt(event);
        const origin = this.draggingCell;
        this.draggingCell = null;
        this.pointerPosition = null;

        if (destination) {
            const move = this.model.move(origin, destination);
            if (move.valid) {
                this.selectedCell = null;
                this.hintMove = null;
                if (move.state.status !== "playing") {
                    this.finish(move.state.status);
                    return;
                }
            } else {
                this.selectedCell = this.model.hasPeg(destination.row, destination.col)
                    ? destination
                    : null;
            }
        } else {
            this.selectedCell = null;
        }

        this.updateView();
    }

    // Elige una jugada válida al azar para que la View muestre su animación de ayuda.
    showHint() {
        const moves = this.model.getLegalMoves();
        if (!this.started || this.finished || moves.length === 0) return;
        this.hintMove = moves[Math.floor(Math.random() * moves.length)];
        this.updateView();
    }

    // Reinicia el tablero y deja la partida lista para comenzar otra vez.
    reset() {
        window.clearInterval(this.timerId);
        this.timerId = null;
        this.model.reset();
        this.seconds = 0;
        this.started = false;
        this.finished = this.model.getState().status !== "playing";
        this.result = this.model.getState().status;
        this.selectedCell = null;
        this.draggingCell = null;
        this.pointerPosition = null;
        this.hintMove = null;
        this.updateView();
    }

    // Detiene el nivel cuando se gana, se pierde o se acaba el tiempo.
    finish(result) {
        this.finished = true;
        this.result = result;
        window.clearInterval(this.timerId);
        this.timerId = null;
        this.updateView();
    }

    // Envía a la View el estado del tablero y los datos que necesita para dibujar.
    updateView() {
        this.onChange({
            state: this.model.getState(),
            legalMoves: this.model.getLegalMoves(),
            selectedCell: this.selectedCell,
            draggingCell: this.draggingCell,
            pointerPosition: this.pointerPosition,
            hintMove: this.hintMove,
            started: this.started,
            finished: this.finished,
            result: this.result,
            seconds: this.seconds,
            timeLimitSeconds: this.timeLimitSeconds
        });
    }
}

// Permite cargar el Controller desde un script normal en el navegador.
window.PegSolitaireController = PegSolitaireController;
