// ===== View de Peg Solitaire =====
// Dibuja el tablero en el Canvas y traduce el puntero a una casilla.
class PegSolitaireView {
    // Prepara el Canvas y carga las imágenes que se usan durante la partida.
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.canvas.width = 960;
        this.canvas.height = 540;
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = "high";
        this.cellSize = 64;
        this.boardX = 256;
        this.boardY = 46;
        this.gameData = null;
        this.animatingHint = false;
        this.images = {};
        this.previews = [];

        this.loadImages();
    }

    // Carga el fondo y las variantes de cada personaje. Al terminar cada imagen,
    // vuelve a dibujar por si el estado del juego ya está disponible.
    loadImages() {
        // El fondo nuevo se usa por defecto; el anterior queda disponible en el selector.
        this.images.background = this.loadImage("assets/img/pegsolitarie/fondo default.jpg");
        this.images.plankton = {
            normal: this.loadImage("assets/img/pegsolitarie/ficha-plankton-default.png"),
            selected: this.loadImage("assets/img/pegsolitarie/ficha-plankton-hover.png"),
            defeated: this.loadImage("assets/img/pegsolitarie/ficha-plankton-loser.png")
        };
        this.images.bob = {
            normal: this.loadImage("assets/img/pegsolitarie/ficha-bob-default.png"),
            selected: this.loadImage("assets/img/pegsolitarie/ficha-bob-hover.png"),
            defeated: this.loadImage("assets/img/pegsolitarie/ficha-bob-loser.png")
        };
    }

    // Cambia el fondo del tablero cuando el jugador elige la otra alternativa.
    setBackground(path) {
        this.images.background = this.loadImage(path);
    }

    // Crea un objeto Image y guarda su ruta. Cuando carga, actualiza el Canvas.
    loadImage(path) {
        const image = new Image();
        const view = this;
        image.onload = function () {
            view.draw();
            view.drawPreviews();
        };
        image.src = path;
        return image;
    }

    // Recibe una copia del estado enviada por el Controller y redibuja el juego.
    render(gameData) {
        this.gameData = gameData;
        this.draw();

        // Si hay un hint, comienza a animarlo. Si se limpió, la animación se detiene.
        if (gameData.hintMove && !this.animatingHint) {
            this.animatingHint = true;
            this.animateHint();
        } else if (!gameData.hintMove) {
            this.animatingHint = false;
        }
    }

    // Dibuja el fondo, los espacios del tablero y las fichas visibles.
    draw() {
        const context = this.context;
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.images.background && this.images.background.complete && this.images.background.naturalWidth > 0) {
            // Recorta el centro del fondo para llenar el Canvas sin deformar la imagen.
            const image = this.images.background;
            const imageRatio = image.naturalWidth / image.naturalHeight;
            const canvasRatio = this.canvas.width / this.canvas.height;
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = image.naturalWidth;
            let sourceHeight = image.naturalHeight;

            if (imageRatio > canvasRatio) {
                sourceWidth = image.naturalHeight * canvasRatio;
                sourceX = (image.naturalWidth - sourceWidth) / 2;
            } else {
                sourceHeight = image.naturalWidth / canvasRatio;
                sourceY = (image.naturalHeight - sourceHeight) / 2;
            }
            context.drawImage(
                image,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        }

        if (!this.gameData) return;

        const cells = this.gameData.state.cells;
        // El Model envía las casillas del tablero elegido, así la View no inventa reglas.
        for (let i = 0; i < cells.length; i++) {
            this.drawHole(cells[i].row, cells[i].col);
        }

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const isDraggedPiece = this.gameData.draggingCell &&
                this.gameData.draggingCell.row === cell.row &&
                this.gameData.draggingCell.col === cell.col;

            if (cell.occupied && !isDraggedPiece) {
                this.drawPiece(cell.row, cell.col, this.isSelected(cell) ? "selected" : "normal");
            }
        }

        // Mientras se arrastra, dibuja la ficha encima del puntero.
        if (this.gameData.draggingCell && this.gameData.pointerPosition) {
            const point = this.gameData.pointerPosition;
            const size = this.cellSize * 0.82;
            this.drawImageCentered(
                this.getPieceImage("selected", this.getCharacter(this.gameData.draggingCell.row, this.gameData.draggingCell.col)),
                point.x,
                point.y,
                size
            );
        }

        if (this.gameData.selectedCell) this.drawSelection(this.gameData.selectedCell);
        this.drawPossibleMoves(this.gameData.selectedMoves);
        if (this.gameData.hintMove) this.drawHint(this.gameData.hintMove);
        if (this.gameData.invalidPoint) this.drawInvalidMarker(this.gameData.invalidPoint);
    }

    // Dibuja una cavidad vacía con borde y sombra para distinguirla del fondo.
    drawHole(row, col) {
        const center = this.getCellCenter(row, col);
        const context = this.context;
        context.beginPath();
        context.arc(center.x, center.y, 29, 0, Math.PI * 2);
        context.fillStyle = "rgba(18, 20, 25, 0.72)";
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = "rgba(255, 205, 90, 0.9)";
        context.stroke();
    }

    // Dibuja una ficha en el centro de una casilla usando la imagen elegida.
    drawPiece(row, col, state) {
        const center = this.getCellCenter(row, col);
        const character = this.getCharacter(row, col);
        this.drawImageCentered(this.getPieceImage(state, character), center.x, center.y, this.cellSize * 0.82);
    }

    // Alterna los personajes por casilla para que Bob y Plankton aparezcan juntos.
    getCharacter(row, col) {
        return (row + col) % 2 === 0 ? "bob" : "plankton";
    }

    // Rodea la ficha seleccionada para que se note cuál se está moviendo.
    drawSelection(cell) {
        const center = this.getCellCenter(cell.row, cell.col);
        this.context.beginPath();
        this.context.arc(center.x, center.y, 34, 0, Math.PI * 2);
        this.context.lineWidth = 5;
        this.context.strokeStyle = "#fff36a";
        this.context.stroke();
    }

    // Resalta los espacios vacíos donde la ficha seleccionada puede aterrizar.
    drawPossibleMoves(moves) {
        for (let i = 0; i < moves.length; i++) {
            const center = this.getCellCenter(moves[i].to.row, moves[i].to.col);
            this.context.beginPath();
            this.context.arc(center.x, center.y, 24, 0, Math.PI * 2);
            this.context.lineWidth = 5;
            this.context.strokeStyle = "#70ff9d";
            this.context.stroke();
            this.context.beginPath();
            this.context.arc(center.x, center.y, 7, 0, Math.PI * 2);
            this.context.fillStyle = "rgba(112, 255, 157, 0.7)";
            this.context.fill();
        }
    }

    // Muestra una X roja donde se intentó hacer un movimiento prohibido.
    drawInvalidMarker(point) {
        this.context.save();
        this.context.fillStyle = "#ff3d42";
        this.context.strokeStyle = "#ffffff";
        this.context.lineWidth = 4;
        this.context.beginPath();
        this.context.arc(point.x, point.y, 23, 0, Math.PI * 2);
        this.context.fill();
        this.context.beginPath();
        this.context.moveTo(point.x - 9, point.y - 9);
        this.context.lineTo(point.x + 9, point.y + 9);
        this.context.moveTo(point.x + 9, point.y - 9);
        this.context.lineTo(point.x - 9, point.y + 9);
        this.context.stroke();
        this.context.restore();
    }

    // Elige la imagen normal, seleccionada o de derrota del personaje de esa casilla.
    getPieceImage(state, character) {
        const characterImages = this.images[character];
        if (this.gameData && (this.gameData.result === "lost" || this.gameData.result === "timeout")) {
            return characterImages.defeated;
        }
        return characterImages[state];
    }

    // Dibuja una imagen centrada en una coordenada del Canvas.
    drawImageCentered(image, x, y, size) {
        if (!image || !image.complete || image.naturalWidth === 0) return;
        this.context.drawImage(image, x - size / 2, y - size / 2, size, size);
    }

    // Devuelve el centro visual de una casilla según su fila y columna.
    getCellCenter(row, col) {
        return {
            x: this.boardX + col * this.cellSize + this.cellSize / 2,
            y: this.boardY + row * this.cellSize + this.cellSize / 2
        };
    }

    // Convierte la posición del puntero a coordenadas internas del Canvas.
    getCanvasPoint(event) {
        const bounds = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - bounds.left) * this.canvas.width / bounds.width,
            y: (event.clientY - bounds.top) * this.canvas.height / bounds.height
        };
    }

    // Identifica qué casilla se encuentra debajo del puntero; devuelve null si
    // está fuera del tablero o en una de las cuatro esquinas recortadas.
    getCellAt(event) {
        const point = this.getCanvasPoint(event);
        const col = Math.floor((point.x - this.boardX) / this.cellSize);
        const row = Math.floor((point.y - this.boardY) / this.cellSize);

        if (row < 0 || row > 6 || col < 0 || col > 6 || !this.gameData) return null;

        const cells = this.gameData.state.cells;
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].row === row && cells[i].col === col) {
                return { row: row, col: col };
            }
        }
        return null;
    }

    // Dibuja una miniatura del tablero para la pantalla de selección.
    drawPreview(canvas, layoutId) {
        let found = false;
        for (let i = 0; i < this.previews.length; i++) {
            if (this.previews[i].canvas === canvas) {
                this.previews[i].layoutId = layoutId;
                found = true;
            }
        }
        if (!found) this.previews.push({ canvas: canvas, layoutId: layoutId });
        this.paintPreview(canvas, layoutId);
    }

    // Redibuja las miniaturas cuando terminan de cargar las imágenes de las fichas.
    drawPreviews() {
        for (let i = 0; i < this.previews.length; i++) {
            const preview = this.previews[i];
            this.paintPreview(preview.canvas, preview.layoutId);
        }
    }

    // Pinta la forma del tablero y una ficha pequeña en cada casilla ocupada.
    paintPreview(canvas, layoutId) {
        let layout = PEG_BOARD_LAYOUTS[0];
        for (let i = 0; i < PEG_BOARD_LAYOUTS.length; i++) {
            if (PEG_BOARD_LAYOUTS[i].id === layoutId) layout = PEG_BOARD_LAYOUTS[i];
        }

        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#f3e6c9";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const cellSize = Math.min(canvas.width / 7, canvas.height / 7);
        const startX = (canvas.width - cellSize * 7) / 2;
        const startY = (canvas.height - cellSize * 7) / 2;
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                if (layout.rows[row].charAt(col) !== "x") continue;
                if (row === 3 && col === 3) continue;

                const character = this.getCharacter(row, col);
                const piece = this.images[character].normal;
                const x = startX + col * cellSize + cellSize / 2;
                const y = startY + row * cellSize + cellSize / 2;
                const size = cellSize * 0.82;
                if (piece.complete && piece.naturalWidth > 0) {
                    context.drawImage(piece, x - size / 2, y - size / 2, size, size);
                } else {
                    context.beginPath();
                    context.arc(x, y, size / 2, 0, Math.PI * 2);
                    context.fillStyle = "#d75b28";
                    context.fill();
                }
            }
        }
    }

    // Indica si la ficha corresponde a la que el jugador está seleccionando.
    isSelected(cell) {
        return this.gameData.selectedCell &&
            this.gameData.selectedCell.row === cell.row &&
            this.gameData.selectedCell.col === cell.col;
    }

    // Anima un hint dibujando repetidamente una flecha entre origen y destino.
    animateHint() {
        if (!this.animatingHint || !this.gameData || !this.gameData.hintMove) return;
        this.draw();
        const view = this;
        window.requestAnimationFrame(function () {
            view.animateHint();
        });
    }

    // Dibuja una flecha pulsante que señala una jugada posible.
    drawHint(move) {
        const from = this.getCellCenter(move.from.row, move.from.col);
        const to = this.getCellCenter(move.to.row, move.to.col);
        const context = this.context;
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const pulse = 0.55 + Math.sin(Date.now() / 180) * 0.35;

        context.save();
        context.globalAlpha = pulse;
        context.strokeStyle = "#ffffff";
        context.fillStyle = "#ffffff";
        context.lineWidth = 7;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();

        // Dibuja la punta de flecha calculando sus dos lados.
        context.beginPath();
        context.moveTo(to.x, to.y);
        context.lineTo(
            to.x - 20 * Math.cos(angle - Math.PI / 6),
            to.y - 20 * Math.sin(angle - Math.PI / 6)
        );
        context.lineTo(
            to.x - 20 * Math.cos(angle + Math.PI / 6),
            to.y - 20 * Math.sin(angle + Math.PI / 6)
        );
        context.closePath();
        context.fill();
        context.restore();
    }
}

// Expone la View para que el Controller pueda pedirle posiciones y redibujados.
window.PegSolitaireView = PegSolitaireView;
