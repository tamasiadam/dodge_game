        // elemek lekérése
        const container = document.getElementById('game-container');
        const player = document.getElementById('player');
        const scoreElement = document.getElementById('score');
        const highscoreElement = document.getElementById('highscore')
        const uiScreen = document.getElementById('ui-screen');
        const startBtn = document.getElementById('start-btn');
        const gameTitle = document.getElementById('game-title');
        const finalScoreText = document.getElementById('final-score');
        const finalScoreValue = finalScoreText.querySelector('span');

        // játék változói
        let isPlaying = false;
        let score = 0;
        let highscore = 0;
        let startTime = 0;
        let playerX = 185;
        const playerSpeed = 6;
        let enemies = [];
        let animationId;
        let keys = {}; // lenyomott gombok tárolására

        // Gombnyomások figyelése
        window.addEventListener('keydown', (e) => keys[e.key] = true);
        window.addEventListener('keyup', (e) => keys[e.key] = false);

        // Gomb esemény
        startBtn.addEventListener('click', startGame);

        function startGame() {
            isPlaying = true;
            score = 0;
            playerX = 185;
            player.style.left = playerX + 'px';
            
            // Korábbi ellenfelek törlése
            enemies.forEach(enemy => enemy.element.remove());
            enemies = [];
            
            // UI eltüntetése
            uiScreen.classList.add('hidden');
            
            // Időmérés indítása
            startTime = performance.now();
            
            // Játékciklus indítása
            animationId = requestAnimationFrame(gameLoop);
        }

        function endGame() {
            isPlaying = false;
            cancelAnimationFrame(animationId); // Játék megállítása
            
            // UI megjelenítése
            uiScreen.classList.remove('hidden');
            gameTitle.textContent = "Játék Vége!";
            finalScoreText.classList.remove('hidden');
            finalScoreValue.textContent = Math.floor(score);
            startBtn.textContent = "Újraindítás";
            
        }

        function gameLoop(currentTime) {
            if (!isPlaying) return;

            // Pontszámítás: (jelenlegi idő - kezdési idő) / 100
            score = (currentTime - startTime) / 100;
            scoreElement.textContent = Math.floor(score);

            // Játékos mozgatása (figyelve a falakra)
            if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && playerX > 0) {
                playerX -= playerSpeed;
            }
            if ((keys['ArrowRight'] || keys['d'] || keys['D']) && playerX < container.clientWidth - 30) {
                playerX += playerSpeed;
            }
            player.style.left = playerX + 'px';

            // Új ellenfelek generálása (véletlenszerűen)
            // Ahogy nő a pontszám, minimálisan nőhet a generálási esély, de most egy fix 4%-ot használunk frame-enként
            if (Math.random() < 0.04) {
                const enemyEl = document.createElement('div');
                enemyEl.classList.add('enemy');
                const randomX = Math.random() * (container.clientWidth - 30);
                enemyEl.style.left = randomX + 'px';
                container.appendChild(enemyEl);
                
                enemies.push({
                    element: enemyEl,
                    x: randomX,
                    y: -30
                });
            }

            // Ellenfelek mozgatása és ütközésvizsgálat
            for (let i = 0; i < enemies.length; i++) {
                let enemy = enemies[i];
                
                // A sebesség enyhén nő az idő múlásával a kihívás érdekében
                let fallSpeed = 4 + (score / 150); 
                enemy.y += fallSpeed;
                enemy.element.style.top = enemy.y + 'px';

                // Ütközésvizsgálat (AABB - Axis-Aligned Bounding Box)
                // A játékos Y pozíciója fix: a 500px magas dobozban az aljától 20px-re van, 30px magas.
                // Tehát a játékos teteje Y = 450, alja Y = 480.
                if (
                    playerX < enemy.x + 30 &&       // Játékos bal széle túllóg az ellenfél jobb szélén
                    playerX + 30 > enemy.x &&       // Játékos jobb széle túllóg az ellenfél bal szélén
                    450 < enemy.y + 30 &&           // Játékos teteje fentebb van, mint az ellenfél alja
                    480 > enemy.y                   // Játékos alja lentebb van, mint az ellenfél teteje
                ) {
                    endGame(); // Ha minden igaz, összeértek!
                    return; 
                }

                // Ha az ellenfél kimegy a képernyőről, töröljük a memóriából
                if (enemy.y > container.clientHeight) {
                    enemy.element.remove();
                    enemies.splice(i, 1);
                    i--; // Visszaléptetjük az indexet, mivel töröltünk egy elemet a tömbből
                }
            }

            // Következő képkocka hívása
            animationId = requestAnimationFrame(gameLoop);
        }