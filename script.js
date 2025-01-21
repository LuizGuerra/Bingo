function processEntries(entries) {
    return entries.map(entry => {
        let processed = entry.trim();
        processed = processed.replace(/[^\w\s]/gi, '');
        return processed;
    }).filter(entry => entry.length > 0);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateCard(entries) {
    const processed = processEntries(entries);
    const shuffled = shuffleArray([...processed]);
    const selected = shuffled.slice(0, 24);
    
    const cells = [];
    cells.push(...selected.slice(0, 12));
    cells.push('Bingo');
    cells.push(...selected.slice(12));
    return cells;
}

function renderCard(cells, markedStates) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    cells.forEach((text, index) => {
        const cell = document.createElement('div');
        cell.className = `cell${index === 12 ? ' marked' : ''}`;
        cell.textContent = text;
        
        if (index !== 12) {
            cell.classList.toggle('marked', markedStates[index]);
            cell.addEventListener('click', () => {
                cell.classList.toggle('marked');
                saveCardState();
            });
        }
        
        grid.appendChild(cell);
    });
}

function saveCardState() {
    const cells = Array.from(document.querySelectorAll('.cell')).map(cell => cell.textContent);
    const marked = Array.from(document.querySelectorAll('.cell')).map(cell => cell.classList.contains('marked'));
    marked[12] = true; // Force center cell to be marked
    
    localStorage.setItem('bingoCard', JSON.stringify({
        cells,
        marked
    }));
}

function loadCardFromStorage() {
    const savedData = localStorage.getItem('bingoCard');
    const savedEntries = localStorage.getItem('bingoEntries');
    
    if (savedData && savedEntries) {
        const { cells, marked } = JSON.parse(savedData);
        document.getElementById('inputSection').style.display = 'none';
        document.getElementById('bingoCard').style.display = 'block';
        document.getElementById('buttons').style.display = 'flex';
        renderCard(cells, marked);
    }
}

function handleCreate() {
    const entries = document.getElementById('entriesInput').value.split('\n');
    const cells = generateCard(entries);
    
    localStorage.setItem('bingoEntries', JSON.stringify(entries));
    localStorage.setItem('bingoCard', JSON.stringify({
        cells,
        marked: Array(25).fill(false).map((_, i) => i === 12)
    }));
    
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('bingoCard').style.display = 'block';
    document.getElementById('buttons').style.display = 'flex';
    loadCardFromStorage();
}

function handleRandomize() {
    if (!confirm('Are you sure you want to generate a new random card? All current marks will be lost.')) return;
    
    const savedEntries = JSON.parse(localStorage.getItem('bingoEntries'));
    const cells = generateCard(savedEntries);
    
    localStorage.setItem('bingoCard', JSON.stringify({
        cells,
        marked: Array(25).fill(false).map((_, i) => i === 12)
    }));
    
    loadCardFromStorage();
}

function handleReset() {
    if (!confirm('Are you sure you want to reset all data? This cannot be undone.')) return;
    
    localStorage.clear();
    document.getElementById('entriesInput').value = '';
    document.getElementById('inputSection').style.display = 'flex';
    document.getElementById('bingoCard').style.display = 'none';
    document.getElementById('buttons').style.display = 'none';
}

// Initial load
window.addEventListener('load', () => {
    loadCardFromStorage();
});