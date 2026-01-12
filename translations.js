// --- Translations ---
const translations = {
    en: {
        // Core UI elements
        appTitle: "EasyBin",
        languageLabel: "Language:",
        countryLabel: "Region:",
        scanButtonText: "Identify Item",
        historyButtonText: "Scan History",
        
        // Instructions
        instructionsTitle: "How to use:",
        instructionsText: "Point your camera at an item, then tap \"Identify Item\". The app will show you the correct bin.",
        
        // Error messages
        errorCameraNotFound: "Camera not found. Please ensure a camera is connected and enabled.",
        errorCameraDenied: "Camera access denied. Please grant permission in your browser settings.",
        errorCameraInit: "Failed to initialize camera. Please try again.",
        errorAIResponse: "Received an unclear response from AI. Please try again.",
        errorAIStructure: "Received invalid response structure or empty content from AI.",
        errorAIAnalyze: "Error analyzing item:",
        errorUnknownAI: "Unknown AI error. Please try again.",
        errorCapture: "Could not capture image or prepare AI call. Please try again.",
        errorAINoItemFound: "Could not clearly identify an item.",
        binNameError: "Identification Failed",
        instructionError: "Please try again with a clearer image or different angle.",
        instructionCheckLocal: "Check local guidelines for specific rules.",
        
        // Result elements
        aiAnalysisPrefix: "AI Analysis:",
        aiConfidencePrefix: "Confidence:",
        aiSecondaryGuessPrefix: "Also consider:",
        aiPositionPrefix: "Detected at:",
        aiContaminatedWarning: "Item appears contaminated. May need to go in General Waste.",
        feedbackCorrect: "Correct",
        feedbackIncorrect: "Incorrect",
        multipleItemsDetected: "Multiple items detected. Showing details for the primary item.",
        historyModalTitle: "Scan History",
        historyEmptyMessage: "No scans recorded yet.",
        
        // Generic Bin Names (Fallbacks)
        binRecycling: "Recycling Bin",
        binOrganic: "Organics / Compost",
        binHazardous: "Hazardous Waste",
        binGeneral: "Trash / Landfill",
        
        // Generic Material Names
        materialRecyclable: "Recyclable Material",
        materialOrganic: "Organic Material",
        materialHazardous: "Hazardous Material",
        materialMixed: "Mixed/Non-Recyclable",
        materialPaper: "Paper/Cardboard",
        materialPlastic: "Plastic",
        materialGlass: "Glass",
        materialMetal: "Metal",
        
        // Position translations
        positions: {
            "center": "center",
            "top": "top",
            "bottom": "bottom",
            "left": "left",
            "right": "right",
            "top-left": "top-left",
            "top-right": "top-right",
            "bottom-left": "bottom-left",
            "bottom-right": "bottom-right"
        },
        
        // Feedback question
        feedbackQuestion: "Was this helpful?",
        
        // US Specific
        binNameRecyclingUS: "Recycling Bin",
        binNameOrganicUS: "Organics / Compost Bin",
        binNameHazardousUS: "Hazardous Waste Drop-off",
        binNameGeneralUS: "Trash / Landfill Bin",
        instructionRecyclingUS: "Place in the BLUE Recycling Bin. Accepts clean paper, cardboard, plastic bottles/jugs, metal cans, glass (check local rules).",
        instructionOrganicUS: "Place in the GREEN Organics Bin. Accepts food scraps, yard waste.",
        instructionHazardousUS: "HAZARDOUS WASTE: DO NOT put in trash/recycling. Take to a designated {binName}.",
        instructionGeneralUS: "Place in the BLACK/GRAY Trash Bin (Landfill).",
        instructionContaminatedRecyclableUS: "Item appears contaminated. Place in the {binName} instead.",
    },
    
    // German translations
    de: {
        // Core UI elements
        appTitle: "Intelligenter Müllsortierer",
        languageLabel: "Sprache:",
        countryLabel: "Region:",
        scanButtonText: "Gegenstand erkennen",
        historyButtonText: "Verlauf",
        
        // Instructions
        instructionsTitle: "Anleitung:",
        instructionsText: "Richten Sie Ihre Kamera auf einen Gegenstand und tippen Sie auf \"Gegenstand erkennen\". Die App zeigt Ihnen den richtigen Behälter.",
        
        // Error messages
        errorCameraNotFound: "Kamera nicht gefunden. Stellen Sie sicher, dass eine Kamera angeschlossen und aktiviert ist.",
        errorCameraDenied: "Kamerazugriff verweigert. Bitte erteilen Sie die Berechtigung in Ihren Browsereinstellungen.",
        errorCameraInit: "Kamera konnte nicht initialisiert werden. Bitte versuchen Sie es erneut.",
        errorAIResponse: "Unklare Antwort von der KI erhalten. Bitte versuchen Sie es erneut.",
        errorAIStructure: "Ungültige Antwortstruktur oder leerer Inhalt von der KI.",
        errorAIAnalyze: "Fehler bei der Analyse des Gegenstands:",
        errorUnknownAI: "Unbekannter KI-Fehler. Bitte versuchen Sie es erneut.",
        errorCapture: "Bild konnte nicht aufgenommen werden. Bitte versuchen Sie es erneut.",
        errorAINoItemFound: "Konnte keinen Gegenstand eindeutig erkennen.",
        binNameError: "Erkennung fehlgeschlagen",
        instructionError: "Bitte versuchen Sie es mit einem klareren Bild oder einem anderen Winkel erneut.",
        instructionCheckLocal: "Prüfen Sie lokale Richtlinien für spezifische Regeln.",
        
        // Result elements
        aiAnalysisPrefix: "KI-Analyse:",
        aiConfidencePrefix: "Konfidenz:",
        aiSecondaryGuessPrefix: "Auch zu beachten:",
        aiPositionPrefix: "Erkannt bei:",
        aiContaminatedWarning: "Element scheint verschmutzt zu sein. Muss möglicherweise in den Restmüll.",
        feedbackQuestion: "War das hilfreich?",
        feedbackCorrect: "Korrekt",
        feedbackIncorrect: "Falsch",
        multipleItemsDetected: "Mehrere Gegenstände erkannt. Details für den Hauptgegenstand werden angezeigt.",
        historyModalTitle: "Scan-Verlauf",
        historyEmptyMessage: "Noch keine Scans aufgezeichnet.",
        
        // Generic Bin Names (Fallbacks)
        binRecycling: "Wertstofftonne",
        binOrganic: "Biotonne",
        binHazardous: "Sondermüll",
        binGeneral: "Restmüll",
        
        // Generic Material Names
        materialRecyclable: "Recycelbares Material",
        materialOrganic: "Organisches Material",
        materialHazardous: "Gefahrstoff",
        materialMixed: "Gemischt/Nicht-recycelbar",
        materialPaper: "Papier/Karton",
        materialPlastic: "Kunststoff",
        materialGlass: "Glas",
        materialMetal: "Metall",
        
        // Position translations
        positions: {
            "center": "Mitte",
            "top": "oben",
            "bottom": "unten",
            "left": "links",
            "right": "rechts",
            "top-left": "oben-links",
            "top-right": "oben-rechts",
            "bottom-left": "unten-links",
            "bottom-right": "unten-rechts"
        },
        
        // German Specific Bins
        binNameRecyclingDE_Blue: "Blaue Tonne (Papier)",
        binNameRecyclingDE_Yellow: "Gelbe Tonne (Leichtverpackung)",
        binNameOrganicDE: "Biotonne",
        binNameGeneralDE: "Restmülltonne",
        binNameHazardousDE: "Sondermüll-Sammelstelle",
        
        // German Specific Instructions
        instructionRecyclingDE_Blue: "In die BLAUE Tonne für Papier und Karton entsorgen.",
        instructionRecyclingDE_Yellow: "In die GELBE Tonne für Verpackungen aus Kunststoff, Metall oder Verbundstoffen entsorgen.",
        instructionOrganicDE: "In die BRAUNE Biotonne für organische Abfälle entsorgen.",
        instructionGeneralDE: "In die SCHWARZE/GRAUE Restmülltonne entsorgen.",
        instructionHazardousDE: "SONDERMÜLL: NICHT in den normalen Müll. Zur Sondermüll-Sammelstelle bringen.",
        instructionContaminatedRecyclableDE: "Gegenstand scheint verschmutzt zu sein. Entsorgen Sie ihn in der {binName}."
    },
    
    // Italian translations
    it: {
        // Core UI elements
        appTitle: "Separatore Rifiuti Intelligente",
        languageLabel: "Lingua:",
        countryLabel: "Regione:",
        scanButtonText: "Identifica Oggetto",
        historyButtonText: "Cronologia",
        
        // Instructions
        instructionsTitle: "Come usare:",
        instructionsText: "Punta la fotocamera verso un oggetto, poi tocca \"Identifica Oggetto\". L'app ti mostrerà il bidone corretto.",
        
        // Error messages
        errorCameraNotFound: "Fotocamera non trovata. Assicurati che sia collegata e abilitata.",
        errorCameraDenied: "Accesso alla fotocamera negato. Concedi l'autorizzazione nelle impostazioni del browser.",
        errorCameraInit: "Inizializzazione fotocamera fallita. Riprova.",
        errorAIResponse: "Risposta dall'IA non chiara. Riprova.",
        errorAIStructure: "Struttura di risposta dell'IA non valida o contenuto vuoto.",
        errorAIAnalyze: "Errore nell'analisi dell'oggetto:",
        errorUnknownAI: "Errore IA sconosciuto. Riprova.",
        errorCapture: "Impossibile catturare l'immagine. Riprova.",
        errorAINoItemFound: "Impossibile identificare chiaramente un oggetto.",
        binNameError: "Identificazione Fallita",
        instructionError: "Riprova con un'immagine più chiara o da un'angolazione diversa.",
        instructionCheckLocal: "Controlla le linee guida locali per regole specifiche.",
        
        // Result elements
        aiAnalysisPrefix: "Analisi IA:",
        aiConfidencePrefix: "Confidenza:",
        aiSecondaryGuessPrefix: "Considera anche:",
        aiPositionPrefix: "Rilevato a:",
        aiContaminatedWarning: "L'oggetto sembra contaminato. Potrebbe dover andare nei rifiuti generici.",
        feedbackQuestion: "È stato utile?",
        feedbackCorrect: "Corretto",
        feedbackIncorrect: "Errato",
        multipleItemsDetected: "Rilevati più oggetti. Mostrati i dettagli per l'oggetto principale.",
        historyModalTitle: "Cronologia Scansioni",
        historyEmptyMessage: "Nessuna scansione registrata finora.",
        
        // Generic Bin Names (Fallbacks)
        binRecycling: "Bidone Riciclaggio",
        binOrganic: "Bidone Organico",
        binHazardous: "Rifiuti Pericolosi",
        binGeneral: "Rifiuti Indifferenziati",
        
        // Generic Material Names
        materialRecyclable: "Materiale Riciclabile",
        materialOrganic: "Materiale Organico",
        materialHazardous: "Materiale Pericoloso",
        materialMixed: "Misto/Non-riciclabile",
        materialPaper: "Carta/Cartone",
        materialPlastic: "Plastica",
        materialGlass: "Vetro",
        materialMetal: "Metallo",
        
        // Position translations
        positions: {
            "center": "centro",
            "top": "alto",
            "bottom": "basso",
            "left": "sinistra",
            "right": "destra",
            "top-left": "alto-sinistra",
            "top-right": "alto-destra",
            "bottom-left": "basso-sinistra",
            "bottom-right": "basso-destra"
        },
        
        // Italian Specific Bins
        binNameRecyclingIT_Blue: "Bidone Blu (Carta)",
        binNameRecyclingIT_Green: "Bidone Verde (Vetro)",
        binNameRecyclingIT_Yellow: "Bidone Giallo (Plastica/Metallo)",
        binNameOrganicIT: "Bidone Marrone (Organico)",
        binNameGeneralIT: "Bidone Grigio (Indifferenziata)",
        binNameHazardousIT: "Centro di Raccolta Rifiuti Pericolosi",
        
        // Italian Specific Instructions
        instructionRecyclingIT_Blue: "Getta nel Bidone BLU per carta e cartone.",
        instructionRecyclingIT_Green: "Getta nel Bidone VERDE per il vetro.",
        instructionRecyclingIT_Yellow: "Getta nel Bidone GIALLO per plastica e metallo.",
        instructionOrganicIT: "Getta nel Bidone MARRONE per rifiuti organici.",
        instructionGeneralIT: "Getta nel Bidone GRIGIO per rifiuti indifferenziati.",
        instructionHazardousIT: "RIFIUTO PERICOLOSO: NON gettare nei normali rifiuti. Porta al centro di raccolta dedicato.",
        instructionContaminatedRecyclableIT: "L'oggetto sembra contaminato. Gettalo nel {binName}."
    },
    
    // Brazilian Portuguese translations
    pt: {
        // Core UI elements
        appTitle: "Separador Inteligente de Lixo",
        languageLabel: "Idioma:",
        countryLabel: "Região:",
        scanButtonText: "Identificar Item",
        historyButtonText: "Histórico",
        
        // Instructions
        instructionsTitle: "Como usar:",
        instructionsText: "Aponte sua câmera para um item e toque em \"Identificar Item\". O app mostrará a lixeira correta.",
        
        // Error messages
        errorCameraNotFound: "Câmera não encontrada. Verifique se uma câmera está conectada e habilitada.",
        errorCameraDenied: "Acesso à câmera negado. Por favor, conceda permissão nas configurações do seu navegador.",
        errorCameraInit: "Falha ao inicializar a câmera. Por favor, tente novamente.",
        errorAIResponse: "Resposta da IA não foi clara. Por favor, tente novamente.",
        errorAIStructure: "Estrutura de resposta da IA inválida ou conteúdo vazio.",
        errorAIAnalyze: "Erro ao analisar item:",
        errorUnknownAI: "Erro desconhecido da IA. Por favor, tente novamente.",
        errorCapture: "Não foi possível capturar a imagem. Por favor, tente novamente.",
        errorAINoItemFound: "Não foi possível identificar claramente um item.",
        binNameError: "Falha na Identificação",
        instructionError: "Por favor, tente novamente com uma imagem mais clara ou ângulo diferente.",
        instructionCheckLocal: "Verifique as diretrizes locais para regras específicas.",
        
        // Result elements
        aiAnalysisPrefix: "Análise da IA:",
        aiConfidencePrefix: "Confiança:",
        aiSecondaryGuessPrefix: "Considere também:",
        aiPositionPrefix: "Detectado em:",
        aiContaminatedWarning: "Item parece contaminado. Pode precisar ir para Lixo Comum.",
        feedbackQuestion: "Isso foi útil?",
        feedbackCorrect: "Correto",
        feedbackIncorrect: "Incorreto",
        multipleItemsDetected: "Múltiplos itens detectados. Mostrando detalhes para o item principal.",
        historyModalTitle: "Histórico de Análises",
        historyEmptyMessage: "Nenhuma análise registrada ainda.",
        
        // Generic Bin Names (Fallbacks)
        binRecycling: "Lixeira de Reciclagem",
        binOrganic: "Orgânicos / Compostagem",
        binHazardous: "Resíduos Perigosos",
        binGeneral: "Lixo Comum / Aterro",
        
        // Generic Material Names
        materialRecyclable: "Material Reciclável",
        materialOrganic: "Material Orgânico",
        materialHazardous: "Material Perigoso",
        materialMixed: "Misto/Não-Reciclável",
        materialPaper: "Papel/Papelão",
        materialPlastic: "Plástico",
        materialGlass: "Vidro",
        materialMetal: "Metal",
        
        // Position translations
        positions: {
            "center": "centro",
            "top": "topo",
            "bottom": "parte inferior",
            "left": "esquerda",
            "right": "direita",
            "top-left": "topo-esquerda",
            "top-right": "topo-direita",
            "bottom-left": "inferior-esquerda",
            "bottom-right": "inferior-direita"
        },
        
        // Brazil Specific Bins
        binNameRecyclingBR_Paper: "Lixeira Azul (Papel)",
        binNameRecyclingBR_Plastic: "Lixeira Vermelha (Plástico)",
        binNameRecyclingBR_Glass: "Lixeira Verde (Vidro)",
        binNameRecyclingBR_Metal: "Lixeira Amarela (Metal)",
        binNameOrganicBR: "Lixeira Marrom (Orgânicos)",
        binNameGeneralBR: "Lixeira Cinza (Lixo Comum)",
        binNameHazardousBR: "Ponto de Coleta de Resíduos Perigosos",
        
        // Brazil Specific Instructions
        instructionRecyclingBR_Paper: "Coloque na Lixeira Azul para papel e papelão.",
        instructionRecyclingBR_Plastic: "Coloque na Lixeira Vermelha para plásticos.",
        instructionRecyclingBR_Glass: "Coloque na Lixeira Verde para vidros.",
        instructionRecyclingBR_Metal: "Coloque na Lixeira Amarela para metais.",
        instructionOrganicBR: "Coloque na Lixeira Marrom para resíduos orgânicos.",
        instructionGeneralBR: "Coloque na Lixeira Cinza para lixo comum.",
        instructionHazardousBR: "NÃO descarte no lixo comum. Leve para um ponto de coleta de resíduos perigosos.",
        instructionContaminatedRecyclableBR: "Este item parece contaminado. Coloque na {binName} em vez da reciclagem."
    },
    
    // Brazil region-specific translations (for bin names in Brazilian Portuguese)
    br: {
        // Brazil Specific Bins - Regional names
        binNameRecyclingBR_Paper: "Lixeira Azul (Papel)",
        binNameRecyclingBR_Plastic: "Lixeira Vermelha (Plástico)",
        binNameRecyclingBR_Glass: "Lixeira Verde (Vidro)",
        binNameRecyclingBR_Metal: "Lixeira Amarela (Metal)",
        binNameOrganicBR: "Lixeira Marrom (Orgânicos)",
        binNameGeneralBR: "Lixeira Cinza (Lixo Comum)",
        binNameHazardousBR: "Ponto de Coleta de Resíduos Perigosos",
        
        // Brazil Specific Instructions (in Portuguese)
        instructionRecyclingBR_Paper: "Coloque na Lixeira Azul para papel e papelão.",
        instructionRecyclingBR_Plastic: "Coloque na Lixeira Vermelha para plásticos.",
        instructionRecyclingBR_Glass: "Coloque na Lixeira Verde para vidros.",
        instructionRecyclingBR_Metal: "Coloque na Lixeira Amarela para metais.",
        instructionOrganicBR: "Coloque na Lixeira Marrom para resíduos orgânicos.",
        instructionGeneralBR: "Coloque na Lixeira Cinza para lixo comum.",
        instructionHazardousBR: "NÃO descarte no lixo comum. Leve para um ponto de coleta de resíduos perigosos.",
        instructionContaminatedRecyclableBR: "Este item parece contaminado. Coloque na {binName} em vez da reciclagem."
    }
};
