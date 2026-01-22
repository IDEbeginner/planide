// ===== SYSTÈME DE TRADUCTIONS =====
const translations = {
    fr: {
        // Header
        appSubtitle: "Planification des Soins Infirmiers",
        
        // Profile creation
        welcomeTitle: "👋 Bienvenue sur PlanIDE !",
        createProfileSubtitle: "Créons votre profil pour personnaliser votre expérience.",
        clickToChooseEmoji: "Cliquez pour choisir un emoji",
        yourName: "Votre nom / prénom",
        namePlaceholder: "Ex: Marie Dupont",
        yourRole: "Votre fonction",
        usualService: "Service habituel (optionnel)",
        servicePlaceholder: "Ex: Médecine, Chirurgie...",
        createProfile: "✅ Créer mon profil",
        
        // Roles
        roles: {
            nurse: "Infirmier(ère)",
            nurseDE: "Infirmier(ère) DE",
            nursingAssistant: "Aide-soignant(e)",
            nightNurse: "Infirmier(ère) de nuit",
            coordinatorNurse: "Infirmier(ère) coordinateur",
            other: "Autre"
        },
        
        // Burger menu
        myAccount: "MON COMPTE",
        myProfile: "Mon profil",
        switchProfile: "Changer de profil",
        organization: "ORGANISATION",
        myTemplates: "Mes templates",
        saveAsTemplate: "Sauvegarder comme template",
        customization: "PERSONNALISATION",
        themesAndColors: "Thèmes et couleurs",
        darkMode: "Mode sombre",
        language: "Langue",
        settings: "PARAMÈTRES",
        settingsMenu: "Paramètres",
        statistics: "Statistiques",
        exportData: "Exporter mes données",
        about: "À PROPOS",
        aboutPlanIDE: "À propos de PlanIDE",
        
        // Configuration
        configTitle: "⚙️ Configuration de PlanIDE",
        scheduleSettings: "🕐 Horaires de service",
        startTime: "Heure de début",
        endTime: "Heure de fin",
        intervalBetweenSlots: "Intervalle entre les créneaux (heures)",
        sectorsServices: "🏥 Secteurs / Services",
        sectorName: "Nom du secteur / service",
        sectorPlaceholder: "Ex: Secteur A, Médecine, Urgences...",
        roomsLabel: "Chambres / Lits (séparés par des virgules)",
        roomsPlaceholder: "Ex: 201, 202, 203 ou A1, A2, A3",
        addSector: "➕ Ajouter un secteur",
        deleteSector: "🗑️ Supprimer ce secteur",
        cancel: "Annuler",
        save: "✅ Enregistrer",
        
        // Main interface
        addCare: "➕ Ajouter un soin",
        completeAll: "✓ Tout compléter",
        deleteRoom: "🗑️ Supprimer chambre",
        deleteAll: "⚠️ Tout supprimer",
        saveBtn: "💾 Sauvegarder",
        loadBtn: "📂 Charger",
        
        // Quick actions
        quickActions: "⚡ Actions rapides",
        quickActionsList: {
            vitalSigns: "Prise de constantes",
            protectionChange: "Changement protection",
            antibiotics: "ATB",
            bloodTest: "Prise de sang",
            perfusion: "Perfusions",
            temperatureMonitoring: "Surveillance température"
        },
        
        // Stats
        totalCares: "Soins totaux",
        completed: "Complétés",
        pending: "En attente",
        
        // Timeline
        cares: "soin(s)",
        noCareScheduled: "Aucun soin programmé pour cette chambre",
        
        // Modal add care
        addCareTitle: "Ajouter un soin",
        time: "Heure",
        selectMultipleRooms: "Sélectionner plusieurs chambres",
        room: "Chambre",
        rooms: "Chambres",
        selectAll: "✓ Tout sélectionner",
        careDescription: "Description du soin",
        careDescriptionPlaceholder: "Ex: Prise de constantes, médication, toilette, surveillance...",
        add: "Ajouter",
        
        // Templates
        templatesTitle: "📋 Mes Templates",
        saveTemplateTitle: "💾 Sauvegarder comme template",
        templateName: "Nom du template",
        templateNamePlaceholder: "Ex: Garde de nuit type, Mardi matin...",
        category: "Catégorie",
        categories: {
            personal: "📁 Personnel",
            frequent: "⭐ Fréquent",
            emergency: "🚨 Urgence"
        },
        description: "Description (optionnel)",
        descriptionPlaceholder: "Notes sur ce template...",
        noTemplates: "Aucun template sauvegardé",
        createFirstTemplate: "Créez votre premier template depuis le menu burger !",
        loadTemplate: "📂 Charger",
        deleteTemplate: "🗑️",
        close: "Fermer",
        
        // Themes
        themesTitle: "🎨 Thèmes et couleurs",
        predefinedThemes: "Thèmes prédéfinis",
        themeNames: {
            ocean: "Océan",
            lavender: "Lavande",
            forest: "Forêt",
            sunset: "Coucher de soleil",
            night: "Nuit",
            rose: "Rose"
        },
        displayMode: "Mode d'affichage",
        lightMode: "☀️ Mode clair",
        darkModeBtn: "🌙 Mode sombre",
        
        // Profile settings
        profileSettingsTitle: "👤 Mon profil",
        clickToChange: "Cliquez pour changer",
        customQuickActions: "⚡ Actions rapides personnalisées",
        customQuickActionsDesc: "Personnalisez les soins qui apparaissent dans vos actions rapides",
        
        // Statistics
        statsTitle: "📊 Statistiques",
        today: "📈 Aujourd'hui",
        thisWeek: "📅 Cette semaine",
        personalRecords: "🏆 Records personnels",
        
        // About
        aboutTitle: "ℹ️ À propos de PlanIDE",
        version: "PlanIDE v3.1",
        appDescription: "Application de planification des soins",
        features: "✨ Fonctionnalités",
        featuresList: {
            multiProfile: "Gestion multi-profils",
            templates: "Templates réutilisables",
            themes: "Personnalisation des thèmes",
            offline: "Mode hors ligne",
            exportImport: "Export/Import de données",
            stats: "Statistiques personnelles"
        },
        usageTips: "💡 Conseils d'utilisation",
        tips: "• Créez des templates pour vos gardes récurrentes\n• Personnalisez vos actions rapides selon vos besoins\n• Exportez régulièrement vos données par sécurité\n• Utilisez le mode sombre pour économiser la batterie",
        madeWithLove: "Fait avec ❤️ pour les soignants",
        copyright: "© 2025 PlanIDE",
        
        // Emoji picker
        chooseEmoji: "Choisir un emoji",
        
        // Alerts & confirmations
        enterName: "⚠️ Veuillez entrer votre nom",
        enterSchedule: "⚠️ Veuillez renseigner les horaires",
        createOneSector: "⚠️ Veuillez créer au moins un secteur avec des chambres",
        profileUpdated: "✅ Profil mis à jour !",
        onlyOneProfile: "Vous n'avez qu'un seul profil. Créez-en un nouveau depuis les paramètres !",
        noCareToSave: "⚠️ Aucun soin à sauvegarder. Ajoutez des soins avant de créer un template.",
        enterTemplateName: "⚠️ Veuillez entrer un nom pour le template",
        templateSaved: "✅ Template sauvegardé !",
        loadTemplateConfirm: "Charger le template",
        replaceCurrentCares: "?\n\nCela remplacera les soins actuels.",
        templateLoaded: "✅ Template chargé !",
        deleteTemplateConfirm: "Supprimer le template",
        enterCareDescription: "Veuillez entrer une description du soin",
        selectOneRoom: "Veuillez sélectionner au moins une chambre",
        careAddedToRooms: "✅ Soin ajouté à",
        roomsText: "chambre(s) !",
        noCareToDelete: "Aucun soin à supprimer pour cette chambre !",
        deleteRoomCares: "Supprimer tous les soins de la chambre",
        deleteAllConfirm: "⚠️ Supprimer TOUS les soins de TOUTES les chambres ?",
        dataImported: "✅ Données importées avec succès !",
        importError: "❌ Erreur lors de l'importation du fichier",
        
        // Overview
        overviewTitle: "📊 Vue d'ensemble - Tous les soins",
        noCareScheduledGlobal: "Aucun soin programmé"
    },
    
    en: {
        // Header
        appSubtitle: "Nursing Care Planning",
        
        // Profile creation
        welcomeTitle: "👋 Welcome to PlanIDE!",
        createProfileSubtitle: "Let's create your profile to customize your experience.",
        clickToChooseEmoji: "Click to choose an emoji",
        yourName: "Your name",
        namePlaceholder: "E.g.: John Smith",
        yourRole: "Your role",
        usualService: "Usual service (optional)",
        servicePlaceholder: "E.g.: Medicine, Surgery...",
        createProfile: "✅ Create my profile",
        
        // Roles
        roles: {
            nurse: "Nurse",
            nurseDE: "Registered Nurse",
            nursingAssistant: "Nursing Assistant",
            nightNurse: "Night Nurse",
            coordinatorNurse: "Nurse Coordinator",
            other: "Other"
        },
        
        // Burger menu
        myAccount: "MY ACCOUNT",
        myProfile: "My profile",
        switchProfile: "Switch profile",
        organization: "ORGANIZATION",
        myTemplates: "My templates",
        saveAsTemplate: "Save as template",
        customization: "CUSTOMIZATION",
        themesAndColors: "Themes and colors",
        darkMode: "Dark mode",
        language: "Language",
        settings: "SETTINGS",
        settingsMenu: "Settings",
        statistics: "Statistics",
        exportData: "Export my data",
        about: "ABOUT",
        aboutPlanIDE: "About PlanIDE",
        
        // Configuration
        configTitle: "⚙️ PlanIDE Configuration",
        scheduleSettings: "🕐 Shift Schedule",
        startTime: "Start time",
        endTime: "End time",
        intervalBetweenSlots: "Interval between slots (hours)",
        sectorsServices: "🏥 Sectors / Services",
        sectorName: "Sector / Service name",
        sectorPlaceholder: "E.g.: Sector A, Medicine, Emergency...",
        roomsLabel: "Rooms / Beds (comma separated)",
        roomsPlaceholder: "E.g.: 201, 202, 203 or A1, A2, A3",
        addSector: "➕ Add sector",
        deleteSector: "🗑️ Delete this sector",
        cancel: "Cancel",
        save: "✅ Save",
        
        // Main interface
        addCare: "➕ Add care",
        completeAll: "✓ Complete all",
        deleteRoom: "🗑️ Delete room",
        deleteAll: "⚠️ Delete all",
        saveBtn: "💾 Save",
        loadBtn: "📂 Load",
        
        // Quick actions
        quickActions: "⚡ Quick actions",
        quickActionsList: {
            vitalSigns: "Vital signs",
            protectionChange: "Protection change",
            antibiotics: "Antibiotics",
            bloodTest: "Blood test",
            perfusion: "IV infusion",
            temperatureMonitoring: "Temperature monitoring"
        },
        
        // Stats
        totalCares: "Total cares",
        completed: "Completed",
        pending: "Pending",
        
        // Timeline
        cares: "care(s)",
        noCareScheduled: "No care scheduled for this room",
        
        // Modal add care
        addCareTitle: "Add care",
        time: "Time",
        selectMultipleRooms: "Select multiple rooms",
        room: "Room",
        rooms: "Rooms",
        selectAll: "✓ Select all",
        careDescription: "Care description",
        careDescriptionPlaceholder: "E.g.: Vital signs, medication, hygiene, monitoring...",
        add: "Add",
        
        // Templates
        templatesTitle: "📋 My Templates",
        saveTemplateTitle: "💾 Save as template",
        templateName: "Template name",
        templateNamePlaceholder: "E.g.: Night shift standard, Tuesday morning...",
        category: "Category",
        categories: {
            personal: "📁 Personal",
            frequent: "⭐ Frequent",
            emergency: "🚨 Emergency"
        },
        description: "Description (optional)",
        descriptionPlaceholder: "Notes about this template...",
        noTemplates: "No saved templates",
        createFirstTemplate: "Create your first template from the burger menu!",
        loadTemplate: "📂 Load",
        deleteTemplate: "🗑️",
        close: "Close",
        
        // Themes
        themesTitle: "🎨 Themes and colors",
        predefinedThemes: "Predefined themes",
        themeNames: {
            ocean: "Ocean",
            lavender: "Lavender",
            forest: "Forest",
            sunset: "Sunset",
            night: "Night",
            rose: "Rose"
        },
        displayMode: "Display mode",
        lightMode: "☀️ Light mode",
        darkModeBtn: "🌙 Dark mode",
        
        // Profile settings
        profileSettingsTitle: "👤 My profile",
        clickToChange: "Click to change",
        customQuickActions: "⚡ Custom quick actions",
        customQuickActionsDesc: "Customize the care that appears in your quick actions",
        
        // Statistics
        statsTitle: "📊 Statistics",
        today: "📈 Today",
        thisWeek: "📅 This week",
        personalRecords: "🏆 Personal records",
        
        // About
        aboutTitle: "ℹ️ About PlanIDE",
        version: "PlanIDE v3.1",
        appDescription: "Nursing care planning application",
        features: "✨ Features",
        featuresList: {
            multiProfile: "Multi-profile management",
            templates: "Reusable templates",
            themes: "Theme customization",
            offline: "Offline mode",
            exportImport: "Export/Import data",
            stats: "Personal statistics"
        },
        usageTips: "💡 Usage tips",
        tips: "• Create templates for your recurring shifts\n• Customize your quick actions as needed\n• Export your data regularly for safety\n• Use dark mode to save battery",
        madeWithLove: "Made with ❤️ for healthcare workers",
        copyright: "© 2025 PlanIDE",
        
        // Emoji picker
        chooseEmoji: "Choose an emoji",
        
        // Alerts & confirmations
        enterName: "⚠️ Please enter your name",
        enterSchedule: "⚠️ Please enter the schedule",
        createOneSector: "⚠️ Please create at least one sector with rooms",
        profileUpdated: "✅ Profile updated!",
        onlyOneProfile: "You only have one profile. Create a new one from settings!",
        noCareToSave: "⚠️ No care to save. Add some care before creating a template.",
        enterTemplateName: "⚠️ Please enter a template name",
        templateSaved: "✅ Template saved!",
        loadTemplateConfirm: "Load template",
        replaceCurrentCares: "?\n\nThis will replace current cares.",
        templateLoaded: "✅ Template loaded!",
        deleteTemplateConfirm: "Delete template",
        enterCareDescription: "Please enter a care description",
        selectOneRoom: "Please select at least one room",
        careAddedToRooms: "✅ Care added to",
        roomsText: "room(s)!",
        noCareToDelete: "No care to delete for this room!",
        deleteRoomCares: "Delete all cares for room",
        deleteAllConfirm: "⚠️ Delete ALL cares from ALL rooms?",
        dataImported: "✅ Data imported successfully!",
        importError: "❌ Error importing file",
        
        // Overview
        overviewTitle: "📊 Overview - All cares",
        noCareScheduledGlobal: "No care scheduled"
    }
};

// ===== GESTION DE LA LANGUE =====
let currentLanguage = 'fr';

function detectLanguage() {
    const saved = localStorage.getItem('planide_language');
    if (saved) {
        return saved;
    }
    
    // Détection automatique
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('en')) {
        return 'en';
    }
    return 'fr';
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('planide_language', lang);
}

function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key; // Retourne la clé si traduction non trouvée
        }
    }
    
    return value || key;
}

// Export pour utilisation dans app_v3.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, detectLanguage, setLanguage, t };
}
