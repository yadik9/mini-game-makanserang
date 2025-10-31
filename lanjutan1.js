// Simple browser game: two players can eat to gain energy and attack the other to reduce energy.

const createPlayer = (name, energy) => {
    return {
        name,
        energy,
        eat(amount) {
            this.energy = Math.min(this.energy + amount, 100);
            return { type: 'eat', amount, player: this.name };
        },
        attack(target, amount) {
            target.energy = Math.max(target.energy - amount, 0);
            return { type: 'attack', amount, from: this.name, to: target.name };
        }
    };
};

// DOM helpers
const $ = (sel) => document.querySelector(sel);
const logEl = $('#game-log');

const addLog = (text) => {
    const li = document.createElement('li');
    li.textContent = text;
    li.style.opacity = '0';
    logEl.insertBefore(li, logEl.firstChild);
    // simple fade-in
    requestAnimationFrame(() => { li.style.transition = 'opacity 240ms ease'; li.style.opacity = '1'; });
};

// Setup players
const player1 = createPlayer('Yad', 50);
const player2 = createPlayer('Diks', 50);

// Inventory factory and sample items
const createItem = (id, name, type, effect, uses=1) => ({ id, name, type, effect, uses });

// sample items: makanan (restore), senjata (damage)
const apple = createItem('apple', 'Buah +20', 'food', { heal: 20 }, 3);
const burger = createItem('burger', 'Burger +35', 'food', { heal: 35 }, 1);
const laser = createItem('laser', 'Laser Gun -25', 'weapon', { damage: 25 }, 2);
const dagger = createItem('dagger', 'Dagger -12', 'weapon', { damage: 12 }, 4);

// Assign inventories (copy items - each player has their own uses)
player1.inventory = [ {...apple}, {...laser} ];
player2.inventory = [ {...burger}, {...dagger} ];

// helper to populate selects
const populateInventory = (selectEl, inventory) => {
    selectEl.innerHTML = '';
    inventory.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.name} (x${item.uses})`;
        selectEl.appendChild(opt);
    });
};

// populate initial selects
populateInventory($('#p1-items'), player1.inventory);
populateInventory($('#p2-items'), player2.inventory);

// use item implementation
const useItem = (player, target, selectEl) => {
    const id = selectEl.value;
    const item = player.inventory.find(i => i.id === id);
    if (!item) return;

    if (item.type === 'food') {
        player.energy = Math.min(100, player.energy + (item.effect.heal || 0));
        addLog(`${player.name} memakai ${item.name} (+${item.effect.heal})`);
    } else if (item.type === 'weapon') {
        target.energy = Math.max(0, target.energy - (item.effect.damage || 0));
        addLog(`${player.name} menyerang ${target.name} dengan ${item.name} (-${item.effect.damage})`);
    }

    // decrement uses and remove if none left
    item.uses -= 1;
    if (item.uses <= 0) {
        player.inventory = player.inventory.filter(i => i.id !== item.id);
    }

    // refresh UI
    populateInventory(selectEl, player.inventory);
    render();
};

// Initialize DOM
const p1NameEl = $('#p1-name');
const p2NameEl = $('#p2-name');
const p1EnergyEl = $('#p1-energy');
const p2EnergyEl = $('#p2-energy');
const p1EnergyFill = $('#p1-energy-fill');
const p2EnergyFill = $('#p2-energy-fill');
const restartBtn = $('#restart');
const resultBanner = $('#result-banner');
const resultText = $('#result-text');
const winnerModal = $('#winner-modal');
const modalTitle = $('#modal-title');
const modalBody = $('#modal-body');
const modalRestart = $('#modal-restart');
const modalClose = $('#modal-close');

// Only action buttons are disabled on game over; keep Restart and modal controls active
const allButtons = () => Array.from(document.querySelectorAll('.btn:not(#modal-restart)'));

const setControlsDisabled = (disabled) => {
    allButtons().forEach(b => b.disabled = disabled);
    allButtons().forEach(b => b.style.opacity = disabled ? '0.6' : '1');
};

p1NameEl.textContent = player1.name;
p2NameEl.textContent = player2.name;

const render = () => {
    p1EnergyEl.textContent = player1.energy;
    p2EnergyEl.textContent = player2.energy;
    p1EnergyFill.style.width = `${player1.energy}%`;
    p2EnergyFill.style.width = `${player2.energy}%`;
};

// Buttons
$('#p1-eat').addEventListener('click', () => {
    const res = player1.eat(10);
    render();
    addLog(`${res.player} makan (+${res.amount}) — Energi: ${player1.energy}`);
});

$('#p2-eat').addEventListener('click', () => {
    const res = player2.eat(10);
    render();
    addLog(`${res.player} makan (+${res.amount}) — Energi: ${player2.energy}`);
});

// Use item buttons
$('#p1-use-item').addEventListener('click', () => useItem(player1, player2, $('#p1-items')));
$('#p2-use-item').addEventListener('click', () => useItem(player2, player1, $('#p2-items')));

$('#p1-attack').addEventListener('click', () => {
    const res = player1.attack(player2, 5);
    render();
    addLog(`${res.from} menyerang ${res.to} (-${res.amount}) — ${res.to} Energi: ${player2.energy}`);
    if (player2.energy === 0) {
        addLog(`${player2.name} sudah kalah!`);
        setControlsDisabled(true);
        // show result
        resultText.textContent = `${player1.name} MENANG — ${player2.name} KALAH`;
        resultBanner.style.display = 'block';
        // highlight
        document.getElementById('player1').classList.add('winner');
        document.getElementById('player2').classList.add('loser');
        // show modal
        modalTitle.textContent = `${player1.name} MENANG`;
        modalBody.textContent = `${player1.name} berhasil mengalahkan ${player2.name}. Selamat!`;
        winnerModal.style.display = 'flex';
    }
});

$('#p2-attack').addEventListener('click', () => {
    const res = player2.attack(player1, 5);
    render();
    addLog(`${res.from} menyerang ${res.to} (-${res.amount}) — ${res.to} Energi: ${player1.energy}`);
    if (player1.energy === 0) {
        addLog(`${player1.name} sudah kalah!`);
        setControlsDisabled(true);
        // show result
        resultText.textContent = `${player2.name} MENANG — ${player1.name} KALAH`;
        resultBanner.style.display = 'block';
        // highlight
        document.getElementById('player2').classList.add('winner');
        document.getElementById('player1').classList.add('loser');
        // show modal
        modalTitle.textContent = `${player2.name} MENANG`;
        modalBody.textContent = `${player2.name} berhasil mengalahkan ${player1.name}. Selamat!`;
        winnerModal.style.display = 'flex';
    }
});

restartBtn.addEventListener('click', () => {
    // reset energies and re-enable controls
    player1.energy = 50;
    player2.energy = 50;
    render();
    addLog('Game di-reset. Siap bertanding lagi!');
    setControlsDisabled(false);
    // clear result banner and highlights
    resultBanner.style.display = 'none';
    resultText.textContent = '';
    document.getElementById('player1').classList.remove('winner','loser');
    document.getElementById('player2').classList.remove('winner','loser');
});

// modal buttons
modalRestart.addEventListener('click', () => {
    // trigger same behavior as restart
    restartBtn.click();
    winnerModal.style.display = 'none';
});
modalClose.addEventListener('click', () => {
    winnerModal.style.display = 'none';
});

// Initial render and welcome log
render();
addLog('Permainan siap — klik Makan atau Serang untuk bermain.');
