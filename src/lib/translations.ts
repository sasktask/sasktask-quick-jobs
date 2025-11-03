export type Language = 'en' | 'es' | 'fr' | 'de';

export const translations = {
  en: {
    // Navbar
    browseTasks: "Browse Tasks",
    findTaskers: "Find Taskers",
    becomeTasker: "Become a Tasker",
    dashboard: "Dashboard",
    bookings: "Bookings",
    profile: "Profile",
    getVerified: "Get Verified",
    signOut: "Sign Out",
    signIn: "Sign In",
    getStarted: "Get Started",
    
    // Hero Section
    heroTitle: "Get Things Done",
    heroSubtitle: "The Easy Way",
    heroDescription: "Connect with verified local professionals for any task. From snow removal to home repairs, find trusted help in your Saskatchewan community.",
    
    // Categories
    popularCategories: "Popular Categories",
    categoriesSubtitle: "Whatever the task, we have someone ready to help",
    snowRemoval: "Snow Removal",
    cleaning: "Cleaning",
    moving: "Moving",
    delivery: "Delivery",
    handyman: "Handyman",
    gardening: "Gardening",
    petCare: "Pet Care",
    painting: "Painting",
    
    // Common
    menu: "Menu",
    notifications: "Notifications",
    noNotifications: "No notifications yet",
    markAllAsRead: "Mark all as read",
  },
  es: {
    // Navbar
    browseTasks: "Buscar Tareas",
    findTaskers: "Encontrar Trabajadores",
    becomeTasker: "Conviértete en Trabajador",
    dashboard: "Panel",
    bookings: "Reservas",
    profile: "Perfil",
    getVerified: "Verificarse",
    signOut: "Cerrar Sesión",
    signIn: "Iniciar Sesión",
    getStarted: "Comenzar",
    
    // Hero Section
    heroTitle: "Haz las Cosas",
    heroSubtitle: "De Manera Fácil",
    heroDescription: "Conéctate con profesionales locales verificados para cualquier tarea. Desde remoción de nieve hasta reparaciones del hogar, encuentra ayuda confiable en tu comunidad de Saskatchewan.",
    
    // Categories
    popularCategories: "Categorías Populares",
    categoriesSubtitle: "Sea cual sea la tarea, tenemos a alguien listo para ayudar",
    snowRemoval: "Remoción de Nieve",
    cleaning: "Limpieza",
    moving: "Mudanza",
    delivery: "Entrega",
    handyman: "Manitas",
    gardening: "Jardinería",
    petCare: "Cuidado de Mascotas",
    painting: "Pintura",
    
    // Common
    menu: "Menú",
    notifications: "Notificaciones",
    noNotifications: "No hay notificaciones",
    markAllAsRead: "Marcar todo como leído",
  },
  fr: {
    // Navbar
    browseTasks: "Parcourir les Tâches",
    findTaskers: "Trouver des Travailleurs",
    becomeTasker: "Devenir Travailleur",
    dashboard: "Tableau de Bord",
    bookings: "Réservations",
    profile: "Profil",
    getVerified: "Se Faire Vérifier",
    signOut: "Se Déconnecter",
    signIn: "Se Connecter",
    getStarted: "Commencer",
    
    // Hero Section
    heroTitle: "Faites les Choses",
    heroSubtitle: "Facilement",
    heroDescription: "Connectez-vous avec des professionnels locaux vérifiés pour toute tâche. Du déneigement aux réparations domiciliaires, trouvez de l'aide fiable dans votre communauté de la Saskatchewan.",
    
    // Categories
    popularCategories: "Catégories Populaires",
    categoriesSubtitle: "Quelle que soit la tâche, nous avons quelqu'un prêt à aider",
    snowRemoval: "Déneigement",
    cleaning: "Nettoyage",
    moving: "Déménagement",
    delivery: "Livraison",
    handyman: "Bricoleur",
    gardening: "Jardinage",
    petCare: "Soins aux Animaux",
    painting: "Peinture",
    
    // Common
    menu: "Menu",
    notifications: "Notifications",
    noNotifications: "Aucune notification",
    markAllAsRead: "Tout marquer comme lu",
  },
  de: {
    // Navbar
    browseTasks: "Aufgaben Durchsuchen",
    findTaskers: "Arbeiter Finden",
    becomeTasker: "Arbeiter Werden",
    dashboard: "Dashboard",
    bookings: "Buchungen",
    profile: "Profil",
    getVerified: "Verifizieren",
    signOut: "Abmelden",
    signIn: "Anmelden",
    getStarted: "Loslegen",
    
    // Hero Section
    heroTitle: "Erledigen Sie Dinge",
    heroSubtitle: "Auf Einfache Weise",
    heroDescription: "Verbinden Sie sich mit verifizierten lokalen Fachleuten für jede Aufgabe. Von Schneeräumung bis Hausreparaturen, finden Sie vertrauenswürdige Hilfe in Ihrer Saskatchewan-Gemeinde.",
    
    // Categories
    popularCategories: "Beliebte Kategorien",
    categoriesSubtitle: "Egal welche Aufgabe, wir haben jemanden bereit zu helfen",
    snowRemoval: "Schneeräumung",
    cleaning: "Reinigung",
    moving: "Umzug",
    delivery: "Lieferung",
    handyman: "Handwerker",
    gardening: "Gartenarbeit",
    petCare: "Tierpflege",
    painting: "Malerei",
    
    // Common
    menu: "Menü",
    notifications: "Benachrichtigungen",
    noNotifications: "Keine Benachrichtigungen",
    markAllAsRead: "Alle als gelesen markieren",
  },
};

export const getTranslation = (lang: Language, key: keyof typeof translations.en): string => {
  return translations[lang]?.[key] || translations.en[key];
};
