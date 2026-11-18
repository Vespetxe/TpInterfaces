// ===== Moonlit Flight: estado, entrada, actualización y dibujo =====
const RUNNER_ASSETS = [
    "assets/img/runner/bat-sheet.svg",
    "assets/img/runner/candy-sheet.svg",
    "assets/img/runner/ghost-sheet.svg",
    "assets/img/runner/clouds.svg",
    "assets/img/runner/hills.svg",
    "assets/img/runner/castles.svg",
    "assets/img/runner/foreground.svg"
];

function initRunner(hero) {
    const root = document.createElement("section");
    root.className = "runner";
    root.setAttribute("aria-label", "Moonlit Flight runner game");
    root.innerHTML = `
        <div class="runner__topbar">
            <div class="runner__brand"><span aria-hidden="true">☾</span> Moonlit Flight</div>
            <div class="runner__stats" aria-live="polite">
                <span>Score <strong id="runnerScore">0</strong></span>
                <span>Time <strong id="runnerTime">120</strong></span>
            </div>
        </div>
        <div class="runner__stage" id="runnerStage" tabindex="0" role="application" aria-label="Game area. Press Space or Arrow Up to flap">
            <div class="runner__layer runner__layer--clouds" aria-hidden="true"></div>
            <div class="runner__layer runner__layer--hills" aria-hidden="true"></div>
            <div class="runner__layer runner__layer--castles" aria-hidden="true"></div>
            <div class="runner__layer runner__layer--foreground" aria-hidden="true"></div>
            <div class="runner__towers" id="runnerTowers" aria-hidden="true"></div>
            <div class="runner__items" id="runnerItems" aria-hidden="true"></div>
            <div class="runner__bat" id="runnerBat" role="img" aria-label="Kawaii bat">
                <span class="runner__bat-sprite" aria-hidden="true"></span>
                <span class="runner__cheeks" aria-hidden="true"></span>
            </div>
            <div class="runner__ground" aria-hidden="true"></div>
            <div class="runner__overlay" id="runnerOverlay" aria-live="polite">
                <div class="runner__card">
                    <p class="runner__eyebrow">A tiny Halloween adventure</p>
                    <h2 id="runnerOverlayTitle">Ready to fly?</h2>
                    <p id="runnerOverlayText">Tower bumps are harmless. Collect candy, avoid ghosts and fly until dawn.</p>
                    <button type="button" class="runner__button" id="runnerMainButton" disabled>Loading the moonlight…</button>
                    <p class="runner__hint">Space / ↑ / click to flap</p>
                </div>
            </div>
        </div>
        <div class="runner__legend" aria-label="Game rules">
            <span><i class="runner__legend-icon runner__legend-icon--candy" aria-hidden="true">🍬</i> Candy +5</span>
            <span><i class="runner__legend-icon runner__legend-icon--ghost" aria-hidden="true">👻</i> Ghost −3</span>
            <span>Tower bumps are harmless</span>
        </div>
        <button type="button" class="runner__exit" id="runnerExit">Back to game page</button>
    `;
    hero.appendChild(root);

    const stage = root.querySelector("#runnerStage");
    const bat = root.querySelector("#runnerBat");
    const towersLayer = root.querySelector("#runnerTowers");
    const itemsLayer = root.querySelector("#runnerItems");
    const scoreOutput = root.querySelector("#runnerScore");
    const timeOutput = root.querySelector("#runnerTime");
    const overlay = root.querySelector("#runnerOverlay");
    const overlayTitle = root.querySelector("#runnerOverlayTitle");
    const overlayText = root.querySelector("#runnerOverlayText");
    const mainButton = root.querySelector("#runnerMainButton");
    const exitButton = root.querySelector("#runnerExit");
    const layers = [...root.querySelectorAll(".runner__layer")];
    const layerSpeeds = [0.12, 0.24, 0.48, 0.82];
    const input = { flap: false };
    const towers = [];
    const items = [];
    let animationFrame = 0;
    let previousFrame = 0;
    let state = "loading";
    let elapsed = 0;
    let score = 0;
    let batY = 0;
    let batVelocity = 0;
    let distance = 0;
    let nextTowerIn = 0.8;
    let nextItemIn = 1.3;
    let lastStageWidth = 0;
    let lastStageHeight = 0;

    const onKeyDown = (event) => {
        if (!["Space", "ArrowUp", "KeyW"].includes(event.code)) return;
        event.preventDefault();
        if (event.repeat) return;
        if (state === "ready") startGame();
        if (state === "playing") input.flap = true;
    };
    const onPointerDown = (event) => {
        if (event.target.closest("button")) return;
        if (state === "ready") startGame();
        if (state === "playing") input.flap = true;
    };
    const onKeyUp = (event) => {
        if (["Space", "ArrowUp", "KeyW"].includes(event.code)) input.flap = false;
    };
    const onBlur = () => { input.flap = false; };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    stage.addEventListener("pointerdown", onPointerDown);
    mainButton.addEventListener("click", () => {
        if (state === "ready") startGame();
        else if (state === "over") resetGame();
    });
    exitButton.addEventListener("click", leaveGame);

    function preloadAssets() {
        return Promise.all(RUNNER_ASSETS.map((src) => new Promise((resolve) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = resolve;
            image.src = src;
        })));
    }

    function formatSeconds(value) {
        return String(Math.max(0, Math.ceil(value))).padStart(2, "0");
    }

    function startGame() {
        if (state !== "ready") return;
        state = "playing";
        elapsed = 0;
        score = 0;
        distance = 0;
        batVelocity = 0;
        batY = stage.clientHeight * 0.46;
        nextTowerIn = 0.65;
        nextItemIn = 1.1;
        towers.splice(0).forEach((tower) => tower.node.remove());
        items.splice(0).forEach((item) => item.node.remove());
        scoreOutput.textContent = "0";
        timeOutput.textContent = "120";
        overlay.hidden = true;
        stage.focus({ preventScroll: true });
        previousFrame = performance.now();
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(frame);
    }

    function resetGame() {
        state = "ready";
        overlayTitle.textContent = "Ready to fly?";
        overlayText.textContent = "Tower bumps are harmless. Collect candy, avoid ghosts and fly until dawn.";
        mainButton.textContent = "Start flight";
        overlay.hidden = false;
        startGame();
    }

    function endGame(won) {
        if (state !== "playing") return;
        state = "over";
        cancelAnimationFrame(animationFrame);
        overlayTitle.textContent = won ? "You made it to dawn!" : "The bat needs a little rest";
        overlayText.textContent = `Final score: ${score}. ${won ? "What a lovely night flight!" : "Try again and gather more candy."}`;
        mainButton.textContent = "Fly again";
        overlay.hidden = false;
    }

    function leaveGame() {
        cancelAnimationFrame(animationFrame);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        stage.removeEventListener("pointerdown", onPointerDown);
        root.remove();
        hero.classList.remove("game-hero--runner-started", "game-hero--enabled");
        const playButton = hero.querySelector(".game-hero__play");
        if (playButton) playButton.style.display = "";
    }

    function makeTower() {
        const stageHeight = stage.clientHeight;
        const gapSize = Math.max(132, 202 - elapsed * 1.05);
        const gapCenter = stageHeight * (0.34 + Math.random() * 0.34);
        const node = document.createElement("div");
        node.className = "runner__tower-pair";
        node.setAttribute("aria-hidden", "true");
        node.innerHTML = `
            <div class="runner__tower runner__tower--top"></div>
            <div class="runner__tower runner__tower--bottom"></div>
        `;
        const top = node.firstElementChild;
        const bottom = node.lastElementChild;
        top.style.height = `${Math.max(24, gapCenter - gapSize / 2)}px`;
        bottom.style.top = `${gapCenter + gapSize / 2}px`;
        bottom.style.height = `${Math.max(24, stageHeight - gapCenter - gapSize / 2)}px`;
        towersLayer.appendChild(node);
        towers.push({ node, x: stage.clientWidth + 30, gapTop: gapCenter - gapSize / 2, gapBottom: gapCenter + gapSize / 2, bonked: false });
    }

    function makeItem() {
        const isCandy = Math.random() < 0.58;
        const node = document.createElement("div");
        node.className = `runner__pickup runner__pickup--${isCandy ? "candy" : "ghost"}`;
        node.setAttribute("aria-hidden", "true");
        itemsLayer.appendChild(node);
        items.push({ node, type: isCandy ? "candy" : "ghost", x: stage.clientWidth + 24, y: stage.clientHeight * (0.24 + Math.random() * 0.55), collected: false });
    }

    function setScore(nextScore, pickupType) {
        score = nextScore;
        scoreOutput.textContent = String(score);
        root.classList.remove("is-scoring", "is-spooked");
        void root.offsetWidth;
        root.classList.add(pickupType === "candy" ? "is-scoring" : "is-spooked");
        window.setTimeout(() => root.classList.remove("is-scoring", "is-spooked"), 420);
    }

    function overlaps(a, b) {
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    }

    function frame(now) {
        if (state !== "playing") return;
        const dt = Math.min((now - previousFrame) / 1000, 0.05);
        previousFrame = now;
        update(dt);
        draw();
        if (state === "playing") animationFrame = requestAnimationFrame(frame);
    }

    function update(dt) {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        if (width !== lastStageWidth || height !== lastStageHeight) {
            lastStageWidth = width;
            lastStageHeight = height;
            batY = Math.min(Math.max(batY, 32), height - 32);
        }

        elapsed += dt;
        const remaining = Math.max(0, 120 - elapsed);
        timeOutput.textContent = formatSeconds(remaining);
        if (remaining <= 0) {
            endGame(true);
            return;
        }

        if (input.flap) {
            batVelocity = -405;
            bat.classList.remove("is-flapping");
            void bat.offsetWidth;
            bat.classList.add("is-flapping");
            input.flap = false;
        }
        batVelocity = Math.min(690, batVelocity + 1120 * dt);
        batY += batVelocity * dt;
        distance += 225 * dt;

        if (batY < 12 || batY > height - 42) {
            endGame(false);
            return;
        }

        nextTowerIn -= dt;
        if (nextTowerIn <= 0) {
            makeTower();
            nextTowerIn = 1.55 + Math.random() * 0.55;
        }
        nextItemIn -= dt;
        if (nextItemIn <= 0) {
            makeItem();
            nextItemIn = 1.35 + Math.random() * 1.15;
        }

        const batBounds = { left: width * 0.22 + 13, right: width * 0.22 + 47, top: batY + 10, bottom: batY + 38 };
        for (let i = towers.length - 1; i >= 0; i--) {
            const tower = towers[i];
            tower.x -= 225 * dt;
            tower.node.style.transform = `translate3d(${tower.x}px, 0, 0)`;
            const towerLeft = tower.x + 10;
            const towerRight = towerLeft + 56;
            const hitsTower = batBounds.right > towerLeft && batBounds.left < towerRight
                && (batBounds.top < tower.gapTop || batBounds.bottom > tower.gapBottom);
            if (hitsTower && !tower.bonked) {
                tower.bonked = true;
                bat.classList.remove("is-bonking");
                void bat.offsetWidth;
                bat.classList.add("is-bonking");
                window.setTimeout(() => bat.classList.remove("is-bonking"), 420);
            }
            if (tower.x < -100) {
                tower.node.remove();
                towers.splice(i, 1);
            }
        }

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.x -= 225 * dt;
            item.node.style.transform = `translate3d(${item.x}px, ${item.y + Math.sin(elapsed * 4 + i) * 6}px, 0)`;
            const pickupBounds = { left: item.x + 7, right: item.x + 39, top: item.y + 7, bottom: item.y + 39 };
            if (overlaps(batBounds, pickupBounds)) {
                setScore(score + (item.type === "candy" ? 5 : -3), item.type);
                item.node.remove();
                items.splice(i, 1);
                continue;
            }
            if (item.x < -50) {
                item.node.remove();
                items.splice(i, 1);
            }
        }
    }

    function draw() {
        const offsets = layerSpeeds.map((factor) => `${-(distance * factor % 900)}px 0px`);
        layers.forEach((layer, index) => { layer.style.backgroundPosition = offsets[index]; });
        bat.style.left = `${stage.clientWidth * 0.22}px`;
        bat.style.top = `${batY}px`;
        bat.style.transform = `rotate(${Math.max(-24, Math.min(55, batVelocity * 0.055))}deg)`;
    }

    function prepareGame() {
        const preload = preloadAssets();
        preload.then(() => {
            if (!root.isConnected || state !== "loading") return;
            state = "ready";
            mainButton.disabled = false;
            mainButton.textContent = "Start flight";
            batY = stage.clientHeight * 0.46;
            lastStageWidth = stage.clientWidth;
            lastStageHeight = stage.clientHeight;
            draw();
        });
    }

    mainButton.disabled = true;
    prepareGame();
}
