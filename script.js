document.addEventListener('DOMContentLoaded', () => {
    const bingoEntriesInput = document.getElementById('bingo-entries');
    const generateButton = document.getElementById('generate-button');
    const bingoCardDiv = document.getElementById('bingo-card');
    const resetButton = document.getElementById('reset-button');
    const randomizeButton = document.getElementById('randomize-button');
    const randomizeConfirmModal = document.getElementById('randomize-confirm');
    const confirmRandomizeButton = document.getElementById('confirm-randomize');
    const cancelRandomizeButton = document.getElementById('cancel-randomize');

    const BINGO_ENTRIES_KEY = 'bingoEntries'; // Key for the full set of entries
    const BINGO_CARD_KEY = 'bingoCardData'; // Key for the current card's entries
    const BINGO_TOGGLED_KEY = 'bingoToggled';

    // Load existing bingo card if available
    loadBingoCard();

    generateButton.addEventListener('click', () => {
        const entriesText = bingoEntriesInput.value;
        const allEntries = entriesText.split('\n').map(entry => entry.trim().replace(/[^a-zA-Z0-9\s]/gi, '')).filter(entry => entry);

        if (allEntries.length < 25) {
            alert('Please enter at least 25 unique bingo entries.');
            return;
        }

        saveAllBingoEntries(allEntries); // Save the full set of entries
        generateRandomCard(allEntries);
    });

    resetButton.addEventListener('click', () => {
        localStorage.removeItem(BINGO_ENTRIES_KEY);
        localStorage.removeItem(BINGO_CARD_KEY);
        localStorage.removeItem(BINGO_TOGGLED_KEY);
        bingoCardDiv.innerHTML = '';
        bingoCardDiv.classList.add('hidden');
        document.getElementById('input-area').classList.remove('hidden');
        bingoEntriesInput.value = '';
    });

    randomizeButton.addEventListener('click', () => {
        const storedAllEntries = localStorage.getItem(BINGO_ENTRIES_KEY);
        if (storedAllEntries) {
            randomizeConfirmModal.classList.remove('hidden');
        } else {
            alert('Please generate a bingo card first by providing the entries.');
        }
    });

    confirmRandomizeButton.addEventListener('click', () => {
        randomizeConfirmModal.classList.add('hidden');
        const storedAllEntries = localStorage.getItem(BINGO_ENTRIES_KEY);
        if (storedAllEntries) {
            const allEntries = JSON.parse(storedAllEntries);
            generateRandomCard(allEntries);
        }
    });

    cancelRandomizeButton.addEventListener('click', () => {
        randomizeConfirmModal.classList.add('hidden');
    });

    function generateRandomCard(allEntries) {
        if (allEntries.length < 25) {
            alert('Not enough entries to generate a bingo card.');
            return;
        }

        const shuffled = [...allEntries].sort(() => 0.5 - Math.random());
        const cardEntries = shuffled.slice(0, 25);
        generateCard(cardEntries);
        saveCurrentCardData(cardEntries);
    }

    function generateCard(entries) {
        bingoCardDiv.innerHTML = '';
        bingoCardDiv.classList.remove('hidden');
        document.getElementById('input-area').classList.add('hidden');

        const toggledState = JSON.parse(localStorage.getItem(BINGO_TOGGLED_KEY)) || {};

        entries.forEach((entry, index) => {
            const cell = document.createElement('div');
            cell.classList.add('bingo-cell');
            cell.textContent = entry;
            cell.dataset.index = index;
            if (toggledState[index]) {
                cell.classList.add('toggled');
            }
            cell.addEventListener('click', toggleCell);
            bingoCardDiv.appendChild(cell);
        });
    }

    function toggleCell(event) {
        const cell = event.target;
        cell.classList.toggle('toggled');
        saveToggledState();
    }

    function saveAllBingoEntries(entries) {
        localStorage.setItem(BINGO_ENTRIES_KEY, JSON.stringify(entries));
    }

    function saveCurrentCardData(entries) {
        localStorage.setItem(BINGO_CARD_KEY, JSON.stringify(entries));
        saveToggledState(); // Save initial toggled state
    }

    function saveToggledState() {
        const toggled = {};
        document.querySelectorAll('.bingo-cell').forEach(cell => {
            toggled[cell.dataset.index] = cell.classList.contains('toggled');
        });
        localStorage.setItem(BINGO_TOGGLED_KEY, JSON.stringify(toggled));
    }

    function loadBingoCard() {
        const storedCardData = localStorage.getItem(BINGO_CARD_KEY);
        const storedAllEntries = localStorage.getItem(BINGO_ENTRIES_KEY);

        if (storedCardData) {
            const cardData = JSON.parse(storedCardData);
            if (storedAllEntries) {
                bingoEntriesInput.value = JSON.parse(storedAllEntries).join('\n'); // Populate the input for reference
            }
            generateCard(cardData);
        } else if (storedAllEntries) {
            bingoEntriesInput.value = JSON.parse(storedAllEntries).join('\n');
            document.getElementById('input-area').classList.remove('hidden');
        } else {
            document.getElementById('input-area').classList.remove('hidden');
        }
    }
});