// Utilities
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Weekday goals mapping: 0=Sun .. 6=Sat
// Now using custom daily goals instead of fixed values
const WEEKDAY_GOALS = {
  0: 0,   // Domingo: livre
  1: 0,   // Segunda: personalizado
  2: 0,   // Terça: personalizado
  3: 0,   // Quarta: personalizado
  4: 0,   // Quinta: personalizado
  5: 0,   // Sexta: personalizado
  6: 0    // Sábado: personalizado
};

const STORAGE_KEY = 'cabal_farm_checklist_v3';
const STORAGE_KEY_LIBRARY = 'cabal_farm_library_v1';
const STORAGE_KEY_ALZ_LIBRARY = 'cabal_farm_alz_library_v1';
const STORAGE_KEY_DAILY_GOALS = 'cabal_daily_goals_v1';

function getTodayKey() {
  const now = new Date();
  // YYYY-MM-DD local date
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}


// Library functions
function readLibraryStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIBRARY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler storage da biblioteca', e);
    return [];
  }
}

function writeLibraryStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar biblioteca', e);
  }
}

function addToLibrary(title, time) {
  const library = readLibraryStorage();
  const newDungeon = {
    id: Date.now(),
    title: title.trim(),
    time: parseInt(time) || 0,
    createdAt: Date.now()
  };
  
  // Check if dungeon already exists
  const exists = library.some(d => d.title.toLowerCase() === newDungeon.title.toLowerCase());
  if (exists) {
    alert('Esta dungeon já existe na biblioteca!');
    return false;
  }
  
  library.push(newDungeon);
  writeLibraryStorage(library);
  return true;
}

function removeFromLibrary(id) {
  const library = readLibraryStorage();
  const filtered = library.filter(d => d.id !== id);
  writeLibraryStorage(filtered);
}

function getLibrary() {
  return readLibraryStorage();
}

// Alz Library functions
function readAlzLibraryStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALZ_LIBRARY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler storage da biblioteca de Alzes', e);
    return [];
  }
}

function writeAlzLibraryStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY_ALZ_LIBRARY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar biblioteca de Alzes', e);
  }
}

function addToAlzLibrary(name, value) {
  const library = readAlzLibraryStorage();
  const newAlz = {
    id: Date.now(),
    name: name.trim(),
    value: parseInt(value) || 0,
    createdAt: Date.now()
  };
  
  // Check if alz already exists
  const exists = library.some(a => a.name.toLowerCase() === newAlz.name.toLowerCase());
  if (exists) {
    alert('Este farm já existe na biblioteca de Alzes!');
    return false;
  }
  
  library.push(newAlz);
  writeAlzLibraryStorage(library);
  return true;
}

function removeFromAlzLibrary(id) {
  const library = readAlzLibraryStorage();
  const filtered = library.filter(a => a.id !== id);
  writeAlzLibraryStorage(filtered);
}

function getAlzLibrary() {
  return readAlzLibraryStorage();
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Erro ao ler storage', e);
    return {};
  }
}

function writeStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar storage', e);
  }
}

function getStateForToday() {
  const all = readStorage();
  const todayKey = getTodayKey();
  if (!all[todayKey]) {
    all[todayKey] = { items: [] };
    writeStorage(all);
  }
  return { all, todayKey, state: all[todayKey] };
}

function saveState(todayKey, state, all) {
  const snapshot = all || readStorage();
  snapshot[todayKey] = state;
  writeStorage(snapshot);
}

// Daily goals management
function readDailyGoalsStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY_GOALS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Erro ao ler storage das metas diárias', e);
    return {};
  }
}

function writeDailyGoalsStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY_DAILY_GOALS, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar metas diárias', e);
  }
}

function getGoalForDay(dayIndex) {
  const dailyGoals = readDailyGoalsStorage();
  const todayKey = getTodayKey();
  return dailyGoals[todayKey] || 0;
}

function setGoalForToday(goal) {
  const dailyGoals = readDailyGoalsStorage();
  const todayKey = getTodayKey();
  dailyGoals[todayKey] = Math.max(0, parseInt(goal) || 0);
  writeDailyGoalsStorage(dailyGoals);
}

function getWeekdayLabel(dayIndex) {
  return ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][dayIndex];
}

function renderLibrary() {
  const library = getLibrary();
  const libraryList = $('#libraryList');
  libraryList.innerHTML = '';
  
  if (library.length === 0) {
    libraryList.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">Nenhuma dungeon na biblioteca</p>';
    return;
  }
  
  library.forEach(dungeon => {
    const item = document.createElement('div');
    item.className = 'library-item';
    
    item.innerHTML = `
      <div class="library-item-info">
        <span class="library-item-name">${dungeon.title}</span>
        <span class="library-item-time">${dungeon.time} min</span>
      </div>
      <div class="library-item-actions">
        <button class="btn btn-add" onclick="addDungeonToDay(${dungeon.id}, mainFunction.state, mainFunction.all, mainFunction.todayKey)">+ Adicionar ao Dia</button>
        <button class="btn btn-remove" onclick="removeDungeonFromLibrary(${dungeon.id}, mainFunction.state, mainFunction.all, mainFunction.todayKey)">✖</button>
      </div>
    `;
    
    libraryList.appendChild(item);
  });
}

function renderAvailableDungeons() {
  const library = getLibrary();
  const { state } = getStateForToday();
  const todayItems = state.items || [];
  const availableDungeons = $('#availableDungeons');
  availableDungeons.innerHTML = '';
  
  // Filter dungeons that are not already in today's list
  const available = library.filter(libDungeon => 
    !todayItems.some(todayItem => todayItem.title === libDungeon.title)
  );
  
  if (available.length === 0) {
    availableDungeons.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">Todas as dungeons já estão no dia de hoje</p>';
    return;
  }
  
  available.forEach(dungeon => {
    const item = document.createElement('div');
    item.className = 'available-dungeon';
    
    item.innerHTML = `
      <div class="available-dungeon-info">
        <span class="available-dungeon-name">${dungeon.title}</span>
        <span class="available-dungeon-time">${dungeon.time} min</span>
      </div>
      <button class="btn btn-add" onclick="addDungeonToDay(${dungeon.id}, mainFunction.state, mainFunction.all, mainFunction.todayKey)">+ Adicionar</button>
    `;
    
    availableDungeons.appendChild(item);
  });
}

function renderAlzLibrary() {
  const library = getAlzLibrary();
  const alzLibraryList = $('#alzLibraryList');
  
  if (!alzLibraryList) {
    console.error('alzLibraryList element not found!');
    return;
  }
  
  alzLibraryList.innerHTML = '';
  
  if (library.length === 0) {
    alzLibraryList.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">Nenhum farm na biblioteca de Alzes</p>';
    updateAlzSummary(0, 0);
    return;
  }
  
  // Calculate total alzes
  const totalAlzes = library.reduce((sum, alz) => sum + alz.value, 0);
  
  library.forEach((alz) => {
    const item = document.createElement('div');
    item.className = 'library-item';
    
    item.innerHTML = `
      <div class="library-item-info">
        <span class="library-item-name">${alz.name}</span>
        <span class="library-item-alz">${formatAlzes(alz.value)}</span>
      </div>
      <div class="library-item-actions">
        <button class="btn btn-remove" onclick="removeAlzFromLibrary(${alz.id})">✖</button>
      </div>
    `;
    
    alzLibraryList.appendChild(item);
  });
  
  // Update summary
  updateAlzSummary(totalAlzes, library.length);
}

function updateAlzSummary(totalAlzes, farmsCount) {
  const alzTotalValue = $('#alzTotalValue');
  const alzFarmsCount = $('#alzFarmsCount');
  
  if (alzTotalValue) {
    alzTotalValue.innerHTML = formatAlzes(totalAlzes);
  }
  
  if (alzFarmsCount) {
    alzFarmsCount.textContent = farmsCount;
  }
}

function renderWeekdayChips(currentDay) {
  $$('.weekday').forEach(el => {
    const d = Number(el.getAttribute('data-day'));
    el.classList.toggle('active', d === currentDay);
  });
}

function renderHeader() {
  const now = new Date();
  const day = now.getDay();
  const goal = getGoalForDay(day);
  $('#currentDay').textContent = getWeekdayLabel(day);
  $('#dailyGoal').textContent = goal > 0 ? `Meta: ${goal} DGs` : 'Meta: Livre';
  $('#customGoalInput').value = goal;
  renderWeekdayChips(day);
}

function createItemElement(item, index, goal, onToggleDone, onInc, onDec, onDelete) {
  console.log('Creating item element for:', item.title);
  
  const li = document.createElement('li');
  const isDone = item.count >= goal && goal > 0;
  li.className = `item${isDone ? ' done' : ''}`;

  const check = document.createElement('button');
  check.className = 'check';
  check.setAttribute('aria-label', 'Marcar como concluída');
  check.dataset.checked = String(isDone);
  check.innerHTML = '<div class="mark"></div>';
  check.addEventListener('click', () => onToggleDone(index));

  const content = document.createElement('div');
  content.className = 'item-content';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = item.title;

  const timeInfo = document.createElement('div');
  timeInfo.className = 'time-info';
  const executions = goal > 0 ? Math.min(item.count, goal) : item.count;
  const totalItemTime = (item.time || 0) * executions;
  timeInfo.textContent = `${item.time || 0} min × ${executions} = ${totalItemTime} min`;

  content.appendChild(title);
  content.appendChild(timeInfo);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const counter = document.createElement('span');
  counter.className = 'counter';
  if (goal > 0) {
    counter.textContent = `${Math.min(item.count, goal)}/${goal}`;
  } else {
    counter.textContent = `${item.count}/∞`;
  }

  const dec = document.createElement('button');
  dec.className = 'icon-btn danger';
  dec.setAttribute('aria-label', 'Diminuir');
  dec.innerHTML = `<span class="icon">−</span>`;
  dec.addEventListener('click', () => onDec(index));

  const inc = document.createElement('button');
  inc.className = 'icon-btn success';
  inc.setAttribute('aria-label', 'Aumentar');
  inc.innerHTML = `<span class="icon">+</span>`;
  inc.addEventListener('click', () => onInc(index));

  const del = document.createElement('button');
  del.className = 'icon-btn';
  del.setAttribute('aria-label', 'Excluir dungeon');
  del.innerHTML = `<span class="icon danger">✖</span>`;
  del.addEventListener('click', () => onDelete(index));

  actions.appendChild(dec);
  actions.appendChild(counter);
  actions.appendChild(inc);
  actions.appendChild(del);

  // Create time total display
  const timeTotal = document.createElement('div');
  timeTotal.className = 'time-total';
  const executions2 = goal > 0 ? Math.min(item.count, goal) : item.count;
  const totalItemTime2 = (item.time || 0) * executions2;
  timeTotal.textContent = `${totalItemTime2} min`;

  li.appendChild(check);
  li.appendChild(content);
  li.appendChild(timeTotal);
  li.appendChild(actions);
  
  console.log('Item element created successfully');
  return li;
}

function updateProgressUI(totalDungeons, completedDungeons, totalTime, remainingTime, goal, totalTimeNeeded) {
  const denom = Math.max(1, totalDungeons);
  $('#progressText').textContent = `${completedDungeons}/${totalDungeons} DGs`;
  const pct = Math.min(100, Math.round((completedDungeons / denom) * 100));
  $('#progressFill').style.width = `${pct}%`;
  
  // Update total time display in header
  $('#totalTime').textContent = `${totalTime} min`;
  
  // Update time spent display in progress section
  $('#timeSpent').textContent = `Tempo gasto: ${totalTime} min`;
  
  // Update remaining time display in header
  if (goal > 0 && remainingTime > 0) {
    $('#remainingTime').textContent = `${remainingTime} min restantes`;
    $('#remainingTime').style.display = 'inline-block';
  } else {
    $('#remainingTime').style.display = 'none';
  }
  
  // Update remaining time display in progress section
  if (goal > 0 && remainingTime > 0) {
    $('#timeRemaining').textContent = `Tempo restante: ${remainingTime} min`;
    $('#timeRemaining').style.display = 'inline-block';
  } else {
    $('#timeRemaining').style.display = 'none';
  }
  
  // Update total time needed display in progress section
  if (goal > 0 && totalTimeNeeded > 0) {
    $('#timeTotalNeeded').textContent = `Tempo total necessário: ${totalTimeNeeded} min`;
    $('#timeTotalNeeded').style.display = 'inline-block';
  } else {
    $('#timeTotalNeeded').style.display = 'none';
  }
  
  // Add visual feedback for completion status
  const progressFill = $('#progressFill');
  if (completedDungeons >= totalDungeons && totalDungeons > 0) {
    progressFill.style.background = 'var(--gradient-success)';
    progressFill.style.boxShadow = '0 0 18px rgba(52,211,153,0.35) inset';
  } else {
    progressFill.style.background = 'var(--gradient-primary)';
    progressFill.style.boxShadow = '0 0 18px rgba(139,92,246,0.35) inset';
  }
  
  // Update efficiency summary
  updateEfficiencySummary(completedDungeons, totalTime, goal);
}

function updateEfficiencySummary(completedDungeons, totalTime, goal) {
  const efficiencySummary = $('#efficiencySummary');
  const efficiencyValue = $('#efficiencyValue');
  const dungeonsPerHour = $('#dungeonsPerHour');
  
  if (goal > 0 && totalTime > 0) {
    // Calculate efficiency percentage
    const efficiency = Math.round((completedDungeons / goal) * 100);
    efficiencyValue.textContent = `${efficiency}%`;
    
    // Calculate dungeons per hour
    const hours = totalTime / 60;
    const dph = hours > 0 ? Math.round(completedDungeons / hours) : 0;
    dungeonsPerHour.textContent = dph;
    
    efficiencySummary.style.display = 'grid';
  } else {
    efficiencySummary.style.display = 'none';
  }
}

function setCongratsVisible(visible) {
  const el = $('#congrats');
  if (visible) {
    el.hidden = false;
  } else {
    el.hidden = true;
  }
}

function main() {
  console.log('Main function started');
  renderHeader();
  const { all, todayKey, state } = getStateForToday();
  console.log('State loaded:', state);

  const dayIndex = new Date().getDay();
  const goal = getGoalForDay(dayIndex);
  console.log('Day index:', dayIndex, 'Goal:', goal);
  
  // Make render function globally accessible
  window.mainFunction = { render, state, all, todayKey };

  function render() {
    console.log('Rendering with items:', state.items.length, state.items); // Debug
    
    const list = $('#dungeonList');
    if (!list) {
      console.error('dungeonList element not found!');
      return;
    }
    
    list.innerHTML = '';
    
    if (state.items.length === 0) {
      console.log('No items to render');
    } else {
      state.items.forEach((item, idx) => {
        console.log(`Creating element for item ${idx}:`, item);
        const node = createItemElement(item, idx, goal, toggleDone, incCount, decCount, deleteItem);
        list.appendChild(node);
      });
    }
    
    // Render library and available dungeons
    renderLibrary();
    renderAvailableDungeons();
    renderAlzLibrary();
    const total = state.items.length;
    const completed = state.items.filter(i => (goal > 0 ? i.count >= goal : i.count > 0)).length;
    
    // Calcular tempo total: tempo individual × quantidade de execuções
    const totalTime = state.items.reduce((sum, item) => {
      const executions = goal > 0 ? Math.min(item.count, goal) : item.count;
      return sum + ((item.time || 0) * executions);
    }, 0);
    
    // Calcular tempo restante para completar todas as metas
    const remainingTime = state.items.reduce((sum, item) => {
      if (goal > 0 && item.count < goal) {
        const remainingExecutions = goal - item.count;
        return sum + ((item.time || 0) * remainingExecutions);
      }
      return sum;
    }, 0);
    
    // Calcular tempo total necessário para completar todas as metas (tempo gasto + tempo restante)
    const totalTimeNeeded = totalTime + remainingTime;
    
    updateProgressUI(total, completed, totalTime, remainingTime, goal, totalTimeNeeded);
    setCongratsVisible(total > 0 && completed === total);

  }

  function addItem(title, time) {
    console.log('Adding item:', { title, time, currentItems: state.items.length }); // Debug
    
    state.items.push({ 
      title: title.trim(), 
      count: 0, 
      time: parseInt(time) || 0,
      createdAt: Date.now() 
    });
    
    console.log('After adding, items:', state.items); // Debug
    
    saveState(todayKey, state, all);
    render();
  }

  function toggleDone(index) {
    const item = state.items[index];
    if (!item) return;
    const done = item.count >= goal && goal > 0;
    if (goal > 0) {
      item.count = done ? 0 : goal;
    } else {
      // Domingo livre: alterna entre 0 e 1
      item.count = item.count > 0 ? 0 : 1;
    }
    saveState(todayKey, state, all);
    render();
  }

  function incCount(index) {
    const item = state.items[index];
    if (!item) return;
    if (goal === 0) {
      // Domingo livre: incrementa sem limite
      item.count = (item.count || 0) + 1;
    } else {
      item.count = Math.min(goal, (item.count || 0) + 1);
    }
    saveState(todayKey, state, all);
    render();
  }

  function decCount(index) {
    const item = state.items[index];
    if (!item) return;
    item.count = Math.max(0, (item.count || 0) - 1);
    saveState(todayKey, state, all);
    render();
  }

  function deleteItem(index) {
    state.items.splice(index, 1);
    saveState(todayKey, state, all);
    render();
  }

  // Library form submit
  $('#addLibraryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const dungeonInput = $('#libraryDungeonInput');
    const timeInput = $('#libraryTimeInput');
    const title = dungeonInput.value.trim();
    const time = timeInput.value;
    
    console.log('Library form submitted:', { title, time }); // Debug
    
    if (!title || !time) {
      alert('Por favor, preencha nome e tempo da dungeon');
      return;
    }
    
    if (addToLibrary(title, time)) {
      dungeonInput.value = '';
      timeInput.value = '';
      dungeonInput.focus();
      render(); // Refresh all displays
    }
  });

  // Alz Library form submit
  $('#addAlzForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = $('#alzNameInput');
    const valueInput = $('#alzValueInput');
    const name = nameInput.value.trim();
    const value = valueInput.value;
    
    if (!name || !value) {
      alert('Por favor, preencha nome e valor do farm');
      return;
    }
    
    if (addToAlzLibrary(name, value)) {
      nameInput.value = '';
      valueInput.value = '';
      nameInput.focus();
      render(); // Refresh all displays
    }
  });

  // Custom goal input handler
  $('#customGoalInput').addEventListener('input', (e) => {
    const goal = parseInt(e.target.value) || 0;
    setGoalForToday(goal);
    renderHeader();
    render(); // Refresh all displays
  });

  // Manual reset button removed per user request

  // Auto reset on day change
  let lastDay = new Date().getDay();
  setInterval(() => {
    const nowDay = new Date().getDay();
    if (nowDay !== lastDay) {
      // New day: create fresh state
      const storage = readStorage();
      const key = getTodayKey();
      if (!storage[key]) storage[key] = { items: [] };
      writeStorage(storage);
      lastDay = nowDay;
      renderHeader();
      // Refresh references
      const fresh = getStateForToday();
      state.items = fresh.state.items;
      render();
    }
  }, 60 * 1000);

  // Initial render
  render();
}

console.log('Script loaded, waiting for DOM...');
document.addEventListener('DOMContentLoaded', main);

// Global functions for library management
window.addDungeonToDay = function(libraryId, state, all, todayKey) {
  const library = getLibrary();
  const dungeon = library.find(d => d.id === libraryId);
  if (!dungeon) return;
  
  // Add to today's list
  state.items.push({
    title: dungeon.title,
    time: dungeon.time,
    count: 0,
    createdAt: Date.now(),
    libraryId: dungeon.id
  });
  
  saveState(todayKey, state, all);
  
  // Re-render everything
  const mainFunction = window.mainFunction;
  if (mainFunction) {
    mainFunction.render();
  }
};

window.removeDungeonFromLibrary = function(libraryId, state, all, todayKey) {
  if (confirm('Tem certeza que deseja remover esta dungeon da biblioteca?')) {
    removeFromLibrary(libraryId);
    
    // Also remove from today's list if it exists
    state.items = state.items.filter(item => item.libraryId !== libraryId);
    saveState(todayKey, state, all);
    
    // Re-render everything
    const mainFunction = window.mainFunction;
    if (mainFunction) {
      mainFunction.render();
    }
  }
};

window.removeAlzFromLibrary = function(alzId) {
  if (confirm('Tem certeza que deseja remover este farm da biblioteca de Alzes?')) {
    removeFromAlzLibrary(alzId);
    
    // Re-render everything
    const mainFunction = window.mainFunction;
    if (mainFunction) {
      mainFunction.render();
    }
  }
};


// Function to format Alzes with colors (simplified values: 1=1M, 10=10M, 100=100M, 1000=1B, etc.)
function formatAlzes(alzes) {
  let formattedAlzes = '';
  let colorClass = '';

  if (alzes >= 10000) { // 10B+
    formattedAlzes = `${(alzes / 1000).toFixed(0)}B`;
    colorClass = 'alz-pink';
  } else if (alzes >= 1000) { // 1B+
    formattedAlzes = `${(alzes / 1000).toFixed(1)}B`;
    colorClass = 'alz-purple';
  } else if (alzes >= 100) { // 100M+
    formattedAlzes = `${alzes}M`;
    colorClass = 'alz-orange';
  } else if (alzes >= 10) { // 10M+
    formattedAlzes = `${alzes}M`;
    colorClass = 'alz-green';
  } else if (alzes >= 1) { // 1M+
    formattedAlzes = `${alzes}M`;
    colorClass = 'alz-blue';
  } else {
    formattedAlzes = String(alzes);
  }

  return `<span class="${colorClass}">${formattedAlzes}</span>`;
}


