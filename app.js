// ===== PLANIDE v3.2 - APPLICATION PRINCIPALE =====
// Fusion de app_v3.js + prescriptions.js + optimisations

// ===== VARIABLES GLOBALES =====
let currentProfile = null;
let profiles = [];
let appConfig = {
    startTime: '08:00',
    endTime: '20:00',
    interval: 1,
    sectors: []
};
let currentSector = null;
let rooms = [];
let timeSlots = [];
let currentRoomIndex = 0;
let careData = [];
let templates = [];
let currentTheme = 'ocean';
let isDarkMode = false;
let prescriptions = [];
let currentPrescriptionImage = null;
let roomNotes = {};

// ===== THÈMES =====
const themes = {
    ocean: { name: 'Océan', emoji: '🌊', primary: '#14b8a6', primaryDark: '#0d9488', secondary: '#06b6d4', secondaryDark: '#0891b2', headerStart: '#0e7490', headerEnd: '#155e75' },
    lavender: { name: 'Lavande', emoji: '🌸', primary: '#a78bfa', primaryDark: '#8b5cf6', secondary: '#c084fc', secondaryDark: '#a855f7', headerStart: '#7c3aed', headerEnd: '#6d28d9' },
    forest: { name: 'Forêt', emoji: '🌲', primary: '#10b981', primaryDark: '#059669', secondary: '#34d399', secondaryDark: '#10b981', headerStart: '#047857', headerEnd: '#065f46' },
    sunset: { name: 'Coucher de soleil', emoji: '🌅', primary: '#f59e0b', primaryDark: '#d97706', secondary: '#fb923c', secondaryDark: '#f97316', headerStart: '#ea580c', headerEnd: '#c2410c' },
    night: { name: 'Nuit', emoji: '🌙', primary: '#6366f1', primaryDark: '#4f46e5', secondary: '#818cf8', secondaryDark: '#6366f1', headerStart: '#4338ca', headerEnd: '#3730a3' },
    rose: { name: 'Rose', emoji: '🌹', primary: '#ec4899', primaryDark: '#db2777', secondary: '#f472b6', secondaryDark: '#ec4899', headerStart: '#be185d', headerEnd: '#9f1239' }
};

const defaultQuickActions = [
    { name: 'Prise de constantes', emoji: '🩺' },
    { name: 'Changement protection', emoji: '🛏️' },
    { name: 'ATB', emoji: '💊' },
    { name: 'Prise de sang', emoji: '🩸' },
    { name: 'Perfusion', emoji: '💉' },
    { name: 'Surveillance température', emoji: '🌡️' }
];

// ===== INITIALISATION =====
function init() {
    loadProfiles();
    loadTheme();
    loadDarkMode();
    
    if (!currentProfile) {
        document.getElementById('profileCreationModal').classList.add('active');
        document.getElementById('mainApp').style.display = 'none';
    } else {
        loadConfiguration();
        
        if (!appConfig.sectors || appConfig.sectors.length === 0) {
            document.getElementById('configModal').classList.add('active');
            document.getElementById('mainApp').style.display = 'none';
        } else {
            document.getElementById('profileCreationModal').classList.remove('active');
            document.getElementById('mainApp').style.display = 'block';
            
            generateTimeSlots();
            loadSectorsList();
            currentSector = appConfig.sectors[0].id;
            rooms = appConfig.sectors[0].rooms;
            
            loadCareData();
            loadTemplates();
            loadPrescriptions();
            initRoomGrid();
            updateRoomDisplay();
            renderGlobalOverview();
            populateTimeSelects();
            updateBurgerProfile();
            updateHeaderBadge();
            renderQuickActions();
        }
    }
}

// ===== GESTION DES PROFILS =====
function loadProfiles() {
    const saved = localStorage.getItem('planide_profiles');
    if (saved) profiles = JSON.parse(saved);
    
    const currentProfileId = localStorage.getItem('planide_current_profile');
    if (currentProfileId) currentProfile = profiles.find(p => p.id === currentProfileId);
}

function saveProfiles() {
    localStorage.setItem('planide_profiles', JSON.stringify(profiles));
    if (currentProfile) {
        localStorage.setItem('planide_current_profile', currentProfile.id);
        localStorage.setItem(`planide_profile_${currentProfile.id}`, JSON.stringify(currentProfile));
    }
}

function createProfile() {
    const name = document.getElementById('profileName').value.trim();
    const role = document.getElementById('profileRole').value;
    const service = document.getElementById('profileService').value.trim();
    const emoji = document.getElementById('profileAvatarPreview').textContent;
    
    if (!name) {
        alert('⚠️ Veuillez entrer votre nom');
        return;
    }
    
    const profile = {
        id: 'profile_' + Date.now(),
        name, role, service, emoji,
        quickActions: [...defaultQuickActions],
        createdAt: new Date().toISOString()
    };
    
    profiles.push(profile);
    currentProfile = profile;
    saveProfiles();
    
    document.getElementById('profileCreationModal').classList.remove('active');
    document.getElementById('configModal').classList.add('active');
}

function updateBurgerProfile() {
    if (currentProfile) {
        document.getElementById('burgerProfilePic').textContent = currentProfile.emoji;
        document.getElementById('burgerProfileName').textContent = currentProfile.name;
        document.getElementById('burgerProfileRole').textContent = currentProfile.role;
    }
}

function updateHeaderBadge() {
    if (currentProfile) {
        document.getElementById('headerUserBadge').textContent = `${currentProfile.emoji} ${currentProfile.name}`;
    }
}

// ===== MENU BURGER =====
function openBurgerMenu() {
    document.getElementById('burgerMenu').classList.add('active');
    document.getElementById('burgerOverlay').classList.add('active');
}

function closeBurgerMenu() {
    document.getElementById('burgerMenu').classList.remove('active');
    document.getElementById('burgerOverlay').classList.remove('active');
}

// ===== THÈMES =====
function loadTheme() {
    const saved = localStorage.getItem('planide_theme');
    if (saved) currentTheme = saved;
    applyTheme(currentTheme);
}

function applyTheme(themeName) {
    const theme = themes[themeName];
    if (theme) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--primary-dark', theme.primaryDark);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--secondary-dark', theme.secondaryDark);
        root.style.setProperty('--header-gradient-start', theme.headerStart);
        root.style.setProperty('--header-gradient-end', theme.headerEnd);
        
        currentTheme = themeName;
        localStorage.setItem('planide_theme', themeName);
    }
}

function openThemeCustomization() {
    closeBurgerMenu();
    const themeGrid = document.getElementById('themeGrid');
    themeGrid.innerHTML = '';
    
    Object.keys(themes).forEach(themeKey => {
        const theme = themes[themeKey];
        const card = document.createElement('div');
        card.className = 'theme-card' + (currentTheme === themeKey ? ' active' : '');
        card.style.background = `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.secondaryDark} 100%)`;
        card.innerHTML = `
            <div style="font-size: 2.5em;">${theme.emoji}</div>
            <div class="theme-name">${theme.name}</div>
        `;
        card.onclick = () => {
            applyTheme(themeKey);
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        };
        themeGrid.appendChild(card);
    });
    
    document.getElementById('themeModal').classList.add('active');
}

function closeThemeModal() {
    document.getElementById('themeModal').classList.remove('active');
}

// ===== MODE SOMBRE =====
function loadDarkMode() {
    const saved = localStorage.getItem('planide_dark_mode');
    isDarkMode = saved === 'true';
    if (isDarkMode) document.body.classList.add('dark-mode');
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('planide_dark_mode', isDarkMode);
    isDarkMode ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
    closeBurgerMenu();
}

// ===== CONFIGURATION =====
function loadConfiguration() {
    const saved = localStorage.getItem('planide_config');
    if (saved) appConfig = JSON.parse(saved);
}

function saveAppConfiguration() {
    localStorage.setItem('planide_config', JSON.stringify(appConfig));
}

function generateTimeSlots() {
    timeSlots = [];
    const [startHour, startMin] = appConfig.startTime.split(':').map(Number);
    const [endHour, endMin] = appConfig.endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    // Gérer les gardes de nuit (qui passent minuit)
    const isNightShift = startHour > endHour;
    const maxIterations = 24; // Sécurité anti-boucle infinie
    let iterations = 0;
    
    while (iterations < maxIterations) {
        timeSlots.push(`${String(currentHour).padStart(2, '0')}h${String(currentMin).padStart(2, '0')}`);
        
        // Incrémenter l'heure
        currentHour += appConfig.interval;
        
        // Gérer le passage à minuit
        if (currentHour >= 24) {
            currentHour = currentHour - 24;
        }
        
        // Condition d'arrêt
        if (isNightShift) {
            // Garde de nuit : on s'arrête quand on atteint l'heure de fin
            if (currentHour > endHour || (currentHour === endHour && currentMin > endMin)) {
                break;
            }
            // Si on repasse dans l'après-midi, on arrête
            if (currentHour > startHour && currentHour < 12) {
                break;
            }
        } else {
            // Garde de jour : arrêt classique
            if (currentHour > endHour || (currentHour === endHour && currentMin > endMin)) {
                break;
            }
        }
        
        iterations++;
    }
}

function populateTimeSelects() {
    const selects = ['careTime', 'quickCareTime'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = '';
        timeSlots.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time.replace('h', ':');
            select.appendChild(option);
        });
    });
}

let sectorConfigCounter = 0;

function addSectorConfig() {
    const container = document.getElementById('sectorsConfigList');
    const sectorId = `sector_${Date.now()}_${sectorConfigCounter++}`;
    
    const sectorDiv = document.createElement('div');
    sectorDiv.className = 'sector-item';
    sectorDiv.id = `config_${sectorId}`;
    sectorDiv.innerHTML = `
        <div class="form-group">
            <label>Nom du secteur / service</label>
            <input type="text" class="sector-name-input" placeholder="Ex: Secteur A, Médecine, Urgences...">
        </div>
        <div class="form-group">
            <label>Chambres / Lits (séparés par des virgules)</label>
            <input type="text" class="sector-rooms-input" placeholder="Ex: 201, 202, 203">
        </div>
        <button class="btn btn-danger" onclick="removeSectorConfig('${sectorId}')">🗑️ Supprimer</button>
    `;
    container.appendChild(sectorDiv);
}

function removeSectorConfig(sectorId) {
    const element = document.getElementById(`config_${sectorId}`);
    if (element) element.remove();
}

function saveConfiguration() {
    const startTime = document.getElementById('configStartTime').value;
    const endTime = document.getElementById('configEndTime').value;
    const interval = parseInt(document.getElementById('configInterval').value);
    
    if (!startTime || !endTime) {
        alert('⚠️ Veuillez renseigner les horaires');
        return;
    }
    
    const sectors = [];
    document.querySelectorAll('.sector-item').forEach(element => {
        const nameInput = element.querySelector('.sector-name-input');
        const roomsInput = element.querySelector('.sector-rooms-input');
        
        if (nameInput && roomsInput && nameInput.value.trim() && roomsInput.value.trim()) {
            sectors.push({
                id: element.id.replace('config_', ''),
                name: nameInput.value.trim(),
                rooms: roomsInput.value.split(',').map(r => r.trim()).filter(r => r)
            });
        }
    });
    
    if (sectors.length === 0) {
        alert('⚠️ Créez au moins un secteur');
        return;
    }
    
    appConfig = { startTime, endTime, interval, sectors };
    saveAppConfiguration();
    closeConfigModal();
    
    document.getElementById('mainApp').style.display = 'block';
    generateTimeSlots();
    loadSectorsList();
    currentSector = appConfig.sectors[0].id;
    rooms = appConfig.sectors[0].rooms;
    
    initRoomGrid();
    updateRoomDisplay();
    renderGlobalOverview();
    populateTimeSelects();
    renderQuickActions();
}

function closeConfigModal() {
    document.getElementById('configModal').classList.remove('active');
}

function loadSectorsList() {
    const select = document.getElementById('sectorSelect');
    select.innerHTML = '';
    appConfig.sectors.forEach(sector => {
        const option = document.createElement('option');
        option.value = sector.id;
        option.textContent = `📍 ${sector.name}`;
        select.appendChild(option);
    });
    select.value = currentSector;
}

function changeSector() {
    const newSectorId = document.getElementById('sectorSelect').value;
    if (newSectorId !== currentSector) {
        saveCareData();
        currentSector = newSectorId;
        const sector = appConfig.sectors.find(s => s.id === currentSector);
        if (sector) {
            rooms = sector.rooms;
            currentRoomIndex = 0;
            loadCareData();
            loadPrescriptions();
            initRoomGrid();
            updateRoomDisplay();
            renderGlobalOverview();
        }
    }
}

function openSettings() {
    closeBurgerMenu();
    document.getElementById('configStartTime').value = appConfig.startTime;
    document.getElementById('configEndTime').value = appConfig.endTime;
    document.getElementById('configInterval').value = appConfig.interval;
    
    const container = document.getElementById('sectorsConfigList');
    container.innerHTML = '';
    appConfig.sectors.forEach(sector => {
        const sectorDiv = document.createElement('div');
        sectorDiv.className = 'sector-item';
        sectorDiv.id = `config_${sector.id}`;
        sectorDiv.innerHTML = `
            <div class="form-group">
                <label>Nom du secteur</label>
                <input type="text" class="sector-name-input" value="${sector.name}">
            </div>
            <div class="form-group">
                <label>Chambres</label>
                <input type="text" class="sector-rooms-input" value="${sector.rooms.join(', ')}">
            </div>
            <button class="btn btn-danger" onclick="removeSectorConfig('${sector.id}')">🗑️ Supprimer</button>
        `;
        container.appendChild(sectorDiv);
    });
    document.getElementById('configModal').classList.add('active');
}

// ===== GESTION DES CHAMBRES =====
function initRoomGrid() {
    const grid = document.getElementById('roomGrid');
    grid.innerHTML = '';
    rooms.forEach((room, index) => {
        const cell = document.createElement('div');
        cell.className = 'room-cell';
        cell.textContent = room;
        cell.onclick = () => goToRoom(index);
        grid.appendChild(cell);
    });
}

function updateRoomDisplay() {
    document.getElementById('roomDisplay').textContent = rooms[currentRoomIndex];
    renderTimeline();
    updateStats();
    
    document.querySelectorAll('.room-cell').forEach((cell, index) => {
        cell.classList.toggle('active', index === currentRoomIndex);
    });
    
    if (document.querySelector('.room-tab[data-tab="prescriptions"]')?.classList.contains('active')) {
        renderPrescriptions();
    }
}

function previousRoom() {
    currentRoomIndex = (currentRoomIndex - 1 + rooms.length) % rooms.length;
    updateRoomDisplay();
}

function nextRoom() {
    currentRoomIndex = (currentRoomIndex + 1) % rooms.length;
    updateRoomDisplay();
}

function goToRoom(index) {
    currentRoomIndex = index;
    updateRoomDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== SUITE DU CODE (care data, timeline, stats, etc.) =====
// Je continue dans le prochain bloc...


// ===== GESTION DES SOINS =====
function renderTimeline() {
    const timeline = document.getElementById('timeline');
    const currentRoom = rooms[currentRoomIndex];
    const roomCares = careData.filter(c => c.room === currentRoom);
    
    timeline.innerHTML = '';
    
    timeSlots.forEach(time => {
        const timeCares = roomCares.filter(c => c.time === time);
        
        if (timeCares.length > 0) {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            
            const header = document.createElement('div');
            header.className = 'time-header';
            header.innerHTML = `
                <span>${time.replace('h', ':')}</span>
                <span class="time-badge">${timeCares.length} soin(s)</span>
            `;
            
            const list = document.createElement('div');
            list.className = 'care-list';
            
            timeCares.forEach(care => {
                const item = document.createElement('div');
                item.className = `care-item ${care.completed ? 'completed' : ''}`;
                
                const text = document.createElement('div');
                text.className = 'care-text';
                text.textContent = care.description;
                text.onclick = () => toggleCare(care.id);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteCare(care.id);
                };
                
                item.appendChild(text);
                item.appendChild(deleteBtn);
                list.appendChild(item);
            });
            
            slot.appendChild(header);
            slot.appendChild(list);
            timeline.appendChild(slot);
        }
    });
    
    if (roomCares.length === 0) {
        timeline.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px; font-style: italic;">Aucun soin programmé</div>';
    }
}

function updateStats() {
    const currentRoom = rooms[currentRoomIndex];
    const roomCares = careData.filter(c => c.room === currentRoom);
    const completed = roomCares.filter(c => c.completed).length;
    
    document.getElementById('totalCares').textContent = roomCares.length;
    document.getElementById('completedCares').textContent = completed;
    document.getElementById('pendingCares').textContent = roomCares.length - completed;
}

function toggleCare(id) {
    const care = careData.find(c => c.id === id);
    if (care) {
        care.completed = !care.completed;
        saveCareData();
        renderTimeline();
        updateStats();
        renderGlobalOverview();
    }
}

function deleteCare(id) {
    careData = careData.filter(c => c.id !== id);
    saveCareData();
    renderTimeline();
    updateStats();
    renderGlobalOverview();
}

function completeAllCares() {
    const currentRoom = rooms[currentRoomIndex];
    careData.forEach(care => {
        if (care.room === currentRoom) care.completed = true;
    });
    saveCareData();
    renderTimeline();
    updateStats();
    renderGlobalOverview();
}

function deleteRoomCares() {
    const currentRoom = rooms[currentRoomIndex];
    if (careData.filter(c => c.room === currentRoom).length === 0) {
        alert('Aucun soin à supprimer !');
        return;
    }
    if (confirm(`Supprimer tous les soins de ${currentRoom} ?`)) {
        careData = careData.filter(c => c.room !== currentRoom);
        saveCareData();
        renderTimeline();
        updateStats();
        renderGlobalOverview();
    }
}

function deleteAllCares() {
    if (careData.length === 0) {
        alert('Aucun soin !');
        return;
    }
    if (confirm('⚠️ Supprimer TOUS les soins ?')) {
        careData = [];
        saveCareData();
        renderTimeline();
        updateStats();
        renderGlobalOverview();
    }
}

function openModal() {
    document.getElementById('careRoom').value = rooms[currentRoomIndex];
    document.getElementById('careDescription').value = '';
    document.getElementById('modalMultiRoomCheckbox').checked = false;
    document.getElementById('modalSingleRoomGroup').style.display = 'block';
    document.getElementById('modalMultiRoomGroup').style.display = 'none';
    initModalMultiRoomGrid();
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function addCare() {
    const description = document.getElementById('careDescription').value;
    if (!description.trim()) {
        alert('Veuillez entrer une description');
        return;
    }
    
    const time = document.getElementById('careTime').value;
    const isMulti = document.getElementById('modalMultiRoomCheckbox').checked;
    
    let roomsToAdd = [];
    if (isMulti) {
        rooms.forEach(room => {
            const checkbox = document.getElementById('modal-room-check-' + room);
            if (checkbox?.checked) roomsToAdd.push(room);
        });
        if (roomsToAdd.length === 0) {
            alert('Sélectionnez au moins une chambre');
            return;
        }
    } else {
        roomsToAdd.push(document.getElementById('careRoom').value);
    }
    
    const maxId = Math.max(...careData.map(c => c.id), 0);
    let newId = maxId + 1;
    
    roomsToAdd.forEach(room => {
        careData.push({
            id: newId++,
            time, room, description,
            completed: false
        });
    });
    
    saveCareData();
    renderTimeline();
    updateStats();
    renderGlobalOverview();
    closeModal();
}

function renderGlobalOverview() {
    const overview = document.getElementById('globalOverview');
    overview.innerHTML = '';
    
    timeSlots.forEach(time => {
        const timeCares = careData.filter(c => c.time === time);
        if (timeCares.length > 0) {
            const section = document.createElement('div');
            section.className = 'overview-time-section';
            section.innerHTML = `
                <div class="overview-time-header">
                    <span>${time.replace('h', ':')}</span>
                    <span class="overview-time-badge">${timeCares.length} soin(s)</span>
                </div>
                <div class="overview-cares-grid">
                    ${timeCares.map(care => `
                        <div class="overview-care-card ${care.completed ? 'completed' : ''}" 
                             onclick="goToRoom(${rooms.indexOf(care.room)}); window.scrollTo(0,0);">
                            <div class="overview-room-number">Chambre ${care.room}</div>
                            <div class="overview-care-description">${care.description}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            overview.appendChild(section);
        }
    });
    
    if (overview.innerHTML === '') {
        overview.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;">Aucun soin programmé</div>';
    }
}

function saveCareData() {
    localStorage.setItem(`planide_data_${currentSector}`, JSON.stringify(careData));
}

function loadCareData() {
    const saved = localStorage.getItem(`planide_data_${currentSector}`);
    careData = saved ? JSON.parse(saved) : [];
}

// ===== ACTIONS RAPIDES =====
function renderQuickActions() {
    const grid = document.getElementById('quickActionsGrid');
    grid.innerHTML = '';
    const actions = currentProfile?.quickActions || defaultQuickActions;
    
    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'quick-btn';
        btn.onclick = () => quickAddCare(action.name, action.emoji);
        btn.innerHTML = `
            <span class="quick-btn-emoji">${action.emoji}</span>
            <span class="quick-btn-label">${action.name}</span>
        `;
        grid.appendChild(btn);
    });
}

function quickAddCare(careName, emoji) {
    document.getElementById('quickCareRoom').value = rooms[currentRoomIndex];
    document.getElementById('quickCareDescription').value = emoji + ' ' + careName;
    document.getElementById('quickModalTitle').textContent = emoji + ' ' + careName;
    document.getElementById('multiRoomCheckbox').checked = false;
    document.getElementById('singleRoomGroup').style.display = 'block';
    document.getElementById('multiRoomGroup').style.display = 'none';
    initMultiRoomGrid();
    document.getElementById('quickModal').classList.add('active');
}

function closeQuickModal() {
    document.getElementById('quickModal').classList.remove('active');
}

function addQuickCare() {
    const time = document.getElementById('quickCareTime').value;
    const description = document.getElementById('quickCareDescription').value;
    const isMulti = document.getElementById('multiRoomCheckbox').checked;
    
    let roomsToAdd = [];
    if (isMulti) {
        rooms.forEach(room => {
            const checkbox = document.getElementById('room-check-' + room);
            if (checkbox?.checked) roomsToAdd.push(room);
        });
        if (roomsToAdd.length === 0) {
            alert('Sélectionnez une chambre');
            return;
        }
    } else {
        roomsToAdd.push(document.getElementById('quickCareRoom').value);
    }
    
    const maxId = Math.max(...careData.map(c => c.id), 0);
    let newId = maxId + 1;
    
    roomsToAdd.forEach(room => {
        careData.push({ id: newId++, time, room, description, completed: false });
    });
    
    saveCareData();
    renderTimeline();
    updateStats();
    renderGlobalOverview();
    closeQuickModal();
}

function initMultiRoomGrid() {
    const grid = document.getElementById('multiRoomGrid');
    grid.innerHTML = '';
    rooms.forEach(room => {
        const item = document.createElement('div');
        item.className = 'multi-room-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'room-check-' + room;
        checkbox.value = room;
        checkbox.onchange = function() {
            item.classList.toggle('checked', this.checked);
        };
        const label = document.createElement('label');
        label.htmlFor = 'room-check-' + room;
        label.textContent = room;
        item.appendChild(checkbox);
        item.appendChild(label);
        item.onclick = (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.onchange();
            }
        };
        grid.appendChild(item);
    });
}

function initModalMultiRoomGrid() {
    const grid = document.getElementById('modalMultiRoomGrid');
    grid.innerHTML = '';
    rooms.forEach(room => {
        const item = document.createElement('div');
        item.className = 'multi-room-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'modal-room-check-' + room;
        checkbox.value = room;
        checkbox.onchange = function() {
            item.classList.toggle('checked', this.checked);
        };
        const label = document.createElement('label');
        label.htmlFor = 'modal-room-check-' + room;
        label.textContent = room;
        item.appendChild(checkbox);
        item.appendChild(label);
        item.onclick = (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.onchange();
            }
        };
        grid.appendChild(item);
    });
}

function toggleMultiRoom() {
    const isMulti = document.getElementById('multiRoomCheckbox').checked;
    document.getElementById('singleRoomGroup').style.display = isMulti ? 'none' : 'block';
    document.getElementById('multiRoomGroup').style.display = isMulti ? 'block' : 'none';
}

function toggleModalMultiRoom() {
    const isMulti = document.getElementById('modalMultiRoomCheckbox').checked;
    document.getElementById('modalSingleRoomGroup').style.display = isMulti ? 'none' : 'block';
    document.getElementById('modalMultiRoomGroup').style.display = isMulti ? 'block' : 'none';
}

function selectAllRooms() {
    rooms.forEach(room => {
        const checkbox = document.getElementById('modal-room-check-' + room);
        if (checkbox) {
            checkbox.checked = true;
            checkbox.parentElement.classList.add('checked');
        }
    });
}

function selectAllRoomsQuick() {
    rooms.forEach(room => {
        const checkbox = document.getElementById('room-check-' + room);
        if (checkbox) {
            checkbox.checked = true;
            checkbox.parentElement.classList.add('checked');
        }
    });
}

// ===== TEMPLATES =====
function loadTemplates() {
    const saved = localStorage.getItem(`planide_templates_${currentProfile.id}`);
    templates = saved ? JSON.parse(saved) : [];
}

function saveTemplates() {
    localStorage.setItem(`planide_templates_${currentProfile.id}`, JSON.stringify(templates));
}

function saveAsTemplate() {
    closeBurgerMenu();
    if (careData.length === 0) {
        alert('⚠️ Aucun soin à sauvegarder');
        return;
    }
    document.getElementById('templateName').value = '';
    document.getElementById('templateCategory').value = 'personal';
    document.getElementById('templateDescription').value = '';
    document.getElementById('saveTemplateModal').classList.add('active');
}

function closeSaveTemplateModal() {
    document.getElementById('saveTemplateModal').classList.remove('active');
}

function confirmSaveTemplate() {
    const name = document.getElementById('templateName').value.trim();
    if (!name) {
        alert('⚠️ Entrez un nom');
        return;
    }
    
    templates.push({
        id: 'template_' + Date.now(),
        name,
        category: document.getElementById('templateCategory').value,
        description: document.getElementById('templateDescription').value.trim(),
        careData: JSON.parse(JSON.stringify(careData)),
        config: { sectors: appConfig.sectors, currentSector },
        createdAt: new Date().toISOString()
    });
    
    saveTemplates();
    closeSaveTemplateModal();
    alert('✅ Template sauvegardé !');
}

function openTemplates() {
    closeBurgerMenu();
    loadTemplates();
    const grid = document.getElementById('templatesGrid');
    const noTemplates = document.getElementById('noTemplates');
    
    if (templates.length === 0) {
        grid.style.display = 'none';
        noTemplates.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        noTemplates.style.display = 'none';
        grid.innerHTML = '';
        
        const categoryEmojis = { personal: '📁', frequent: '⭐', emergency: '🚨' };
        templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <div class="template-header">
                    <div class="template-name">${template.name}</div>
                    <div class="template-icon">${categoryEmojis[template.category]}</div>
                </div>
                <div class="template-info">${template.careData.length} soins • ${new Date(template.createdAt).toLocaleDateString()}</div>
                ${template.description ? `<div class="template-info">${template.description}</div>` : ''}
                <div class="template-actions">
                    <button class="template-btn template-btn-load" onclick="loadTemplate('${template.id}')">📂 Charger</button>
                    <button class="template-btn template-btn-delete" onclick="deleteTemplate('${template.id}')">🗑️</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
    document.getElementById('templatesModal').classList.add('active');
}

function closeTemplatesModal() {
    document.getElementById('templatesModal').classList.remove('active');
}

function loadTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    if (confirm(`Charger "${template.name}" ?`)) {
        careData = JSON.parse(JSON.stringify(template.careData));
        saveCareData();
        renderTimeline();
        updateStats();
        renderGlobalOverview();
        closeTemplatesModal();
        alert('✅ Template chargé !');
    }
}

function deleteTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    if (confirm(`Supprimer "${template.name}" ?`)) {
        templates = templates.filter(t => t.id !== templateId);
        saveTemplates();
        openTemplates();
    }
}

// ===== PRESCRIPTIONS & OCR =====
function loadPrescriptions() {
    const saved = localStorage.getItem(`planide_prescriptions_${currentSector}`);
    prescriptions = saved ? JSON.parse(saved) : [];
}

function savePrescriptions() {
    localStorage.setItem(`planide_prescriptions_${currentSector}`, JSON.stringify(prescriptions));
}

function openAddPrescriptionModal() {
    document.getElementById('prescriptionRoom').value = rooms[currentRoomIndex];
    document.getElementById('prescriptionImage').value = '';
    document.getElementById('prescriptionPreview').style.display = 'none';
    document.getElementById('ocrResult').style.display = 'none';
    document.getElementById('ocrButton').style.display = 'none';
    document.getElementById('addPrescriptionModal').classList.add('active');
}

function closeAddPrescriptionModal() {
    document.getElementById('addPrescriptionModal').classList.remove('active');
    currentPrescriptionImage = null;
}

function handlePrescriptionUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        alert('⚠️ Image ou PDF uniquement');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        currentPrescriptionImage = e.target.result;
        document.getElementById('prescriptionPreview').src = currentPrescriptionImage;
        document.getElementById('prescriptionPreview').style.display = 'block';
        document.getElementById('ocrButton').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function runOCR() {
    if (!currentPrescriptionImage) {
        alert('⚠️ Sélectionnez une image');
        return;
    }
    
    const btn = document.getElementById('ocrButton');
    const progress = document.getElementById('ocrProgress');
    
    btn.disabled = true;
    btn.textContent = '⏳ Analyse...';
    progress.style.display = 'block';
    
    try {
        if (typeof Tesseract === 'undefined') {
            alert('⚠️ Tesseract non chargé');
            return;
        }
        
        const result = await Tesseract.recognize(currentPrescriptionImage, 'fra+eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    const percent = Math.round(m.progress * 100);
                    document.getElementById('ocrProgressBar').style.width = percent + '%';
                    document.getElementById('ocrProgressText').textContent = percent + '%';
                }
            }
        });
        
        const text = result.data.text;
        document.getElementById('ocrText').value = text;
        document.getElementById('ocrResult').style.display = 'block';
        
        const medications = parseMedications(text);
        if (medications.length > 0) {
            document.getElementById('generateCaresButton').style.display = 'block';
            document.getElementById('generateCaresButton').onclick = () => generateCaresFromPrescription(medications);
        }
        
        btn.textContent = '✅ Terminé';
        btn.disabled = false;
    } catch (error) {
        console.error('Erreur OCR:', error);
        alert('❌ Erreur OCR');
        btn.textContent = '🔍 Analyser';
        btn.disabled = false;
    } finally {
        progress.style.display = 'none';
    }
}

function parseMedications(text) {
    const medications = [];
    const patterns = [
        /([A-Z][a-z]+(?:cillin|mycin|done|ol|ide|ine|ate)e?)\s*(\d+\s*(?:mg|g|ml))\s*[x×]?\s*(\d+)\s*\/?\s*j(?:our)?/gi,
        /([A-Z][a-z]+(?:tamol|dol|phène|ine|ate))\s*(\d+\s*(?:mg|g|ml)).*?(matin|midi|soir|(?:matin.*?soir))/gi,
        /([A-Z][a-z]{3,})\s+(\d+\s*(?:mg|g|ml))/g
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const med = {
                name: match[1],
                dose: match[2],
                frequency: match[3] || '?',
                rawText: match[0]
            };
            if (!medications.find(m => m.name === med.name && m.dose === med.dose)) {
                medications.push(med);
            }
        }
    });
    
    return medications;
}

function generateCaresFromPrescription(medications) {
    if (!medications.length) {
        alert('⚠️ Aucun médicament');
        return;
    }
    
    const currentRoom = rooms[currentRoomIndex];
    let caresAdded = 0;
    
    medications.forEach(med => {
        let times = [];
        const freq = med.frequency.toLowerCase();
        
        if (freq.includes('3') || (freq.includes('matin') && freq.includes('soir'))) {
            times = ['08h00', '14h00', '20h00'];
        } else if (freq.includes('2')) {
            times = ['08h00', '20h00'];
        } else if (freq.includes('matin')) {
            times = ['08h00'];
        } else if (freq.includes('midi')) {
            times = ['12h00'];
        } else if (freq.includes('soir')) {
            times = ['20h00'];
        } else {
            times = ['08h00'];
        }
        
        times.forEach(time => {
            if (timeSlots.includes(time)) {
                const maxId = Math.max(...careData.map(c => c.id), 0);
                careData.push({
                    id: maxId + 1,
                    time, room: currentRoom,
                    description: `💊 ${med.name} ${med.dose}`,
                    completed: false,
                    fromPrescription: true
                });
                caresAdded++;
            }
        });
    });
    
    if (caresAdded > 0) {
        saveCareData();
        renderTimeline();
        updateStats();
        renderGlobalOverview();
        alert(`✅ ${caresAdded} soin(s) généré(s) !`);
        closeAddPrescriptionModal();
    } else {
        alert('⚠️ Aucun soin généré');
    }
}

function savePrescription() {
    if (!currentPrescriptionImage) {
        alert('⚠️ Sélectionnez une image');
        return;
    }
    
    prescriptions.push({
        id: 'rx_' + Date.now(),
        roomId: rooms[currentRoomIndex],
        date: new Date().toISOString(),
        image: currentPrescriptionImage,
        extractedText: document.getElementById('ocrText').value,
        notes: document.getElementById('prescriptionNotes').value,
        medications: parseMedications(document.getElementById('ocrText').value)
    });
    
    savePrescriptions();
    alert('✅ Prescription sauvegardée !');
    closeAddPrescriptionModal();
    renderPrescriptions();
}

function renderPrescriptions() {
    const container = document.getElementById('prescriptionsList');
    const currentRoom = rooms[currentRoomIndex];
    const roomPrescriptions = prescriptions.filter(p => p.roomId === currentRoom);
    
    if (!roomPrescriptions.length) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #6c757d;">
                <p style="font-size: 3em; margin-bottom: 15px;">📋</p>
                <p style="font-size: 1.2em;">Aucune prescription</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    roomPrescriptions.reverse().forEach(prescription => {
        const card = document.createElement('div');
        card.className = 'prescription-card';
        card.innerHTML = `
            <div class="prescription-header">
                <div class="prescription-date">📅 ${new Date(prescription.date).toLocaleDateString('fr-FR')}</div>
                <button class="prescription-delete" onclick="deletePrescription('${prescription.id}')">🗑️</button>
            </div>
            <div class="prescription-image" onclick="viewPrescriptionImage('${prescription.id}')">
                <img src="${prescription.image}" alt="Prescription">
            </div>
            ${prescription.medications.length ? `
                <div class="prescription-medications">
                    <strong>💊 Médicaments:</strong>
                    ${prescription.medications.map(m => `
                        <div class="medication-item">${m.name} ${m.dose} - ${m.frequency}</div>
                    `).join('')}
                </div>
            ` : ''}
            ${prescription.notes ? `
                <div class="prescription-notes">
                    <strong>📝 Notes:</strong>
                    <p>${prescription.notes}</p>
                </div>
            ` : ''}
            <div class="prescription-actions">
                <button class="btn btn-primary" onclick="generateCaresFromExistingPrescription('${prescription.id}')">
                    ⚡ Générer soins
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function generateCaresFromExistingPrescription(prescriptionId) {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return;
    if (!prescription.medications.length) {
        alert('⚠️ Aucun médicament');
        return;
    }
    if (confirm(`Générer ${prescription.medications.length} soin(s) ?`)) {
        generateCaresFromPrescription(prescription.medications);
    }
}

function deletePrescription(prescriptionId) {
    if (confirm('Supprimer cette prescription ?')) {
        prescriptions = prescriptions.filter(p => p.id !== prescriptionId);
        savePrescriptions();
        renderPrescriptions();
    }
}

function viewPrescriptionImage(prescriptionId) {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return;
    document.getElementById('prescriptionViewImage').src = prescription.image;
    document.getElementById('prescriptionViewModal').classList.add('active');
}

function closePrescriptionViewModal() {
    document.getElementById('prescriptionViewModal').classList.remove('active');
}

// ===== ONGLETS =====
function switchTab(tabName) {
    document.querySelectorAll('.room-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.room-tab[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.room-tab-content').forEach(content => content.style.display = 'none');
    document.getElementById(`${tabName}Content`).style.display = 'block';
    
    if (tabName === 'prescriptions') renderPrescriptions();
    else if (tabName === 'notes') loadRoomNotes();
}

function loadRoomNotes() {
    const saved = localStorage.getItem(`planide_notes_${currentSector}`);
    if (saved) roomNotes = JSON.parse(saved);
    document.getElementById('roomNotesTextarea').value = roomNotes[rooms[currentRoomIndex]] || '';
}

function saveRoomNotes() {
    roomNotes[rooms[currentRoomIndex]] = document.getElementById('roomNotesTextarea').value;
    localStorage.setItem(`planide_notes_${currentSector}`, JSON.stringify(roomNotes));
    alert('✅ Notes sauvegardées !');
}

// ===== EXPORT/IMPORT =====
function exportData() {
    const exportObj = {
        profile: currentProfile,
        config: appConfig,
        templates,
        sectors: {}
    };
    appConfig.sectors.forEach(sector => {
        const data = localStorage.getItem(`planide_data_${sector.id}`);
        if (data) exportObj.sectors[sector.id] = JSON.parse(data);
    });
    
    const link = document.createElement('a');
    link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    link.download = `planide_${currentProfile.name}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    closeBurgerMenu();
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.config) {
                    appConfig = imported.config;
                    saveAppConfiguration();
                }
                if (imported.templates) {
                    templates = imported.templates;
                    saveTemplates();
                }
                if (imported.sectors) {
                    Object.keys(imported.sectors).forEach(sectorId => {
                        localStorage.setItem(`planide_data_${sectorId}`, JSON.stringify(imported.sectors[sectorId]));
                    });
                }
                alert('✅ Données importées !');
                location.reload();
            } catch (error) {
                alert('❌ Erreur import');
            }
        };
        reader.readAsText(file);
    }
}

// ===== STATS & ABOUT =====
function openStats() {
    closeBurgerMenu();
    const total = careData.length;
    const completed = careData.filter(c => c.completed).length;
    document.getElementById('todayStats').innerHTML = `
        <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Soins totaux</div></div>
        <div class="stat-card"><div class="stat-value">${completed}</div><div class="stat-label">Complétés</div></div>
        <div class="stat-card"><div class="stat-value">${total - completed}</div><div class="stat-label">En attente</div></div>
    `;
    document.getElementById('statsModal').classList.add('active');
}

function closeStatsModal() {
    document.getElementById('statsModal').classList.remove('active');
}

function showAbout() {
    closeBurgerMenu();
    document.getElementById('aboutModal').classList.add('active');
}

function closeAboutModal() {
    document.getElementById('aboutModal').classList.remove('active');
}

function openProfileSettings() {
    closeBurgerMenu();
    if (currentProfile) {
        document.getElementById('profileSettingsAvatarPreview').textContent = currentProfile.emoji;
        document.getElementById('profileSettingsName').value = currentProfile.name;
        document.getElementById('profileSettingsRole').value = currentProfile.role;
        document.getElementById('profileSettingsService').value = currentProfile.service || '';
    }
    document.getElementById('profileSettingsModal').classList.add('active');
}

function closeProfileSettings() {
    document.getElementById('profileSettingsModal').classList.remove('active');
}

function saveProfileSettings() {
    if (currentProfile) {
        currentProfile.name = document.getElementById('profileSettingsName').value.trim();
        currentProfile.role = document.getElementById('profileSettingsRole').value;
        currentProfile.service = document.getElementById('profileSettingsService').value.trim();
        currentProfile.emoji = document.getElementById('profileSettingsAvatarPreview').textContent;
        saveProfiles();
        updateBurgerProfile();
        updateHeaderBadge();
        closeProfileSettings();
        alert('✅ Profil mis à jour !');
    }
}

// ===== EMOJI PICKER =====
let emojiPickerTarget = null;

function chooseEmoji() {
    emojiPickerTarget = 'profileAvatarPreview';
    document.getElementById('emojiPickerModal').classList.add('active');
}

function chooseEmojiSettings() {
    emojiPickerTarget = 'profileSettingsAvatarPreview';
    document.getElementById('emojiPickerModal').classList.add('active');
}

function selectEmoji(emoji) {
    if (emojiPickerTarget) {
        document.getElementById(emojiPickerTarget).textContent = emoji;
    }
    closeEmojiPicker();
}

function closeEmojiPicker() {
    document.getElementById('emojiPickerModal').classList.remove('active');
    emojiPickerTarget = null;
}

// ===== RACCOURCIS CLAVIER =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') previousRoom();
    else if (e.key === 'ArrowRight') nextRoom();
});

// ===== LANCEMENT =====
init();
