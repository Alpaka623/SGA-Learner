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

    // --- Event Listeners ---
    themeToggle.addEventListener('click', toggleTheme);

    campaignButton.addEventListener('click', startCampaign);
    endlessModeButton.addEventListener('click', showEndlessMenu);
    backToMainMenu1.addEventListener('click', showMainMenu);
    backToMainMenu2.addEventListener('click', showMainMenu);
    latinInputBox.addEventListener('input', checkWordAnswer);

    endlessSelectButtons.forEach(button => {
        button.addEventListener('click', () => startEndlessMode(button.dataset.type));
    });

    nextButton.addEventListener('click', nextQuestion);
    nextLevelButton.addEventListener('click', startNextLevel);

    function showScreen(screen) {
        mainMenuScreen.classList.add('hidden');
        endlessMenuScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        levelCompleteScreen.classList.add('hidden');

        if (screen === gameScreen) {
            backToMainMenu2.classList.remove('hidden');
        } else {
            backToMainMenu2.classList.add('hidden');
        }

        screen.classList.remove('hidden');
    }

    function showMainMenu() {
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
    }

    function startEndlessMode(type) {
        gameMode = 'endless';
        endlessType = type;
        score = 0;
        updateScore();
        showScreen(gameScreen);
        setupLevel();
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
        latinInputBox.value = '';
        latinInputBox.disabled = false;
        feedbackMessage.textContent = '';
        nextButton.classList.add('hidden');
        updateProgressBar();
        questionDisplay.innerHTML = '';

        if (gameMode === 'campaign') {
            if (currentQuestionIndex >= questionsForCurrentLevel.length) {
                showScreen(levelCompleteScreen);
                const level = LEVELS[currentLevelIndex];
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

    function setupQuestionUI(type, answer) {
        if (type === 'letters') {
            const isReverseQuestion = Math.random() < 0.4;
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
            score += 10;
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
        }
        nextButton.classList.remove('hidden');
    }

function checkWordAnswer() {
    const currentUserInput = latinInputBox.value.toUpperCase();

    if (currentUserInput === currentCorrectAnswer) {
        feedbackMessage.textContent = 'Perfekt!';
        feedbackMessage.style.color = '#22c55e';
        score += 20;
        updateScore();
        nextButton.classList.remove('hidden');
        latinInputBox.disabled = true; // Deaktiviert das Feld nach korrekter Antwort
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

    // Initial setup
    updateThemeIcons();
    showMainMenu();
});