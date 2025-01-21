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

function checkBingo() {
    const cells = document.querySelectorAll('.cell');
    const indices = Array.from(cells).map((cell, index) => 
        cell.classList.contains('marked') ? index : -1
    ).filter(index => index !== -1);

    // Check rows
    for(let i = 0; i < 5; i++) {
        if([0,1,2,3,4].map(n => n + i*5).every(n => indices.includes(n))) return true;
    }

    // Check columns
    for(let i = 0; i < 5; i++) {
        if([0,5,10,15,20].map(n => n + i).every(n => indices.includes(n))) return true;
    }

    // Check diagonals
    if([0,6,12,18,24].every(n => indices.includes(n))) return true;
    if([4,8,12,16,20].every(n => indices.includes(n))) return true;

    return false;
}

// Add this confetti animation function
function triggerBingoAnimation() {
    // Flash animation
    document.querySelectorAll('.cell').forEach(cell => {
        if(cell.classList.contains('marked')) cell.classList.add('bingo-animation');
    });
    
    // Confetti effect
    const count = 200;
    const defaults = {
        origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

// Modify the saveCardState function to check for bingo
function saveCardState() {
    const cells = Array.from(document.querySelectorAll('.cell')).map(cell => cell.textContent);
    const marked = Array.from(document.querySelectorAll('.cell')).map(cell => cell.classList.contains('marked'));
    marked[12] = true; // Force center cell to be marked
    
    localStorage.setItem('bingoCard', JSON.stringify({
        cells,
        marked
    }));

    // Check for bingo after saving state
    if(checkBingo()) {
        triggerBingoAnimation();
    }
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