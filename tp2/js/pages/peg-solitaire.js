// ===== Inicio e interfaz de Peg Solitaire =====
// Crea los controles y conecta Model, View y Controller.

function initPegSolitaire(hero) {
    const root = document.createElement("section");
    root.className = "peg-solitaire";
    root.setAttribute("aria-label", "Peg Solitaire game");
    root.innerHTML = `
        <canvas class="peg-solitaire__canvas" id="pegCanvas" aria-label="Peg Solitaire board">
            Drag or click a piece and choose an empty highlighted space.
        </canvas>

        <div class="peg-solitaire__topbar">
            <div class="peg-solitaire__stats">
                <span>Pieces <strong id="pegCount">32</strong></span>
                <span id="pegMessage" aria-live="polite">Select a piece to see its moves</span>
            </div>
            <div class="peg-solitaire__buttons">
                <button type="button" id="pegHint">Hint</button>
                <button type="button" id="pegRestart">Restart</button>
                <button type="button" id="pegInstructionsToggle" aria-expanded="false">How to play</button>
                <button type="button" id="pegExit">Exit</button>
            </div>
        </div>

        <div class="peg-solitaire__instructions" id="pegInstructions" hidden>
            <h2>How to play</h2>
            <p>Select a piece, then click a highlighted empty space, or drag the piece there.</p>
            <p>The piece jumps over one neighbor horizontally or vertically. The jumped piece is removed.</p>
            <p>Try to leave one piece. The game ends when there are no legal moves.</p>
            <button type="button" id="pegInstructionsClose">Got it</button>
        </div>

        <div class="peg-solitaire__setup" id="pegSetup">
            <h2>Peg Solitaire</h2>
            <p>Choose a board. SpongeBob and Plankton pieces are both included in the game.</p>
            <h3>Board</h3>
            <div class="peg-solitaire__board-options" id="pegBoardOptions">
                <button type="button" class="is-selected" data-layout="classic" aria-pressed="true">
                    <canvas width="168" height="112" data-board-preview="classic"></canvas>
                    <span>Classic cross</span>
                </button>
                <button type="button" data-layout="european" aria-pressed="false">
                    <canvas width="168" height="112" data-board-preview="european"></canvas>
                    <span>European</span>
                </button>
                <button type="button" data-layout="diamond" aria-pressed="false">
                    <canvas width="168" height="112" data-board-preview="diamond"></canvas>
                    <span>Diamond</span>
                </button>
            </div>

            <div class="peg-solitaire__background-preview">
                <img src="assets/img/pegsolitarie/tablero-fondo.png" alt="Current game background">
                <span>Game background</span>
            </div>

            <label for="pegGameType">Game</label>
            <select id="pegGameType">
                <option value="standard">Standard game</option>
                <option value="demo-win">Victory demo — one move</option>
                <option value="demo-loss">Game over demo — no moves</option>
            </select>
            <button type="button" class="peg-solitaire__primary" id="pegStart">Start game</button>
        </div>

        <div class="peg-solitaire__result" id="pegResult" hidden aria-live="polite">
            <h2 id="pegResultTitle"></h2>
            <p id="pegResultText"></p>
            <button type="button" id="pegPlayAgain">Play again</button>
            <button type="button" id="pegChooseGame">Choose another game</button>
        </div>
    `;
    hero.appendChild(root);

    const canvas = root.querySelector("#pegCanvas");
    const view = new PegSolitaireView(canvas);
    const pieceCount = root.querySelector("#pegCount");
    const message = root.querySelector("#pegMessage");
    const setup = root.querySelector("#pegSetup");
    const resultPanel = root.querySelector("#pegResult");
    const instructions = root.querySelector("#pegInstructions");
    let selectedLayout = "classic";
    let attemptStarted = false;

    // Crea la posición elegida. Las reglas siguen estando en el mismo Model.
    function createModel(gameType) {
        if (gameType === "demo-win") return PegSolitaireModel.createDemoWin(selectedLayout);
        if (gameType === "demo-loss") return PegSolitaireModel.createDemoLoss(selectedLayout);
        return new PegSolitaireModel({ layoutId: selectedLayout });
    }

    // Redibuja el Canvas y mantiene el contador y el mensaje de selección actualizados.
    function updateGame(data) {
        view.render(data);
        pieceCount.textContent = data.state.pegCount;

        if (data.selectedCell && data.selectedMoves.length > 0) {
            message.textContent = "Green spaces are valid moves";
        } else if (data.selectedCell) {
            message.textContent = "This piece has no available moves";
        } else if (data.invalidPoint) {
            message.textContent = "Move not allowed";
        } else {
            message.textContent = "Select a piece to see its moves";
        }

        if (attemptStarted && data.finished) showResult(data.result);
    }

    const controller = new PegSolitaireController(
        new PegSolitaireModel(),
        canvas,
        view,
        updateGame
    );

    // Muestra una victoria o un game over con un mensaje breve.
    function showResult(result) {
        const title = root.querySelector("#pegResultTitle");
        const detail = root.querySelector("#pegResultText");

        if (result === "won") {
            title.textContent = "You won!";
            detail.textContent = "Only one piece remains on the board.";
        } else {
            title.textContent = "Game over";
            detail.textContent = "There are no moves left. Try another strategy.";
        }
        resultPanel.hidden = false;
    }

    // Inicia una partida con el tablero y el tipo de partida seleccionados.
    function startSelectedGame() {
        const gameType = root.querySelector("#pegGameType").value;
        controller.setModel(createModel(gameType));
        attemptStarted = true;
        setup.hidden = true;
        resultPanel.hidden = true;
        controller.start();

        // La demo de game over ya comienza sin movimientos posibles.
        if (controller.finished) showResult(controller.result);
    }

    // Vuelve al selector sin salir de la página del juego.
    function chooseGame() {
        controller.reset();
        attemptStarted = false;
        resultPanel.hidden = true;
        setup.hidden = false;
    }

    // Seleccionar una tarjeta actualiza el borde y el estado accesible del botón.
    const boardButtons = root.querySelectorAll("#pegBoardOptions button");
    for (let i = 0; i < boardButtons.length; i++) {
        const button = boardButtons[i];
        view.drawPreview(button.querySelector("canvas"), button.dataset.layout);
        button.addEventListener("click", function () {
            for (let j = 0; j < boardButtons.length; j++) {
                boardButtons[j].classList.remove("is-selected");
                boardButtons[j].setAttribute("aria-pressed", "false");
            }
            button.classList.add("is-selected");
            button.setAttribute("aria-pressed", "true");
            selectedLayout = button.dataset.layout;
        });
    }

    // Los botones envían las acciones a la parte correspondiente del juego.
    root.querySelector("#pegStart").addEventListener("click", startSelectedGame);
    root.querySelector("#pegHint").addEventListener("click", function () {
        controller.showHint();
    });
    root.querySelector("#pegRestart").addEventListener("click", startSelectedGame);
    root.querySelector("#pegPlayAgain").addEventListener("click", startSelectedGame);
    root.querySelector("#pegChooseGame").addEventListener("click", chooseGame);

    // Abre o cierra las instrucciones ubicadas sobre el tablero.
    root.querySelector("#pegInstructionsToggle").addEventListener("click", function (event) {
        instructions.hidden = !instructions.hidden;
        event.currentTarget.setAttribute("aria-expanded", String(!instructions.hidden));
    });
    root.querySelector("#pegInstructionsClose").addEventListener("click", function () {
        instructions.hidden = true;
        root.querySelector("#pegInstructionsToggle").setAttribute("aria-expanded", "false");
    });

    // Sale del modo de juego y restaura el botón Play del detalle.
    root.querySelector("#pegExit").addEventListener("click", function () {
        controller.reset();
        root.remove();
        hero.classList.remove("game-hero--peg-started");
        hero.classList.remove("game-hero--enabled");
        hero.querySelector(".game-hero__play").style.display = "";
    });
}

// El detalle llama esta función cuando el usuario pulsa Play.
window.initPegSolitaire = initPegSolitaire;
