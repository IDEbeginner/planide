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
let roomNotes = {};// ===== BASES DE DONNÉES MÉDICAMENTS =====
const atbDatabase = {
    'Amoxicilline': ['500mg', '1g'],
    'Augmentin': ['500mg/125mg', '1g/125mg', '2g/125mg'],
    'Ceftriaxone (Rocéphine)': ['1g', '2g'],
    'Ciprofloxacine': ['200mg', '400mg', '500mg', '750mg'],
    'Metronidazole (Flagyl)': ['500mg', '1.5g'],
    'Vancomycine': ['500mg', '1g'],
    'Gentamicine': ['80mg', '160mg', '240mg'],
    'Azithromycine (Zithromax)': ['250mg', '500mg'],
    'Clarithromycine': ['250mg', '500mg']
};

const perfusionDatabase = {
    'NaCl 0.9%': ['250ml', '500ml', '1000ml'],
    'Glucose 5%': ['250ml', '500ml', '1000ml'],
    'Glucose 10%': ['250ml', '500ml'],
    'Ringer Lactate': ['500ml', '1000ml'],
    'Glucosé 30%': ['10ml', '20ml'],
    'Mannitol 20%': ['250ml', '500ml']
};

const medicationCategories = {
    'Antalgiques': {
        'Paracétamol': ['500mg', '1g'],
        'Tramadol': ['50mg', '100mg'],
        'Morphine': ['10mg', '20mg', '30mg'],
        'Codéine': ['30mg', '60mg'],
        'Nefopam (Acupan)': ['20mg']
    },
    'Somnifères': {
        'Zolpidem (Stilnox)': ['5mg', '10mg'],
        'Zopiclone (Imovane)': ['3.75mg', '7.5mg'],
        'Hydroxyzine (Atarax)': ['25mg', '100mg']
    },
    'Anxiolytiques': {
        'Alprazolam (Xanax)': ['0.25mg', '0.5mg'],
        'Lorazepam (Temesta)': ['1mg', '2.5mg'],
        'Diazepam (Valium)': ['2mg', '5mg', '10mg'],
        'Oxazepam (Seresta)': ['10mg', '50mg']
    },
    'Anti-émétiques': {
        'Metoclopramide (Primpéran)': ['10mg'],
        'Ondansetron (Zofran)': ['4mg', '8mg'],
        'Dompéridone (Motilium)': ['10mg']
    },
    'Laxatifs': {
        'Macrogol (Forlax)': ['10g', '20g'],
        'Lactulose (Duphalac)': ['10g', '20g'],
        'Docusate': ['100mg']
    }
};


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
    { name: 'Prise de constantes', emoji: '🩺', type: 'simple' },
    { name: 'Changement protection', emoji: '🛏️', type: 'simple' },
    { name: 'ATB', emoji: '💊', type: 'atb' },
    { name: 'Perfusion', emoji: '💉', type: 'perfusion' },
    { name: 'Prise de sang', emoji: '🩸', type: 'simple' },
    { name: 'Autre médicament', emoji: '💊', type: 'medication' }
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
    
    // Partir de l'heure pleine suivante si on a des minutes
    let currentHour = startMin > 0 ? startHour + 1 : startHour;
    
    // Gérer les gardes de nuit (qui passent minuit)
    const isNightShift = startHour >= endHour;
    const maxIterations = 24;
    let iterations = 0;
    
    while (iterations < maxIterations) {
        const hour = currentHour % 24; // Normaliser pour passage minuit
        timeSlots.push(`${String(hour).padStart(2, '0')}h00`);
        
        currentHour += appConfig.interval;
        
        // Condition d'arrêt
        const normalizedHour = currentHour % 24;
        
        if (isNightShift) {
            // Pour garde de nuit : on s'arrête après l'heure de fin
            if (normalizedHour > endHour && normalizedHour <= startHour) {
                break;
            }
        } else {
            // Pour garde de jour
            if (currentHour > endHour) {
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
            
            const header = document.createElement('div');
            header.className = 'overview-time-header';
            header.innerHTML = `
                <span>${time.replace('h', ':')}</span>
                <span class="overview-time-badge">${timeCares.length} soin(s)</span>
            `;
            
            const grid = document.createElement('div');
            grid.className = 'overview-cares-grid';
            
            timeCares.forEach(care => {
                const card = document.createElement('div');
                card.className = 'overview-care-card' + (care.completed ? ' completed' : '');
                
                const emojiMatch = care.description.match(/[\p{Emoji}\u{1F300}-\u{1F9FF}]/u);
                const emoji = emojiMatch ? emojiMatch[0] : '📋';
                
                card.innerHTML = `
                    <div class="overview-care-emoji">${emoji}</div>
                    <div class="overview-room-number">${care.room}</div>
                `;
                
                card.onclick = () => {
                    goToRoom(rooms.indexOf(care.room));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };
                grid.appendChild(card);
            });
            
            section.appendChild(header);
            section.appendChild(grid);
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
        btn.onclick = () => quickAddCare(action.name, action.emoji, action.type);
        btn.innerHTML = `
            <span class="quick-btn-emoji">${action.emoji}</span>
            <span class="quick-btn-label">${action.name}</span>
        `;
        grid.appendChild(btn);
    });
}


function quickAddCare(careName, emoji, type) {
    document.getElementById('quickCareRoom').value = rooms[currentRoomIndex];
    document.getElementById('quickModalTitle').textContent = emoji + ' ' + careName;
    document.getElementById('multiRoomCheckbox').checked = false;
    document.getElementById('singleRoomGroup').style.display = 'block';
    document.getElementById('multiRoomGroup').style.display = 'none';
    
    // Gérer les différents types
    const atbGroup = document.getElementById('atbSelectionGroup');
    const perfusionGroup = document.getElementById('perfusionSelectionGroup');
    const medicationGroup = document.getElementById('medicationSelectionGroup');
    
    // Cacher tous les groupes par défaut
    if (atbGroup) atbGroup.style.display = 'none';
    if (perfusionGroup) perfusionGroup.style.display = 'none';
    if (medicationGroup) medicationGroup.style.display = 'none';
    
    if (type === 'atb') {
        // Afficher sélection ATB
        if (atbGroup) {
            atbGroup.style.display = 'block';
            const atbSelect = document.getElementById('atbSelect');
            atbSelect.innerHTML = '<option value="">-- Choisir un antibiotique --</option>';
            Object.keys(atbDatabase).forEach(atb => {
                const option = document.createElement('option');
                option.value = atb;
                option.textContent = atb;
                atbSelect.appendChild(option);
            });
        }
        document.getElementById('quickCareDescription').value = '💊 ATB';
    } else if (type === 'perfusion') {
        // Afficher sélection perfusion
        if (perfusionGroup) {
            perfusionGroup.style.display = 'block';
            const perfusionSelect = document.getElementById('perfusionSelect');
            perfusionSelect.innerHTML = '<option value="">-- Choisir une perfusion --</option>';
            Object.keys(perfusionDatabase).forEach(perf => {
                const option = document.createElement('option');
                option.value = perf;
                option.textContent = perf;
                perfusionSelect.appendChild(option);
            });
        }
        document.getElementById('quickCareDescription').value = '💉 Perfusion';
    } else if (type === 'medication') {
        // Afficher sélection médicament
        if (medicationGroup) {
            medicationGroup.style.display = 'block';
            const categorySelect = document.getElementById('medicationCategory');
            categorySelect.innerHTML = '<option value="">-- Choisir une catégorie --</option>';
            Object.keys(medicationCategories).forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
        document.getElementById('quickCareDescription').value = '💊 Médicament';
    } else {
        document.getElementById('quickCareDescription').value = emoji + ' ' + careName;
    }
    
    initMultiRoomGrid();
    document.getElementById('quickModal').classList.add('active');
}
function updateATBSelection() {
    const atbSelect = document.getElementById('atbSelect');
    const selectedATB = atbSelect.value;
    const dosageGroup = document.getElementById('atbDosageGroup');
    const dosageSelect = document.getElementById('atbDosage');
    
    if (selectedATB && atbDatabase[selectedATB]) {
        dosageGroup.style.display = 'block';
        dosageSelect.innerHTML = '<option value="">-- Choisir un dosage --</option>';
        atbDatabase[selectedATB].forEach(dose => {
            const option = document.createElement('option');
            option.value = dose;
            option.textContent = dose;
            dosageSelect.appendChild(option);
        });
        
        const selectedDosage = dosageSelect.value;
        if (selectedDosage) {
            document.getElementById('quickCareDescription').value = `💊 ATB - ${selectedATB} (${selectedDosage})`;
        } else {
            document.getElementById('quickCareDescription').value = `💊 ATB - ${selectedATB}`;
        }
    } else {
        dosageGroup.style.display = 'none';
        document.getElementById('quickCareDescription').value = '💊 ATB';
    }
}

function updateATBDosage() {
    const atbSelect = document.getElementById('atbSelect');
    const dosageSelect = document.getElementById('atbDosage');
    const selectedATB = atbSelect.value;
    const selectedDosage = dosageSelect.value;
    
    if (selectedATB && selectedDosage) {
        document.getElementById('quickCareDescription').value = `💊 ATB - ${selectedATB} (${selectedDosage})`;
    } else if (selectedATB) {
        document.getElementById('quickCareDescription').value = `💊 ATB - ${selectedATB}`;
    }
}

function updatePerfusionSelection() {
    const perfusionSelect = document.getElementById('perfusionSelect');
    const selectedPerfusion = perfusionSelect.value;
    const volumeGroup = document.getElementById('perfusionVolumeGroup');
    const volumeSelect = document.getElementById('perfusionVolume');
    
    if (selectedPerfusion && perfusionDatabase[selectedPerfusion]) {
        volumeGroup.style.display = 'block';
        volumeSelect.innerHTML = '<option value="">-- Choisir un volume --</option>';
        perfusionDatabase[selectedPerfusion].forEach(vol => {
            const option = document.createElement('option');
            option.value = vol;
            option.textContent = vol;
            volumeSelect.appendChild(option);
        });
        
        const selectedVolume = volumeSelect.value;
        if (selectedVolume) {
            document.getElementById('quickCareDescription').value = `💉 Perfusion - ${selectedPerfusion} (${selectedVolume})`;
        } else {
            document.getElementById('quickCareDescription').value = `💉 Perfusion - ${selectedPerfusion}`;
        }
    } else {
        volumeGroup.style.display = 'none';
        document.getElementById('quickCareDescription').value = '💉 Perfusion';
    }
}

function updatePerfusionVolume() {
    const perfusionSelect = document.getElementById('perfusionSelect');
    const volumeSelect = document.getElementById('perfusionVolume');
    const selectedPerfusion = perfusionSelect.value;
    const selectedVolume = volumeSelect.value;
    
    if (selectedPerfusion && selectedVolume) {
        document.getElementById('quickCareDescription').value = `💉 Perfusion - ${selectedPerfusion} (${selectedVolume})`;
    } else if (selectedPerfusion) {
        document.getElementById('quickCareDescription').value = `💉 Perfusion - ${selectedPerfusion}`;
    }
}

function updateMedicationCategory() {
    const categorySelect = document.getElementById('medicationCategory');
    const selectedCategory = categorySelect.value;
    const medicationGroup = document.getElementById('medicationSelectGroup');
    const medicationSelect = document.getElementById('medicationSelect');
    
    if (selectedCategory && medicationCategories[selectedCategory]) {
        medicationGroup.style.display = 'block';
        medicationSelect.innerHTML = '<option value="">-- Choisir un médicament --</option>';
        Object.keys(medicationCategories[selectedCategory]).forEach(med => {
            const option = document.createElement('option');
            option.value = med;
            option.textContent = med;
            medicationSelect.appendChild(option);
        });
        document.getElementById('quickCareDescription').value = `💊 ${selectedCategory}`;
    } else {
        medicationGroup.style.display = 'none';
        document.getElementById('quickCareDescription').value = '💊 Médicament';
    }
}

function updateMedicationSelection() {
    const categorySelect = document.getElementById('medicationCategory');
    const medicationSelect = document.getElementById('medicationSelect');
    const selectedCategory = categorySelect.value;
    const selectedMedication = medicationSelect.value;
    const dosageGroup = document.getElementById('medicationDosageGroup');
    const dosageSelect = document.getElementById('medicationDosage');
    
    if (selectedMedication && medicationCategories[selectedCategory][selectedMedication]) {
        dosageGroup.style.display = 'block';
        dosageSelect.innerHTML = '<option value="">-- Choisir un dosage --</option>';
        medicationCategories[selectedCategory][selectedMedication].forEach(dose => {
            const option = document.createElement('option');
            option.value = dose;
            option.textContent = dose;
            dosageSelect.appendChild(option);
        });
        
        const selectedDosage = dosageSelect.value;
        if (selectedDosage) {
            document.getElementById('quickCareDescription').value = `💊 ${selectedMedication} (${selectedDosage})`;
        } else {
            document.getElementById('quickCareDescription').value = `💊 ${selectedMedication}`;
        }
    } else {
        dosageGroup.style.display = 'none';
        if (selectedCategory) {
            document.getElementById('quickCareDescription').value = `💊 ${selectedCategory}`;
        }
    }
}

function updateMedicationDosage() {
    const medicationSelect = document.getElementById('medicationSelect');
    const dosageSelect = document.getElementById('medicationDosage');
    const selectedMedication = medicationSelect.value;
    const selectedDosage = dosageSelect.value;
    
    if (selectedMedication && selectedDosage) {
        document.getElementById('quickCareDescription').value = `💊 ${selectedMedication} (${selectedDosage})`;
    } else if (selectedMedication) {
        document.getElementById('quickCareDescription').value = `💊 ${selectedMedication}`;
    }
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
// ===== MANUEL DE PRÉLÈVEMENTS =====
const prelevementsData = [
    { analyse: "Acétone", nature: "Sang total", tube: "Tube EDTA (bouchon mauve)" },
    { analyse: "Acide lactique (Lactates)", nature: "Sang total artériel", tube: "Seringue héparinée à gaz" },
    { analyse: "Acide urique", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "ALAT (TGP)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Albumine", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Alcool (Éthanol)", nature: "Sang total", tube: "Tube fluoré (gris)" },
    { analyse: "Aldostérone", nature: "Plasma", tube: "Tube EDTA (mauve)" },
    { analyse: "Alpha-fœtoprotéine (AFP)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Amylase", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "ASAT (TGO)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Bilirubine totale", nature: "Sérum", tube: "Tube sec jaune (à l'abri de la lumière)" },
    { analyse: "BNP / NT-proBNP", nature: "Plasma", tube: "Tube EDTA (mauve)" },
    { analyse: "Calcémie (Calcium)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "CK (CPK)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "CK-MB", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Cholestérol total", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Cortisol", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Créatinine", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "CRP (Protéine C-réactive)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "D-dimères", nature: "Plasma", tube: "Tube citrate (bleu)" },
    { analyse: "Ferritine", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Fibrinogène", nature: "Plasma", tube: "Tube citrate (bleu)" },
    { analyse: "Folates (Vitamine B9)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Gamma-GT", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Gaz du sang artériel", nature: "Sang artériel", tube: "Seringue héparinée" },
    { analyse: "Glucose (Glycémie)", nature: "Plasma", tube: "Tube fluoré (gris)" },
    { analyse: "HbA1c (Hémoglobine glyquée)", nature: "Sang total", tube: "Tube EDTA (mauve)" },
    { analyse: "Hémogramme (NFS)", nature: "Sang total", tube: "Tube EDTA (mauve)" },
    { analyse: "Hémocultures", nature: "Sang total", tube: "Flacons hémocultures (aérobie + anaérobie)" },
    { analyse: "Hémostase (TP, TCA)", nature: "Plasma", tube: "Tube citrate (bleu)" },
    { analyse: "HCG (Bêta-HCG)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "INR", nature: "Plasma", tube: "Tube citrate (bleu)" },
    { analyse: "Ionogramme (Na, K, Cl)", nature: "Sérum ou plasma", tube: "Tube sec jaune ou hépariné vert" },
    { analyse: "Lipase", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Magnésium", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "PAL (Phosphatases alcalines)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Plaquettes", nature: "Sang total", tube: "Tube EDTA (mauve)" },
    { analyse: "Potassium (K+)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Protéines totales", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "PSA", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Sodium (Na+)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "T3, T4, TSH", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "TCA (Temps de céphaline activé)", nature: "Plasma", tube: "Tube citrate (bleu)" },
    { analyse: "TP (Taux de prothrombine)", nature: "Plasma", tube: "Tube citrate (bleu)" },
    { analyse: "Transaminases (ALAT, ASAT)", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Triglycérides", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Troponine", nature: "Sérum ou plasma", tube: "Tube sec jaune ou hépariné vert" },
    { analyse: "Urée", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Vitamine B12", nature: "Sérum", tube: "Tube sec jaune" },
    { analyse: "Vitamine D", nature: "Sérum", tube: "Tube sec jaune" }
];

function openPrelevementsManual() {
    closeBurgerMenu();
    renderPrelevementsTable();
    document.getElementById('prelevementsModal').classList.add('active');
}

function closePrelevementsModal() {
    document.getElementById('prelevementsModal').classList.remove('active');
}

function renderPrelevementsTable(filterText = '') {
    const tbody = document.getElementById('prelevementsTableBody');
    tbody.innerHTML = '';
    
    const filtered = filterText 
        ? prelevementsData.filter(p => p.analyse.toLowerCase().includes(filterText.toLowerCase()))
        : prelevementsData;
    
    filtered.forEach((item, index) => {
        const row = document.createElement('tr');
        row.style.background = index % 2 === 0 ? '#f8f9fa' : 'white';
        row.innerHTML = `
            <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: 600;">${item.analyse}</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${item.nature}</td>
            <td style="padding: 12px; border: 1px solid #dee2e6;">${item.tube}</td>
        `;
        tbody.appendChild(row);
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="padding: 40px; text-align: center; color: #6c757d;">Aucune analyse trouvée</td></tr>';
    }
}

function filterPrelevements() {
    const searchText = document.getElementById('prelevementSearch').value;
    renderPrelevementsTable(searchText);
}
function toggleMultiValidateMode() {
    multiValidateMode = !multiValidateMode;
    selectedCares.clear();
    
    const btn = document.getElementById('multiValidateBtn');
    const panel = document.getElementById('multiValidatePanel');
    
    if (multiValidateMode) {
        btn.textContent = '✕ Annuler';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        panel.style.display = 'block';
    } else {
        btn.textContent = '✓ Valider plusieurs';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        panel.style.display = 'none';
    }
    
    renderGlobalOverview();
    updateSelectedCount();
}

function cancelMultiValidateMode() {
    multiValidateMode = false;
    selectedCares.clear();
    
    const btn = document.getElementById('multiValidateBtn');
    const panel = document.getElementById('multiValidatePanel');
    
    btn.textContent = '✓ Valider plusieurs';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
    panel.style.display = 'none';
    
    renderGlobalOverview();
}

function toggleCareSelection(careId) {
    if (selectedCares.has(careId)) {
        selectedCares.delete(careId);
    } else {
        selectedCares.add(careId);
    }
    renderGlobalOverview();
    updateSelectedCount();
}

function updateSelectedCount() {
    const countEl = document.getElementById('selectedCount');
    if (countEl) {
        countEl.textContent = `${selectedCares.size} soin(s) sélectionné(s)`;
    }
}

function validateSelectedCares() {
    if (selectedCares.size === 0) {
        alert('⚠️ Aucun soin sélectionné');
        return;
    }
    
        const count = selectedCares.size;
    
    if (confirm(`Valider ${count} soin(s) ?`)) {
        selectedCares.forEach(careId => {
            const care = careData.find(c => c.id === careId);
            if (care) care.completed = true;
        });
        
        saveCareData();
        selectedCares.clear();
        cancelMultiValidateMode();
        renderTimeline();
        updateStats();
        renderGlobalOverview();
        
        alert(`✅ ${count} soin(s) validé(s) !`);
    }
}

// ===== LANCEMENT =====
init();
