const { createClient } = supabase;
const supabaseUrl = 'https://htzhplsnibiosetcrmkx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0emhwbHNuaWJpb3NldGNybWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzE0NTksImV4cCI6MjA2ODE0NzQ1OX0.wZ7uxtEqj76GQbgSgntJG9qBVcY4Wap-EJfoywhQm4s'
const supabaseClient = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
    const LATIN_ALPHABET = Object.keys(GALACTIC_PIXEL_DATA);
    const LEVELS = [
        { id: 1, title: 'Level 1: Buchstaben', questions: LATIN_ALPHABET, type: 'letters' },
        { id: 2, title: 'Level 2: Wörter', questions: WORDS, type: 'words' },
        { id: 3, title: 'Level 3: Sätze', questions: SENTENCES, type: 'sentences' }
    ];
    const QUESTIONS_PER_LEVEL = 10;

    let gameMode = 'campaign'; // 'campaign' or 'endless'
    let endlessType = 'letters'; // 'letters', 'words', 'sentences'
    let currentLevelIndex = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let questionsForCurrentLevel = [];
    let currentCorrectAnswer = '';
    let userInput = '';

    const body = document.body;
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const endlessMenuScreen = document.getElementById('endless-menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');

    const campaignButton = document.getElementById('campaign-button');
    const endlessModeButton = document.getElementById('endless-mode-button');
    const endlessSelectButtons = document.querySelectorAll('.btn-endless-select');
    const backToMainMenu1 = document.getElementById('back-to-main-menu-1');
    const backToMainMenu2 = document.getElementById('back-to-main-menu-2');

    const levelTitle = document.getElementById('level-title');
    const scoreDisplay = document.getElementById('score');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const instruction = document.getElementById('instruction');
    const questionDisplay = document.getElementById('question-display');
    const optionsContainer = document.getElementById('options-container');
    const wordInputArea = document.getElementById('word-input-area');
    const feedbackMessage = document.getElementById('feedback-message');
    const nextButton = document.getElementById('next-button');
    const levelCompleteTitle = document.getElementById('level-complete-title');
    const nextLevelButton = document.getElementById('next-level-button');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const latinInputBox = document.getElementById('latin-input-box');
    const cheatsheet = document.getElementById('cheatsheet');
    const cheatsheetToggle = document.getElementById('cheatsheet-toggle');
    const cheatsheetGrid = document.getElementById('cheatsheet-grid');
    const skipButton = document.getElementById('skip-button');
    const levelFailedScreen = document.getElementById('level-failed-screen');
    const retryLevelButton = document.getElementById('retry-level-button');

    const authScreen = document.getElementById('auth-screen');
    const highscoreScreen = document.getElementById('highscore-screen');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authError = document.getElementById('auth-error');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const logoutButton = document.getElementById('logout-button');
    const welcomeMessage = document.getElementById('welcome-message');
    const highscoreButton = document.getElementById('highscore-button');
    const highscoreList = document.getElementById('highscore-list');
    const backToMainMenu3 = document.getElementById('back-to-main-menu-3');

    // --- Event Listeners ---
    themeToggle.addEventListener('click', toggleTheme);

    campaignButton.addEventListener('click', startCampaign);
    endlessModeButton.addEventListener('click', showEndlessMenu);
    backToMainMenu1.addEventListener('click', showMainMenu);
    backToMainMenu2.addEventListener('click', showMainMenu);
    latinInputBox.addEventListener('input', checkWordAnswer);
    nextLevelButton.addEventListener('click', startNextLevel);
    cheatsheetToggle.addEventListener('click', toggleCheatsheet);
    skipButton.addEventListener('click', skipQuestion);
    retryLevelButton.addEventListener('click', retryLevel);
    highscoreButton.addEventListener('click', () => showHighscores('letters'));
    backToMainMenu3.addEventListener('click', showMainMenu);

    document.querySelectorAll('#highscore-mode-selector button').forEach(button => {
        button.addEventListener('click', () => {
            showHighscores(button.dataset.mode);
        });
    });

    endlessSelectButtons.forEach(button => {
        button.addEventListener('click', () => startEndlessMode(button.dataset.type));
    });

    nextButton.addEventListener('click', nextQuestion);
    nextLevelButton.addEventListener('click', startNextLevel);

    tabLogin.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.remove('text-gray-400');
        tabRegister.classList.add('text-gray-400');
    });

    tabRegister.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabLogin.classList.add('text-gray-400');
        tabRegister.classList.remove('text-gray-400');
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.textContent = '';
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { username: username } }
        });

        if (error) {
            authError.textContent = "Fehler: " + error.message;
        } else {
            /*checkUserSession();*/
            alert('Registrierung erfolgreich! Bitte prüfe deine E-Mails zur Bestätigung.');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.textContent = '';
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            authError.textContent = "Fehler: " + error.message;
        } else {
            checkUserSession();
        }
    });

    logoutButton.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        showScreen(authScreen);
    });

    async function showHighscores(mode = 'letters') {
        showScreen(highscoreScreen);
        highscoreList.innerHTML = '<p>Lade Highscores...</p>';

        // Markiere den aktiven Button
        document.querySelectorAll('#highscore-mode-selector button').forEach(btn => {
            btn.classList.remove('btn-primary');
            if (btn.dataset.mode === mode) {
                btn.classList.add('btn-primary');
            }
        });

        try {
            // Schritt 1: Hole die Top-Scores für den ausgewählten Modus
            const { data: scoresData, error: scoresError } = await supabaseClient
                .from('scores')
                .select('user_id, score')
                .eq('game_mode', mode) // Wichtig: Hier filtern wir den Modus
                .order('score', { ascending: false })
                .limit(5);

            if (scoresError) throw scoresError;

            if (scoresData.length === 0) {
                highscoreList.innerHTML = '<p>Noch keine Highscores für diesen Modus.</p>';
                return;
            }

            // Schritt 2: Sammle alle einzigartigen User-IDs
            const userIds = [...new Set(scoresData.map(entry => entry.user_id))];

            // Schritt 3: Hole die passenden User-Profile
            const { data: profilesData, error: profilesError } = await supabaseClient
                .from('profiles') // Wir nutzen die sichere "profiles"-Ansicht
                .select('id, raw_user_meta_data')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            // Erstelle eine "Landkarte" für schnellen Zugriff auf die Usernamen
            const userMap = new Map(profilesData.map(p => [p.id, p.raw_user_meta_data.username]));

            // Schritt 4: Kombiniere Scores mit den Usernamen und zeige sie an
            highscoreList.innerHTML = scoresData.map((entry, index) => `
            <div class="flex justify-between items-center p-2 rounded ${index % 2 === 0 ? 'bg-gray-700' : ''}">
                <span class="font-bold">${index + 1}. ${userMap.get(entry.user_id) || 'Unbekannt'}</span>
                <span>${entry.score}</span>
            </div>
        `).join('');

        } catch (error) {
            highscoreList.innerHTML = `<p class="text-red-500">Fehler: ${error.message}</p>`;
            console.error("Fehler beim Laden der Highscores:", error);
        }
    }

    async function saveScore(finalScore, gameType) {
        if (finalScore <= 0) return;

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        try {
            // Schritt 1: Hole die aktuellen Top 5 Scores für diesen Modus
            const { data: topScores, error: fetchError } = await supabaseClient
                .from('scores')
                .select('id, score')
                .eq('game_mode', gameType)
                .order('score', { descending: true })
                .limit(5);

            if (fetchError) throw fetchError;

            // Schritt 2: Prüfe, ob der neue Score gut genug ist
            const isTopFive = topScores.length < 5 || finalScore > topScores[topScores.length - 1].score;

            if (isTopFive) {
                console.log("Neuer Highscore! Speichere und räume auf...");

                // Schritt 3: Füge den neuen Score ein
                const { error: insertError } = await supabaseClient
                    .from('scores')
                    .insert({ user_id: user.id, score: finalScore, game_mode: gameType });

                if (insertError) throw insertError;

                // Schritt 4: Wenn die Liste jetzt zu lang ist, lösche den schlechtesten Score
                if (topScores.length >= 5) {
                    const scoreToDelete = topScores[topScores.length - 1];
                    const { error: deleteError } = await supabaseClient
                        .from('scores')
                        .delete()
                        .eq('id', scoreToDelete.id);

                    if (deleteError) throw deleteError;
                    console.log(`Schlechtester Score (ID: ${scoreToDelete.id}) wurde entfernt.`);
                }
                console.log("Score erfolgreich gespeichert!");

            } else {
                console.log("Score nicht hoch genug für die Top 5.");
            }

        } catch (error) {
            console.error("Ein Fehler ist im Highscore-Prozess aufgetreten:", error);
        }
    }

    function showScreen(screen) {
        // Alle Screens verstecken
        authScreen.classList.add('hidden');
        mainMenuScreen.classList.add('hidden');
        highscoreScreen.classList.add('hidden');
        endlessMenuScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        levelCompleteScreen.classList.add('hidden');
        levelFailedScreen.classList.add('hidden');

        // Den richtigen Screen anzeigen
        screen.classList.remove('hidden');

        // Menü-Button nur im Game-Screen anzeigen
        if (screen === gameScreen) {
            backToMainMenu2.classList.remove('hidden');
        } else {
            backToMainMenu2.classList.add('hidden');
        }
    }

    function showMainMenu() {
        cheatsheetToggle.classList.remove('hidden')
        cheatsheet.classList.remove('hidden')
        if (gameMode === 'endless' && score > 0) {
            // Übergebe den "endlessType" (letters, words, sentences)
            saveScore(score, endlessType);
            score = 0;
            updateScore();
        }
        showScreen(mainMenuScreen);
    }

    function showEndlessMenu() {
        showScreen(endlessMenuScreen);
    }

    function toggleTheme() {
        body.classList.toggle('light-mode');
        updateThemeIcons();
    }

    function updateThemeIcons() {
        if (body.classList.contains('light-mode')) {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    }

    function startCampaign() {
        gameMode = 'campaign';
        currentLevelIndex = 0;
        score = 0;
        showScreen(gameScreen);
        setupLevel();
        skipButton.classList.add('hidden');
    }

    function startEndlessMode(type) {
        cheatsheetToggle.classList.add('hidden')
        cheatsheet.classList.add('hidden')
        gameMode = 'endless';
        endlessType = type;
        score = 0;
        updateScore();
        showScreen(gameScreen);
        setupLevel();
        if(endlessType === 'letters') {
            skipButton.classList.add('hidden');
        }
    }

    function startNextLevel() {
        currentLevelIndex++;
        if (currentLevelIndex >= LEVELS.length) {
            showMainMenu();
            return;
        }
        showScreen(gameScreen);
        setupLevel();
    }

    function setupLevel() {
        currentQuestionIndex = 0;
        updateScore();

        if (gameMode === 'campaign') {
            const level = LEVELS[currentLevelIndex];
            levelTitle.textContent = level.title;
            questionsForCurrentLevel = shuffleArray([...level.questions]).slice(0, QUESTIONS_PER_LEVEL);
            progressBarContainer.classList.remove('hidden');
           if (level.type === 'letters') {
            optionsContainer.classList.remove('hidden');
            wordInputArea.classList.add('hidden');
        } else { // Words and Sentences
            optionsContainer.classList.add('hidden');
            wordInputArea.classList.remove('hidden');
        }
        } else { // Endless mode
            levelTitle.textContent = `Endlos: ${endlessType.charAt(0).toUpperCase() + endlessType.slice(1)}`;
            progressBarContainer.classList.add('hidden');
            if (endlessType === 'letters') {
                optionsContainer.classList.remove('hidden');
                wordInputArea.classList.add('hidden');
            } else {
                optionsContainer.classList.add('hidden');
                wordInputArea.classList.remove('hidden');
            }
        }
        loadQuestion();
    }

    function loadQuestion() {
        const level = LEVELS[currentLevelIndex];
        latinInputBox.value = '';
        latinInputBox.disabled = false;
        feedbackMessage.textContent = '';
        nextButton.classList.add('hidden');

        if (gameMode === 'endless' && (endlessType === 'words' || endlessType === 'sentences')
             || gameMode === 'campaign' && (level.type === 'words' || level.type === 'sentences')) {
            skipButton.classList.remove('hidden');
        } else {
            skipButton.classList.add('hidden');
        }

        updateProgressBar();
        questionDisplay.innerHTML = '';

        if (gameMode === 'campaign') {
            if (currentQuestionIndex >= questionsForCurrentLevel.length) {
                // Score-Überprüfung am Ende des Levels
                const level = LEVELS[currentLevelIndex];
                const requiredScore = (currentLevelIndex === 0) ? 60 : 120;

                if (score < requiredScore) {
                    showScreen(levelFailedScreen);
                    if (currentLevelIndex === 1) { // Bei Scheitern in Level 2
                        score = 60; // Setze Score auf 60 zurück
                        updateScore();
                    }else if (currentLevelIndex === 2) { // Bei Scheitern in Level 3
                        score = 120; // Setze Score auf 120 zurück
                        updateScore();
                    }else {
                        score = 0; // Setze Score auf 0 zurück
                    }
                    return;
                }

                // Level erfolgreich abgeschlossen
                showScreen(levelCompleteScreen);
                levelCompleteTitle.textContent = `${level.title} Abgeschlossen!`;
                if (currentLevelIndex >= LEVELS.length - 1) {
                    nextLevelButton.textContent = "Hauptmenü";
                } else {
                    nextLevelButton.textContent = "Nächstes Level";
                }
                return;
            }
            currentCorrectAnswer = questionsForCurrentLevel[currentQuestionIndex];
            const levelType = LEVELS[currentLevelIndex].type;
            setupQuestionUI(levelType, currentCorrectAnswer);

        } else { // Endless mode
            let sourceArray;
            if (endlessType === 'letters') sourceArray = LATIN_ALPHABET;
            else if (endlessType === 'words') sourceArray = WORDS;
            else sourceArray = SENTENCES;
            currentCorrectAnswer = sourceArray[Math.floor(Math.random() * sourceArray.length)];
            setupQuestionUI(endlessType, currentCorrectAnswer);
        }
    }

    function retryLevel() {
        showScreen(gameScreen);
        setupLevel();
    }

    function setupQuestionUI(type, answer) {
        if (type === 'letters') {
            const isReverseQuestion = Math.random() < 0.5;
            if (isReverseQuestion) {
                instruction.textContent = "Welches galaktische Zeichen ist das?";
                const questionTextEl = document.createElement('div');
                questionTextEl.textContent = answer;
                questionTextEl.className = 'text-8xl font-bold';
                questionDisplay.appendChild(questionTextEl);
                generateGalacticOptions(answer);
            } else {
                instruction.textContent = "Welcher Buchstabe ist das?";
                questionDisplay.appendChild(createPixelCharacter(answer, 12));
                generateLatinOptions(answer);
            }
        } else { // Words and Sentences
    instruction.textContent = type === 'words' ? "Welches Wort ist das?" : "Welcher Satz ist das?";
    questionDisplay.innerHTML = ''; // Leert die alte Anzeige

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';

    for (const char of answer) {
        if (char === ' ') {
            const space = document.createElement('div');
            space.style.width = '20px'; // Erzeugt einen Leerraum für Leerzeichen
            container.appendChild(space);
        } else {
            // Fügt das galaktische Zeichen in Pixel-Form hinzu
            container.appendChild(createPixelCharacter(char, 8));
        }
    }
    questionDisplay.appendChild(container);
    latinInputBox.focus(); // Setzt den Fokus auf das Eingabefeld
}
    }

    function generateLatinOptions(correctLetter) {
        optionsContainer.innerHTML = '';
        let options = [correctLetter];
        while (options.length < 4) {
            const randomLetter = LATIN_ALPHABET[Math.floor(Math.random() * LATIN_ALPHABET.length)];
            if (!options.includes(randomLetter)) options.push(randomLetter);
        }
        options = shuffleArray(options);
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('btn-option', 'font-bold', 'py-4', 'px-5', 'rounded-lg', 'text-2xl');
            button.addEventListener('click', () => checkLetterAnswer(option, button));
            optionsContainer.appendChild(button);
        });
    }

    function generateGalacticOptions(correctLetter) {
        optionsContainer.innerHTML = '';
        let options = [correctLetter];
        while (options.length < 4) {
            const randomLetter = LATIN_ALPHABET[Math.floor(Math.random() * LATIN_ALPHABET.length)];
            if (!options.includes(randomLetter)) options.push(randomLetter);
        }
        options = shuffleArray(options);
        options.forEach(option => {
            const button = document.createElement('button');
            button.dataset.letter = option;
            button.classList.add('btn-option', 'p-4', 'rounded-lg');
            button.appendChild(createPixelCharacter(option, 6));
            button.addEventListener('click', () => checkLetterAnswer(option, button));
            optionsContainer.appendChild(button);
        });
    }

    function checkLetterAnswer(selectedOption, button) {
        const buttons = optionsContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);

        if (selectedOption === currentCorrectAnswer) {
            feedbackMessage.textContent = 'Korrekt!';
            feedbackMessage.style.color = '#22c55e';
            button.classList.add('correct');
            if( gameMode === 'campaign') {
                score += 10;
            } else {
                score += berechneDynamischePunkte(score);
            }
            updateScore();
        } else {
            feedbackMessage.textContent = `Falsch! Richtig wäre: ${currentCorrectAnswer}`;
            feedbackMessage.style.color = '#ef4444';
            button.classList.add('incorrect');
            buttons.forEach(btn => {
                if (btn.textContent === currentCorrectAnswer || btn.dataset.letter === currentCorrectAnswer) {
                    btn.classList.add('correct');
                }
            });
            if(gameMode === 'campaign') {
                score = score/2; // Punktzahl halbieren
                updateScore();
            }
        }
        nextButton.classList.remove('hidden');
    }

    function berechneDynamischePunkte(aktuellerPunktestand) {
    const startpunkte = 20;
    const mindestpunkte = 1;

    // Ein HÖHERER Wert lässt die Punkte VIEL SCHNELLER fallen.
    const abfallrate = 0.0035;

    const punkte = mindestpunkte + 
                    (startpunkte - mindestpunkte) * Math.exp(-abfallrate * aktuellerPunktestand);
    
    return Math.max(mindestpunkte, Math.round(punkte));
    }

function checkWordAnswer() {
    const currentUserInput = latinInputBox.value.toUpperCase();

    if (currentUserInput === currentCorrectAnswer) {
        feedbackMessage.textContent = 'Perfekt!';
        feedbackMessage.style.color = '#22c55e';
        score += 20;
        updateScore();
        nextButton.classList.remove('hidden');
        latinInputBox.disabled = true;
        skipButton.classList.add('hidden');
    }
}

    function nextQuestion() {
        if (gameMode === 'campaign') {
            currentQuestionIndex++;
        }
        loadQuestion();
    }

    function createPixelCharacter(latinChar, pixelSize = 4) {
        const matrix = GALACTIC_PIXEL_DATA[latinChar];
        if (!matrix) return document.createElement('span');

        const container = document.createElement('div');
        let maxWidth = 0;
        matrix.forEach(row => {
            if(row.length > maxWidth) maxWidth = row.length;
        });

        container.style.display = 'inline-grid';
        container.style.gridTemplateColumns = `repeat(${maxWidth}, 1fr)`;
        container.style.gap = `0px`;
        container.style.alignSelf = 'center';

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < maxWidth; c++) {
                const pixel = document.createElement('div');
                pixel.style.width = `${pixelSize}px`;
                pixel.style.height = `${pixelSize * 1.25}px`;
                if (matrix[r] && matrix[r][c] === 1) {
                    pixel.classList.add('pixel-on');
                }
                container.appendChild(pixel);
            }
        }
        return container;
    }

    function updateScore() {
        scoreDisplay.textContent = score;
    }

    function updateProgressBar() {
        if(gameMode === 'campaign') {
            const progress = (currentQuestionIndex / QUESTIONS_PER_LEVEL) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function populateCheatsheet() {
        cheatsheetGrid.innerHTML = ''; // Leert das Gitter, um Duplikate zu vermeiden

        for (const char in GALACTIC_PIXEL_DATA) {
            const item = document.createElement('div');
            item.className = 'cheatsheet-item';

            const galacticChar = createPixelCharacter(char, 3);
            const latinChar = document.createElement('div');
            latinChar.className = 'cheatsheet-char';
            latinChar.textContent = char;
            
            item.appendChild(galacticChar);
            item.appendChild(latinChar);
            cheatsheetGrid.appendChild(item);
        }
    }

    function toggleCheatsheet() {
        if (cheatsheet.classList.contains('hidden')) {
            cheatsheet.classList.remove('hidden');
            // Kleine Verzögerung, um den CSS-Übergang zu ermöglichen
            setTimeout(() => {
                cheatsheet.style.opacity = '1';
                cheatsheet.style.transform = 'translateY(0)';
            }, 10);
        } else {
            cheatsheet.style.opacity = '0';
            cheatsheet.style.transform = 'translateY(20px)';
            // Verstecken nach dem Übergang
            setTimeout(() => {
                cheatsheet.classList.add('hidden');
            }, 300);
        }
    }

    function skipQuestion() {
        if  (gameMode === 'campaign') {
            score -= 10; // Punktzahl um 10 reduzieren
            updateScore();
            currentQuestionIndex++;
            loadQuestion();
        } else { // Endless mode
                score = Math.floor(score / 2); // Punktzahl halbieren und abrunden
                updateScore();
                loadQuestion(); 
        }
    }

    async function checkUserSession() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            const username = session.user.user_metadata.username || session.user.email;
            welcomeMessage.textContent = `Willkommen, ${username}!`;
            showScreen(mainMenuScreen);
        } else {
            showScreen(authScreen);
        }
    }

    // Initial setup
    updateThemeIcons();
    populateCheatsheet();
    checkUserSession();
    showMainMenu();
});