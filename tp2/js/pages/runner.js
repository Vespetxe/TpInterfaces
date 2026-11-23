// ===== Moonlit Flight: estado, entrada, actualización y dibujo =====
const RUNNER_ASSETS = [
    "assets/img/runner/murcielago_playing.png",
    "assets/img/runner/murcielago_playing_aleteo.png",
    "assets/img/runner/murcielago_hurt.png",
    "assets/img/runner/murcielago_lose.png",
    "assets/img/runner/caramelo.png",
    "assets/img/runner/fantasmita.png",
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
        </div>
        <div class="runner__stage" id="runnerStage" tabindex="0" role="application" aria-label="Game area. Press Space or Arrow Up to flap">
            <div class="runner__stats" aria-live="polite">
                <span class="runner__lives" aria-label="Lives"><strong id="runnerLives"></strong></span>
                <span class="runner__score">Score <strong id="runnerScore">0</strong></span>
            </div>
            <div class="runner__layer runner__layer--clouds" aria-hidden="true"></div>
            <div class="runner__layer runner__layer--hills" aria-hidden="true"></div>
            <div class="runner__layer runner__layer--castles" aria-hidden="true"></div>
            <div class="runner__layer runner__layer--foreground" aria-hidden="true"></div>
            <div class="runner__towers" id="runnerTowers" aria-hidden="true"></div>
            <div class="runner__items" id="runnerItems" aria-hidden="true"></div>
            <div class="runner__bat" id="runnerBat" role="img" aria-label="Kawaii bat">
                <img class="runner__bat-pose runner__bat-pose--base" src="assets/img/runner/murcielago_playing.png" alt="">
                <img class="runner__bat-pose runner__bat-pose--flap" src="assets/img/runner/murcielago_playing_aleteo.png" alt="">
                <img class="runner__bat-state" src="assets/img/runner/murcielago_hurt.png" alt="">
            </div>
            <div class="runner__overlay" id="runnerOverlay" aria-live="polite">
                <div class="runner__card">
                    <p class="runner__eyebrow">A tiny Halloween adventure</p>
                    <h2 id="runnerOverlayTitle">Ready to fly?</h2>
                    <p id="runnerOverlayText">Use up to 10 lives to fly through the night. Collect candy, avoid ghosts and towers.</p>
                    <button type="button" class="runner__button" id="runnerMainButton" disabled>Loading the moonlight…</button>
                    <p class="runner__hint">Space / ↑ / click to flap</p>
                </div>
            </div>
        </div>
        <div class="runner__legend" aria-label="Game rules">
            <span><i class="runner__legend-icon runner__legend-icon--candy" aria-hidden="true">🍬</i> Candy +1 life</span>
            <span><i class="runner__legend-icon runner__legend-icon--ghost" aria-hidden="true">👻</i> Ghost −1 life</span>
            <span>Tower and edge hits −1 life</span>
        </div>
        <button type="button" class="runner__exit" id="runnerExit">Back to game page</button>
    `;
    hero.appendChild(root);

    const stage = root.querySelector("#runnerStage");
    const bat = root.querySelector("#runnerBat");
    const batStateImage = root.querySelector(".runner__bat-state");
    const towersLayer = root.querySelector("#runnerTowers");
    const itemsLayer = root.querySelector("#runnerItems");
    const scoreOutput = root.querySelector("#runnerScore");
    const livesOutput = root.querySelector("#runnerLives");
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
    const maxLives = 10;
    let lives = maxLives;
    let hitCooldown = 0;
    let batY = 0;
    let batVelocity = 0;
    let distance = 0;
    let nextTowerIn = 0.8;
    let lastStageWidth = 0;
    let lastStageHeight = 0;

    const onKeyDown = (event) => {
        if (!["Space", "ArrowUp", "KeyW"].includes(event.code)) return;
        event.preventDefault();
        if (event.repeat) return;
        if (state === "ready") startGame();
        if (state === "playing") queueFlap();
    };
    const onPointerDown = (event) => {
        if (event.target.closest("button")) return;
        if (state === "ready") startGame();
        if (state === "playing") queueFlap();
    };
    const onKeyUp = (event) => {
        if (["Space", "ArrowUp", "KeyW"].includes(event.code)) input.flap = false;
    };
    const onBlur = () => { input.flap = false; };

    function queueFlap() {
        input.flap = true;
        bat.classList.add("is-rising");
        bat.classList.remove("is-falling");
    }

    function setBatImage(src) {
        batStateImage.src = src;
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    stage.addEventListener("pointerdown", onPointerDown);
    mainButton.addEventListener("click", () => {
        if (state === "ready") { startGame(); queueFlap(); }
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

    function renderLives() {
        livesOutput.textContent = "♥".repeat(lives) + "♡".repeat(maxLives - lives);
        livesOutput.setAttribute("aria-label", `${lives} of ${maxLives} lives`);
    }

    function loseLife(ignoreCooldown = false) {
        if ((!ignoreCooldown && hitCooldown > 0) || state !== "playing") return false;
        lives = Math.max(0, lives - 1);
        hitCooldown = 0.8;
        renderLives();
        bat.classList.remove("is-hurt", "is-dead");
        void bat.offsetWidth;
        if (lives === 0) bat.classList.add("is-dead");
        else bat.classList.add("is-hurt");
        setBatImage(lives === 0 ? "assets/img/runner/murcielago_lose.png" : "assets/img/runner/murcielago_hurt.png");
        window.setTimeout(() => {
            bat.classList.remove("is-hurt");
            if (state === "playing" && lives > 0) setBatImage("assets/img/runner/murcielago_playing.png");
        }, 480);
        if (lives === 0) endGame();
        return true;
    }

    function gainLife() {
        lives = Math.min(maxLives, lives + 1);
        renderLives();
    }

    function startGame() {
        if (state !== "ready") return;
        state = "playing";
        elapsed = 0;
        score = 0;
        lives = maxLives;
        hitCooldown = 0;
        bat.classList.remove("is-hurt", "is-rising", "is-falling");
        setBatImage("assets/img/runner/murcielago_playing.png");
        distance = 0;
        batVelocity = 0;
        batY = stage.clientHeight * 0.46;
        nextTowerIn = 0.65;
        towers.splice(0).forEach((tower) => tower.node.remove());
        items.splice(0).forEach((item) => item.node.remove());
        scoreOutput.textContent = "0";
        renderLives();
        overlay.hidden = true;
        stage.focus({ preventScroll: true });
        previousFrame = performance.now();
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(frame);
    }

    function resetGame() {
        state = "ready";
        overlayTitle.textContent = "Ready to fly?";
        overlayText.textContent = "Use up to 10 lives to fly through the night. Collect candy, avoid ghosts and towers.";
        mainButton.textContent = "Start flight";
        overlay.hidden = false;
        startGame();
        queueFlap();
    }

    function endGame() {
        if (state !== "playing") return;
        state = "over";
        cancelAnimationFrame(animationFrame);
        overlayTitle.textContent = "The bat needs a little rest";
        overlayText.textContent = `Final score: ${score}. The bat ran out of lives. Try again and collect more candy.`;
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
        const tower = { node, x: stage.clientWidth + 30, gapTop: gapCenter - gapSize / 2, gapBottom: gapCenter + gapSize / 2, gapCenter, gapSize, bonked: false, passed: false };
        towers.push(tower);
        return tower;
    }

    function makeItem(tower, type, spacingToNextTower) {
        const isCandy = type === "candy";
        const node = document.createElement("div");
        node.className = `runner__pickup runner__pickup--${isCandy ? "candy" : "ghost"}`;
        node.setAttribute("aria-hidden", "true");
        node.innerHTML = `<img src="assets/img/runner/${isCandy ? "caramelo.png" : "fantasmita.png"}" alt="">`;
        itemsLayer.appendChild(node);
        const pickupHeight = 42;
        const routeRange = Math.max(0, (tower.gapSize - pickupHeight) / 2 - 8);
        const yOffset = (Math.random() * 2 - 1) * routeRange;
        const offsetMagnitude = isCandy ? Math.random() * routeRange : routeRange * (0.65 + Math.random() * 0.3);
        const signedOffset = isCandy ? yOffset : offsetMagnitude * (Math.random() < 0.5 ? -1 : 1);
        items.push({ node, type: isCandy ? "candy" : "ghost", x: tower.x + spacingToNextTower / 2, y: tower.gapCenter + signedOffset - pickupHeight / 2, collected: false });
    }

    function setScore(nextScore, pickupType) {
        score = nextScore;
        scoreOutput.textContent = String(score);
        root.classList.remove("is-scoring", "is-spooked", "is-candy-pickup");
        void root.offsetWidth;
        root.classList.add(pickupType === "ghost" ? "is-spooked" : "is-scoring");
        if (pickupType === "candy") root.classList.add("is-candy-pickup");
        window.setTimeout(() => root.classList.remove("is-scoring", "is-spooked", "is-candy-pickup"), 420);
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
        hitCooldown = Math.max(0, hitCooldown - dt);

        if (input.flap) {
            batVelocity = -405;
            bat.classList.add("is-rising");
            bat.classList.remove("is-falling");
            input.flap = false;
        }
        batVelocity = Math.min(690, batVelocity + 1120 * dt);
        batY += batVelocity * dt;
        distance += 225 * dt;
        if (batVelocity > 45) {
            bat.classList.add("is-falling");
            bat.classList.remove("is-rising");
        }

        if (batY < 12) {
            batY = 12;
            batVelocity = Math.max(180, Math.abs(batVelocity) * 0.72);
            bat.classList.add("is-falling");
            bat.classList.remove("is-rising");
            loseLife();
        } else if (batY > height - 70) {
            batY = height - 70;
            batVelocity = -Math.max(245, Math.abs(batVelocity) * 0.62);
            bat.classList.add("is-rising");
            bat.classList.remove("is-falling");
            loseLife();
        }

        nextTowerIn -= dt;
        if (nextTowerIn <= 0) {
            const tower = makeTower();
            nextTowerIn = Math.max(1.15, 1.55 - elapsed * 0.004) + Math.random() * 0.45;
            if (Math.random() < 0.5) {
                const type = Math.random() < 0.5 ? "ghost" : "candy";
                makeItem(tower, type, 225 * nextTowerIn);
            }
        }

        const batBounds = { left: width * 0.22 + 13, right: width * 0.22 + 47, top: batY + 10, bottom: batY + 38 };
        for (let i = towers.length - 1; i >= 0; i--) {
            const tower = towers[i];
            tower.x -= 225 * dt;
            tower.node.style.transform = `translate3d(${tower.x}px, 0, 0)`;
            const towerLeft = tower.x + 10;
            const towerRight = towerLeft + 56;
            if (!tower.passed && tower.x + 82 < batBounds.left) {
                tower.passed = true;
                setScore(score + 1, "pass");
            }
            const hitsTower = batBounds.right > towerLeft && batBounds.left < towerRight
                && (batBounds.top < tower.gapTop || batBounds.bottom > tower.gapBottom);
            if (hitsTower && !tower.bonked) {
                tower.bonked = true;
                if (loseLife()) {
                    batVelocity = batY < (tower.gapTop + tower.gapBottom) / 2 ? -260 : 260;
                    bat.classList.toggle("is-rising", batVelocity < 0);
                    bat.classList.toggle("is-falling", batVelocity >= 0);
                }
            }
            if (tower.x < -100) {
                tower.node.remove();
                towers.splice(i, 1);
            }
        }

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.x -= 225 * dt;
            item.node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
            const pickupBounds = { left: item.x + 7, right: item.x + 39, top: item.y + 7, bottom: item.y + 39 };
            if (overlaps(batBounds, pickupBounds)) {
                if (!item.collected) {
                    item.collected = true;
                    item.node.classList.add("is-collected");
                    if (item.type === "candy") {
                        setScore(score + 5, "candy");
                        gainLife();
                    } else {
                        loseLife(true);
                        root.classList.add("is-spooked");
                        window.setTimeout(() => root.classList.remove("is-spooked"), 420);
                    }
                    window.setTimeout(() => item.node.remove(), 380);
                }
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
