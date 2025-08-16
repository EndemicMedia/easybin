// --- DOM Elements ---
const video = document.getElementById('camera');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const scanButton = document.getElementById('scan-button');
const outputDiv = document.getElementById('output');
const resultCard = document.getElementById('result-card');
const binHeader = document.getElementById('bin-header');
const itemName = document.getElementById('item-name');
const itemDescription = document.getElementById('item-description');
const binInstructions = document.getElementById('bin-instructions');
const countryNote = document.getElementById('country-note');
const languageSelect = document.getElementById('language-select');
const countrySelect = document.getElementById('country-select');
const historyModal = document.getElementById('history-modal');
const historyButton = document.getElementById('history-button');
const detailsHr = document.getElementById('details-hr');
const retakeButton = document.getElementById('retake-button');
  
  // --- App State ---
let userCountry = 'us';
let currentLanguage = 'en';
let lastAIResponse = null;
let lastResultItems = null;
let lastImageDataUrl = null;
  
  // --- UI Update Functions ---
  function showSpinner() {
      outputDiv.innerHTML = '<div class="spinner"></div>';
      // Hide welcome state and show result content when processing
      const welcomeState = document.getElementById('welcome-state');
      const resultContent = document.getElementById('result-content');
      if (welcomeState) welcomeState.classList.add('hidden');
      if (resultContent) resultContent.classList.remove('hidden');
      resultCard.classList.remove('hidden'); // Ensure card is visible
      scanButton.disabled = true;
      updateAppStatus('Analyzing image...');
  }
  
  function updateAppStatus(message, type = 'info') {
      const statusElement = document.getElementById('app-status');
      if (statusElement) {
          let icon = 'fas fa-leaf text-green-500';
          if (type === 'loading') icon = 'fas fa-spinner fa-spin text-blue-500';
          else if (type === 'error') icon = 'fas fa-exclamation-triangle text-red-500';
          else if (type === 'success') icon = 'fas fa-check-circle text-green-500';
          
          statusElement.innerHTML = `<i class="${icon} mr-1" aria-hidden="true"></i>${message}`;
      }
  }
  
  function hideSpinner() {
      outputDiv.innerHTML = `<div id="app-status" class="text-center text-sm text-gray-500 py-2">
                              <i class="fas fa-leaf text-green-500 mr-1" aria-hidden="true"></i>
                              Ready to scan
                            </div>`;
      scanButton.disabled = false; // Re-enable button after attempt
      updateAppStatus('Ready to scan', 'info');
  }

  function showCameraLoading() {
      const cameraLoading = document.getElementById('camera-loading');
      if (cameraLoading) {
          cameraLoading.style.display = 'flex';
      }
  }

  function hideCameraLoading() {
      const cameraLoading = document.getElementById('camera-loading');
      if (cameraLoading) {
          cameraLoading.style.display = 'none';
      }
  }
  
  function displayError(messageKey, detail = '') {
      // This function displays errors *outside* the result card (e.g., camera failure)
      const lang = currentLanguage;
      const message = translations[lang]?.[messageKey] || translations.en[messageKey] || messageKey;
      outputDiv.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                              <strong class="font-bold">Error:</strong>
                              <span class="block sm:inline">${message} ${detail}</span>
                            </div>
                            <div id="app-status" class="text-center text-sm text-gray-500 py-2 mt-2">
                              <i class="fas fa-exclamation-triangle text-red-500 mr-1" aria-hidden="true"></i>
                              Error occurred
                            </div>`;
      // Don't hide result card on error - keep welcome state visible
      const welcomeState = document.getElementById('welcome-state');
      const resultContent = document.getElementById('result-content');
      if (welcomeState) welcomeState.classList.remove('hidden');
      if (resultContent) resultContent.classList.add('hidden');
      resultCard.classList.remove('hidden'); // Keep card visible to show welcome state
      scanButton.disabled = false;
      updateAppStatus('Error occurred', 'error');
  }
  
  // Helper to generate bin details
  function generateBinDetails(binType, material, country) {
      // Default values
      let binColorClassKey = 'default-general-waste';
      let regionalBinName = 'General Waste'; // Fallback name in English
      let uiBinName = 'General Waste'; // Fallback name in English
      let binIconClass = 'fa-trash-alt';
      let headerMaterialSummary = 'Mixed/Non-Recyclable'; // Fallback name in English
      let binNameKey = 'binGeneral'; // Key for translation lookup
      let specificInstructionKey = 'instructionGeneral'; // Key for specific instruction text
  
      const t_region_en = translations.en; // Use English base for structure
      const t_ui = translations[currentLanguage] || translations.en;
      const t_region_specific = translations[country] || translations.en; // Translations for the *selected region*
  
      // Determine Material Summary (in UI language) - Use UI language keys first
      const materialLower = material ? material.toLowerCase() : '';
      if (materialLower.includes('paper') || materialLower.includes('cardboard')) {
          headerMaterialSummary = t_ui.materialPaper || t_region_en.materialPaper;
      } else if (materialLower.includes('glass')) {
          headerMaterialSummary = t_ui.materialGlass || t_region_en.materialGlass;
      } else if (materialLower.includes('plastic') || materialLower.includes('pet')) {
          headerMaterialSummary = t_ui.materialPlastic || t_region_en.materialPlastic;
      } else if (materialLower.includes('metal') || materialLower.includes('aluminum') || materialLower.includes('steel')) {
          headerMaterialSummary = t_ui.materialMetal || t_region_en.materialMetal;
      } else if (materialLower.includes('food') || materialLower.includes('organic')) {
          headerMaterialSummary = t_ui.materialOrganic || t_region_en.materialOrganic;
      } else if (materialLower.includes('hazard') || materialLower.includes('toxic') || binType === 'hazardous') {
          headerMaterialSummary = t_ui.materialHazardous || t_region_en.materialHazardous;
      } else if (binType === 'organic') {
          headerMaterialSummary = t_ui.materialOrganic || t_region_en.materialOrganic;
      } else if (binType === 'recyclable') {
          // If recyclable but no specific material, use generic term
          headerMaterialSummary = t_ui.materialRecyclable || t_region_en.materialRecyclable;
      } else { // General waste or unspecified
          headerMaterialSummary = t_ui.materialMixed || t_region_en.materialMixed;
      }
  
      // Set bin class, name, icon, and instruction key based on bin type, material hint, and country
      if (country === 'br') { // Brazil Specific Logic
          switch(binType) {
              case 'recyclable':
                  if (materialLower.includes('paper') || materialLower.includes('cardboard')) {
                      binColorClassKey = 'br-recyclable-paper';
                      binNameKey = 'binNameRecyclingBR_Paper';
                      binIconClass = 'fa-file-alt'; // Paper icon
                      specificInstructionKey = 'instructionRecyclingBR_Paper';
                  } else if (materialLower.includes('plastic') || materialLower.includes('pet')) {
                      binColorClassKey = 'br-recyclable-plastic';
                      binNameKey = 'binNameRecyclingBR_Plastic';
                      binIconClass = 'fa-bottle-water'; // Plastic icon
                      specificInstructionKey = 'instructionRecyclingBR_Plastic';
                  } else if (materialLower.includes('glass')) {
                      binColorClassKey = 'br-recyclable-glass';
                      binNameKey = 'binNameRecyclingBR_Glass';
                      binIconClass = 'fa-wine-bottle'; // Glass icon
                      specificInstructionKey = 'instructionRecyclingBR_Glass';
                  } else if (materialLower.includes('metal') || materialLower.includes('aluminum') || materialLower.includes('steel')) {
                      binColorClassKey = 'br-recyclable-metal';
                      binNameKey = 'binNameRecyclingBR_Metal';
                      binIconClass = 'fa-gear'; // Using gear as fallback for metal
                      specificInstructionKey = 'instructionRecyclingBR_Metal';
                  } else { // Generic recyclable if material unknown/unmatched
                      binColorClassKey = 'default-recyclable'; // Fallback blue
                      binNameKey = 'binRecycling'; // Generic key
                      binIconClass = 'fa-recycle';
                      specificInstructionKey = 'instructionRecycling'; // Use generic instruction
                  }
                  break;
              case 'organic':
                  binColorClassKey = 'br-organic';
                  binNameKey = 'binNameOrganicBR';
                  binIconClass = 'fa-leaf';
                  specificInstructionKey = 'instructionOrganicBR';
                  break;
              case 'hazardous':
                  binColorClassKey = 'br-hazardous';
                  binNameKey = 'binNameHazardousBR';
                  binIconClass = 'fa-triangle-exclamation';
                  specificInstructionKey = 'instructionHazardousBR';
                  break;
              default: // general-waste
                  binColorClassKey = 'br-general-waste';
                  binNameKey = 'binNameGeneralBR';
                  binIconClass = 'fa-trash-alt';
                  specificInstructionKey = 'instructionGeneralBR';
          }
      } else if (country === 'de') { // German Logic (Existing)
          switch(binType) {
              case 'recyclable':
                  if (materialLower.includes('paper') || materialLower.includes('cardboard')) {
                      binColorClassKey = 'de-recyclable-paper';
                      binNameKey = 'binNameRecyclingDE_Blue';
                      binIconClass = 'fa-file-alt';
                      specificInstructionKey = 'instructionRecyclingDE_Blue';
                  } else { // Assume Yellow bin for other recyclables
                      binColorClassKey = 'de-recyclable-yellow';
                      binNameKey = 'binNameRecyclingDE_Yellow';
                      binIconClass = 'fa-recycle';
                      specificInstructionKey = 'instructionRecyclingDE_Yellow';
                  }
                  break;
              case 'organic':
                  binColorClassKey = 'de-organic';
                  binNameKey = 'binNameOrganicDE';
                  binIconClass = 'fa-leaf';
                  specificInstructionKey = 'instructionOrganicDE';
                  break;
              case 'hazardous':
                  binColorClassKey = 'de-hazardous';
                  binNameKey = 'binNameHazardousDE';
                  binIconClass = 'fa-triangle-exclamation';
                  specificInstructionKey = 'instructionHazardousDE';
                  break;
              default: // general-waste
                  binColorClassKey = 'de-general-waste';
                  binNameKey = 'binNameGeneralDE';
                  binIconClass = 'fa-trash-alt';
                  specificInstructionKey = 'instructionGeneralDE';
          }
      } else if (country === 'it') { // Italian Logic (Existing)
          switch(binType) {
              case 'recyclable':
                  if (materialLower.includes('paper') || materialLower.includes('cardboard')) {
                      binColorClassKey = 'it-recyclable-paper';
                      binNameKey = 'binNameRecyclingIT_Blue';
                      binIconClass = 'fa-file-alt';
                      specificInstructionKey = 'instructionRecyclingIT_Blue';
                  } else if (materialLower.includes('glass')) {
                      binColorClassKey = 'it-recyclable-glass';
                      binNameKey = 'binNameRecyclingIT_Green';
                      binIconClass = 'fa-wine-bottle';
                      specificInstructionKey = 'instructionRecyclingIT_Green';
                  } else { // Assume Yellow bin for plastic/metal
                      binColorClassKey = 'it-recyclable-plastic_metal';
                      binNameKey = 'binNameRecyclingIT_Yellow';
                      binIconClass = 'fa-recycle';
                      specificInstructionKey = 'instructionRecyclingIT_Yellow';
                  }
                  break;
              case 'organic':
                  binColorClassKey = 'it-organic';
                  binNameKey = 'binNameOrganicIT';
                  binIconClass = 'fa-leaf';
                  specificInstructionKey = 'instructionOrganicIT';
                  break;
              case 'hazardous':
                  binColorClassKey = 'it-hazardous';
                  binNameKey = 'binNameHazardousIT';
                  binIconClass = 'fa-triangle-exclamation';
                  specificInstructionKey = 'instructionHazardousIT';
                  break;
              default: // general-waste
                  binColorClassKey = 'it-general-waste';
                  binNameKey = 'binNameGeneralIT';
                  binIconClass = 'fa-trash-alt';
                  specificInstructionKey = 'instructionGeneralIT';
          }
      } else { // US or Default Logic (Existing)
          switch(binType) {
              case 'recyclable':
                  binColorClassKey = 'us-recyclable';
                  binNameKey = 'binNameRecyclingUS'; // Use US as default naming scheme
                  binIconClass = 'fa-recycle';
                  specificInstructionKey = 'instructionRecyclingUS';
                  break;
              case 'organic':
                  binColorClassKey = 'us-organic';
                  binNameKey = 'binNameOrganicUS';
                  binIconClass = 'fa-leaf';
                  specificInstructionKey = 'instructionOrganicUS';
                  break;
              case 'hazardous':
                  binColorClassKey = 'us-hazardous';
                  binNameKey = 'binNameHazardousUS';
                  binIconClass = 'fa-triangle-exclamation';
                  specificInstructionKey = 'instructionHazardousUS';
                  break;
              default: // general-waste
                  binColorClassKey = 'us-general-waste';
                  binNameKey = 'binNameGeneralUS';
                  binIconClass = 'fa-trash-alt';
                  specificInstructionKey = 'instructionGeneralUS';
          }
      }
  
      // Get Regional Bin Name (Use the region's specific translation, fallback to English for region, fallback to key)
      regionalBinName = t_region_specific?.[binNameKey]
                      || t_region_en[binNameKey]
                      || binNameKey;
  
      // Get UI language bin name (Use UI language, fallback to regional name)
      uiBinName = t_ui?.[binNameKey] || regionalBinName;
  
      return {
          binColorClassKey, // e.g., 'br-recyclable-paper'
          regionalBinName,  // Name in the region's typical language (from translations)
          uiBinName,        // Name in the selected UI language (from translations)
          binIconClass,
          headerMaterialSummary, // Material summary in UI language
          binNameKey, // e.g., 'binNameRecyclingBR_Paper'
          specificInstructionKey // e.g., 'instructionRecyclingBR_Paper'
      };
  }
  
  // Helper function to generate appropriate instruction text
  function generateInstructionText(item, details) {
      const t_ui = translations[currentLanguage] || translations.en;
      const t_region = translations[userCountry] || translations.en; // Translations for the *selected region*
      const { primaryBin, material, isContaminated } = item;
      const { regionalBinName, specificInstructionKey } = details;
      let instructionText = "";
      let targetBinName = regionalBinName; // Use the regional name in instructions by default
  
      // Handle contaminated recyclables specially - redirect to general waste
      if (isContaminated && primaryBin === 'recyclable') {
          // Determine the correct key for general waste bin name and contaminated instruction for the current country
          let generalBinKey = 'binNameGeneralUS'; // Default
          let contaminatedInstructionKey = 'instructionContaminatedRecyclableUS'; // Default
          if (userCountry === 'de') {
              generalBinKey = 'binNameGeneralDE';
              contaminatedInstructionKey = 'instructionContaminatedRecyclableDE';
          } else if (userCountry === 'it') {
              generalBinKey = 'binNameGeneralIT';
              contaminatedInstructionKey = 'instructionContaminatedRecyclableIT';
          } else if (userCountry === 'br') {
              generalBinKey = 'binNameGeneralBR';
              contaminatedInstructionKey = 'instructionContaminatedRecyclableBR';
          }
  
          // Get the name of the general waste bin in the region's language
          const generalBinName = t_region?.[generalBinKey]
                              || translations.en[generalBinKey] // Fallback to English regional
                              || t_ui.binGeneral; // Fallback to UI generic
  
          // Get the contaminated instruction text in the UI language with fallbacks
          const contaminatedText = t_ui?.[contaminatedInstructionKey] || 
                               translations.en[contaminatedInstructionKey] || 
                               t_ui?.aiContaminatedWarning ||
                               "Item appears contaminated. Place in the {binName} instead.";
          
          // Make sure we safely do the replacement
          instructionText = contaminatedText.replace('{binName}', generalBinName || t_ui?.binGeneral || "General Waste");
      } else {
          // Use the specific instruction key determined by generateBinDetails
          // Fetch instruction in UI language, fallback to English version of key, fallback to UI generic, absolute fallback
          instructionText = t_ui?.[specificInstructionKey]
                          || translations.en[specificInstructionKey]
                          || t_ui.instructionGeneral // Generic UI fallback
                          || "Place in the {binName}."; // Absolute fallback
  
          // Replace placeholders
          instructionText = instructionText.replace('{binName}', targetBinName);
          // Use material name from UI language translations if available
          const uiMaterialName = t_ui?.[`material${material?.charAt(0).toUpperCase() + material?.slice(1)}`] || material || 'material';
          instructionText = instructionText.replace('{material}', uiMaterialName);
      }
  
      // Add a note to always check local guidelines
      const checkLocalText = t_ui?.instructionCheckLocal || translations.en.instructionCheckLocal;
      const searchItem = item.itemName || (material ? `${t_ui?.[`material${material?.charAt(0).toUpperCase() + material?.slice(1)}`] || material} item` : 'item');
      const countryNameElement = countrySelect.querySelector(`option[value="${userCountry}"]`);
      const countryName = countryNameElement ? countryNameElement.text : userCountry.toUpperCase(); // Get full country name or code
      const searchTerm = `${t_ui?.binRecycling || 'Recycling'} guidelines ${searchItem} ${countryName}`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
      instructionText += ` <a href="${searchUrl}" target="_blank" class="text-blue-600 hover:underline">(${checkLocalText})</a>`;
  
      return { instructionText };
  }
  
  function updateUIText(lang) {
      const t = translations[lang] || translations.en; // Fallback to English
      if (!t) {
          console.warn(`Language "${lang}" not found.`);
          return;
      }
      document.documentElement.lang = lang; // Set page language attribute
      document.getElementById('app-title-text').textContent = t.appTitle;
      document.getElementById('language-label').textContent = t.languageLabel;
      document.getElementById('country-label').textContent = t.countryLabel;
      document.getElementById('instructions-text').innerHTML = `<strong>${t.instructionsTitle || 'How to use:'}</strong> ${t.instructionsText || 'Point your camera...'}`;
      document.getElementById('scan-button-text').textContent = t.scanButtonText || 'Identify Item';
      document.getElementById('history-button-text').textContent = t.historyButtonText || 'Scan History';
      // Update modal title and empty message if modal elements exist
      const modalTitle = document.getElementById('history-modal-title');
      const emptyState = document.getElementById('history-empty-state');
      if(modalTitle) modalTitle.textContent = t.historyModalTitle || 'Scan History';
      // Note: Empty state text is hardcoded in HTML for better UX
  
      // Update country names in dropdown to current language if available
      // This is a bit more complex as it requires mapping values to translated text
      // For simplicity, we'll keep the country dropdown text in English for now.
      // You could add a function here to iterate through countrySelect options
      // and update their text based on a translation map if needed.
  }
  
  // --- Display Results Function (Handles success and AI-reported failure) ---
  function displayAIResults(items) {
      hideSpinner(); // Hide spinner now that we have a response
      lastResultItems = items; // Store raw items array
      const t = translations[currentLanguage] || translations.en;
  
      // 1. Handle invalid input
      if (!items || !Array.isArray(items)) {
          console.error("displayAIResults called with invalid items data:", items);
          displayError("errorAIStructure");
          lastResultItems = null;
          return;
      }
  
      // 2. Handle empty list from AI
      if (items.length === 0) {
          console.log("AI returned empty 'items' list.");
          displayFailureResult(
              t.errorAINoItemFound,
              t.instructionError
          );
          lastResultItems = null;
          return;
      }
  
      // --- Focus on the first item ---
      const item = items[0];
  
      // 3. Handle specific \"error\" bin case
      if (item.primaryBin === 'error') {
          console.log("AI reported identification failure:", item.reasoning);
          displayFailureResult(
              item.itemName || t.binNameError,
              item.reasoning || t.instructionError
          );
          lastResultItems = items; // Keep for debugging
          // Do NOT save error to history (handled in saveResultToHistory)
          return;
      }
  
      // --- Proceed with NORMAL item display ---
      const {
          itemName: detectedItemName,
          primaryBin,
          primaryConfidence,
          secondaryBin,
          secondaryConfidence,
          material,
          reasoning,
          isContaminated,
          position
      } = item;
  
      // Generate details based on the identification
      const details = generateBinDetails(primaryBin, material, userCountry);
      const { binColorClassKey, regionalBinName, uiBinName, binIconClass, headerMaterialSummary, specificInstructionKey } = details;
  
      // Get Tailwind classes
      const bgColorClass = binColorClasses[binColorClassKey] || binColorClasses['default-general-waste'];
      const borderColorClass = binBorderColorClasses[binColorClassKey] || binBorderColorClasses['default-general-waste'];
  
      // --- Update Header ---
      // Add visual feedback for bin selection
      binHeader.className = `bin-header flex flex-col items-center justify-center p-6 text-white text-center min-h-[180px] ${bgColorClass} transition-all duration-500 ease-in-out transform`;
      binHeader.style.transform = 'scale(1)';
      binHeader.style.opacity = '1';
      
      // Force reflow
      binHeader.offsetHeight;
      
      // Add animation
      binHeader.style.transform = 'scale(1.05)';
      binHeader.style.opacity = '0.8';
      
      // Reset to normal
      setTimeout(() => {
          binHeader.style.transform = 'scale(1)';
          binHeader.style.opacity = '1';
      }, 300);
      
      binHeader.innerHTML = `
          <i class="fas ${binIconClass} fa-3x mb-3"></i>
          <span class="block text-2xl font-bold leading-tight bin-name-region">${regionalBinName}</span>
          ${ currentLanguage !== userCountry && uiBinName !== regionalBinName ? `<span class="block text-sm opacity-80 mt-1 bin-name-ui-lang">(${uiBinName})</span>` : '' }
          <div class="bin-material text-sm font-medium mt-2 opacity-90">${headerMaterialSummary}</div>
      `;
  
      // --- Update Item Details ---
      itemName.textContent = detectedItemName || t.materialMixed || "Identified Item"; // Use generic name if AI fails
  
      // Clear previous dynamic content
      const detailsContainer = document.querySelector('.item-details');
      const oldDynamicElements = detailsContainer.querySelectorAll('.dynamic-result-element');
      oldDynamicElements.forEach(el => el.remove());
  
      let lastInsertedElement = itemName;
  
      // Confidence Score
      const confidenceEl = createDynamicElement('item-confidence', 'text-sm text-gray-600 mt-1 mb-3');
      confidenceEl.innerHTML = `<strong>${t.aiConfidencePrefix}</strong> ${Math.round((primaryConfidence || 0) * 100)}%`;
      lastInsertedElement.insertAdjacentElement('afterend', confidenceEl);
      lastInsertedElement = confidenceEl;
  
      // Secondary Guess
      if (secondaryBin && secondaryConfidence && secondaryConfidence > 0.1) {
          // Get the name for the secondary bin suggestion based on current settings
          const { regionalBinName: secondaryRegionalName } = generateBinDetails(secondaryBin, null, userCountry);
          const secondaryGuessEl = createDynamicElement('item-secondary-guess', 'text-sm text-gray-500 mb-3');
          secondaryGuessEl.innerHTML = `<strong>${t.aiSecondaryGuessPrefix}</strong> ${secondaryRegionalName} (${Math.round(secondaryConfidence * 100)}%)`;
          lastInsertedElement.insertAdjacentElement('afterend', secondaryGuessEl);
          lastInsertedElement = secondaryGuessEl;
      }
  
      // --- Update Instructions ---
      const { instructionText: generatedInstructionText } = generateInstructionText(item, details);
      binInstructions.innerHTML = generatedInstructionText;
      binInstructions.className = `bin-instructions text-base font-medium mt-4 mb-3 p-4 rounded-r-md border-l-4 ${borderColorClass}`;
      binInstructions.style.display = 'block';
      detailsHr.style.display = 'block';
      lastInsertedElement = binInstructions; // Insert after instructions
  
      // --- AI Reasoning / Description ---
      itemDescription.textContent = `${t.aiAnalysisPrefix} ${reasoning || 'N/A'}`;
      itemDescription.style.display = 'block';
      lastInsertedElement.insertAdjacentElement('afterend', itemDescription); // Insert desc after instructions
      lastInsertedElement = itemDescription;
  
      // --- Contamination Warning ---
      if (isContaminated) {
          const contaminationEl = createDynamicElement('contamination-warning', 'bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded relative text-sm mt-4');
          contaminationEl.innerHTML = `<i class=\"fa-solid fa-triangle-exclamation mr-1\"></i> ${t.aiContaminatedWarning || "Item appears contaminated. May need to go in General Waste."}`;
          lastInsertedElement.insertAdjacentElement('afterend', contaminationEl);
          lastInsertedElement = contaminationEl;
      }
  
      // --- Position Info ---
      if (position) {
          const positionEl = createDynamicElement('item-position', 'text-xs text-gray-500 mt-3');
          let positionText = position;
          
          // Translate common position values
          if (t.positions && t.positions[position]) {
              positionText = t.positions[position];
          }
          
          positionEl.innerHTML = `<strong>${t.aiPositionPrefix || "Detected at:"}</strong> ${positionText}`;
          lastInsertedElement.insertAdjacentElement('afterend', positionEl);
          lastInsertedElement = positionEl;
      }
  
      // --- Multiple Items Note ---
      if (items.length > 1) {
          const multiItemsEl = createDynamicElement('multi-items-note', 'bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded relative text-sm mt-4');
          multiItemsEl.innerHTML = `<i class=\"fa-solid fa-circle-info mr-1\"></i> ${t.multipleItemsDetected}`;
          lastInsertedElement.insertAdjacentElement('afterend', multiItemsEl);
          lastInsertedElement = multiItemsEl;
      }
  
    // --- Feedback Buttons ---
    const feedbackEl = createDynamicElement('feedback-container', 'text-center mt-6 mb-2');
    feedbackEl.innerHTML = `
        <span class="text-sm text-gray-600 mr-3">${t.feedbackQuestion || "Was this helpful?"}</span>
        <button class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-md hover:bg-green-200 transition mr-2" onclick="handleFeedback(true)">
            <i class="fa-solid fa-check mr-1"></i> ${t.feedbackCorrect}
        </button>
        <button class="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 transition" onclick="handleFeedback(false)">
            <i class="fa-solid fa-xmark mr-1"></i> ${t.feedbackIncorrect}
        </button>
    `;
    countryNote.insertAdjacentElement('beforebegin', feedbackEl); // Insert before the hidden country note

    // --- Show Results Content ---
    const welcomeState = document.getElementById('welcome-state');
    const resultContent = document.getElementById('result-content');
    if (welcomeState) welcomeState.classList.add('hidden');
    if (resultContent) resultContent.classList.remove('hidden');
    
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // --- Save *successful* result to history ---
    saveResultToHistory(item, lastImageDataUrl);
}

// Helper to create dynamic elements consistently
function createDynamicElement(id, classNames) {
    const el = document.createElement('div');
    el.id = id;
    el.className = `dynamic-result-element ${classNames}`;
    return el;
}

// --- Function to display the "Identification Failed" state in the card ---
function displayFailureResult(failureName, failureReasoning) {
    const t = translations[currentLanguage] || translations.en;

    const bgColorClass = binColorClasses['error-bin'];
    const borderColorClass = binBorderColorClasses['error-bin'];

    // --- Update Header ---
    // Add visual feedback for bin selection
    binHeader.className = `bin-header flex flex-col items-center justify-center p-6 text-white text-center min-h-[180px] ${bgColorClass} transition-all duration-500 ease-in-out transform`;
    binHeader.style.transform = 'scale(1)';
    binHeader.style.opacity = '1';
    
    // Force reflow
    binHeader.offsetHeight;
    
    // Add animation
    binHeader.style.transform = 'scale(1.05)';
    binHeader.style.opacity = '0.8';
    
    // Reset to normal
    setTimeout(() => {
        binHeader.style.transform = 'scale(1)';
        binHeader.style.opacity = '1';
    }, 300);
    
    binHeader.innerHTML = `
        <i class="fas fa-question-circle fa-3x mb-3"></i>
        <span class="block text-2xl font-bold leading-tight bin-name-region">${failureName}</span>
        <div class="bin-material text-sm font-medium mt-2 opacity-90"></div>
    `;

    itemName.textContent = failureName;

    const detailsContainer = document.querySelector('.item-details');
    const oldDynamicElements = detailsContainer.querySelectorAll('.dynamic-result-element');
    oldDynamicElements.forEach(el => el.remove());

    binInstructions.style.display = 'none';
    detailsHr.style.display = 'none';

    itemDescription.textContent = failureReasoning;
    itemDescription.style.display = 'block';

    // --- Show Results Content ---
    const welcomeState = document.getElementById('welcome-state');
    const resultContent = document.getElementById('result-content');
    if (welcomeState) welcomeState.classList.add('hidden');
    if (resultContent) resultContent.classList.remove('hidden');

    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Placeholder for feedback handling
function handleFeedback(isCorrect) {
    console.log("Feedback received:", isCorrect ? "Correct" : "Incorrect");
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) {
        feedbackContainer.innerHTML = `<small class="text-gray-600">Thank you for your feedback!</small>`;
    }
    
    // Track feedback
    if (window.easyBinAnalytics && lastResultItems && lastResultItems.length > 0) {
        const item = lastResultItems[0];
        window.easyBinAnalytics.trackFeedback(isCorrect, item.itemName, item.primaryBin);
    }
}

// --- History Functions ---
const HISTORY_KEY = 'trashSeparatorHistory_v2';

// Helper function to resize and compress an image
function resizeAndCompressImage(dataUrl, maxDimension = 300, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > maxDimension) {
                    height *= maxDimension / width;
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width *= maxDimension / height;
                    height = maxDimension;
                }
            }
            
            // Set canvas dimensions and draw the resized image
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Return the compressed image as data URL
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}

// Helper function to check and manage localStorage size
function getLocalStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += (localStorage[key].length * 2) / 1024 / 1024; // Size in MB
        }
    }
    return total;
}

// Function to aggressively clean history when needed
function purgeOldestHistoryItems(history, count) {
    if (history.length <= count) {
        // If we don't have enough items, remove all but most recent
        history.splice(1);
    } else {
        // Remove specified number of oldest items
        history.splice(history.length - count);
    }
    return history;
}

function saveResultToHistory(itemData, imageDataUrl) {
    if (!itemData || itemData.primaryBin === 'error' || !imageDataUrl) {
        console.warn("Skipping saving error or incomplete result to history.");
        return;
    }

    // First, resize and compress the image before storing
    resizeAndCompressImage(imageDataUrl, 300, 0.6)
        .then(compressedImage => {
            const history = loadHistory();
            const timestamp = new Date().toISOString();
            const historyEntry = {
                id: timestamp + '-' + Math.random().toString(36).substr(2, 9),
                timestamp,
                item: {
                    itemName: itemData.itemName,
                    primaryBin: itemData.primaryBin,
                    primaryConfidence: itemData.primaryConfidence,
                    material: itemData.material,
                },
                image: compressedImage,
                language: currentLanguage,
                region: userCountry
            };
            
            history.unshift(historyEntry); // Add to the beginning
            // Keep fewer items by default (30 instead of 50)
            while (history.length > 30) { history.pop(); }
            
            try {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
                console.log("History saved successfully.");
            } catch (e) {
                console.error("Error saving history to localStorage:", e);
                
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.warn("Storage quota exceeded. Implementing progressive cleanup.");
                    
                    // Progressive cleanup strategy:
                    // 1. First try keeping just 20 items
                    history.splice(20);
                    try { 
                        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
                        console.log("History saved after reducing to 20 items.");
                        return;
                    } catch (e2) {}
                    
                    // 2. If still fails, try keeping just 10 items
                    history.splice(10);
                    try { 
                        localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); 
                        console.log("History saved after reducing to 10 items.");
                        return;
                    } catch (e3) {}
                    
                    // 3. Last resort: keep only the current item
                    history.splice(1);
                    try { 
                        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
                        console.log("History saved after reducing to just the current item.");
                    } catch (e4) {
                        // If even this fails, clear history and try one more time
                        try {
                            localStorage.removeItem(HISTORY_KEY);
                            localStorage.setItem(HISTORY_KEY, JSON.stringify([historyEntry]));
                            console.log("Had to clear history completely and save only current item.");
                        } catch (e5) {
                            console.error("Failed to save history despite all cleanup attempts:", e5);
                        }
                    }
                }
            }
        })
        .catch(err => {
            console.error("Failed to compress image for history:", err);
        });
}

function loadHistory() {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
        console.error("Error loading history from localStorage:", e);
        // Try to recover by clearing potentially corrupted history
        try {
            localStorage.removeItem(HISTORY_KEY);
        } catch (clearError) {
            console.error("Could not clear corrupted history:", clearError);
        }
        return [];
    }
}

// Function to clear history data - can be called from developer console to help users with storage issues
function clearAllHistory() {
    try {
        localStorage.removeItem(HISTORY_KEY);
        console.log("History cleared successfully.");
        return true;
    } catch (e) {
        console.error("Failed to clear history:", e);
        return false;
    }
}

// Function to handle retake photo action
function handleRetake() {
    // Show welcome state and hide result content
    const welcomeState = document.getElementById('welcome-state');
    const resultContent = document.getElementById('result-content');
    if (welcomeState) welcomeState.classList.remove('hidden');
    if (resultContent) resultContent.classList.add('hidden');
    
    // Keep result card visible to show welcome state
    resultCard.classList.remove('hidden');
    
    // Clear the output div
    outputDiv.innerHTML = '';
    
    // Reset the last result items
    lastResultItems = null;
    lastAIResponse = null;
    lastImageDataUrl = null;
    
    // Re-enable the scan button
    scanButton.disabled = false;
    
    // Scroll back to the camera view
    const cameraContainer = document.getElementById('camera-container');
    if (cameraContainer) {
        cameraContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    console.log("Retake photo - UI reset complete");
}

// Function to handle share results
function handleShare() {
    // Check if Web Share API is supported
    if (navigator.share) {
        // Get the current result data
        const item = lastResultItems?.[0];
        if (!item) return;
        
        // Create share data
        const shareData = {
            title: 'EasyBin Waste Sorting Result',
            text: `I identified a ${item.itemName} as ${item.primaryBin} waste with ${Math.round(item.primaryConfidence * 100)}% confidence.`,
            url: window.location.href
        };
        
        // Attempt to share
        navigator.share(shareData)
            .then(() => console.log('Share successful'))
            .catch((error) => {
                console.error('Error sharing:', error);
                // Fallback to clipboard copy if share fails
                fallbackToClipboard(shareData);
            });
    } else {
        // Web Share API not supported, fallback to clipboard
        const item = lastResultItems?.[0];
        if (!item) return;
        
        const fallbackText = `I identified a ${item.itemName} as ${item.primaryBin} waste with ${Math.round(item.primaryConfidence * 100)}% confidence. Check out EasyBin for smart waste sorting!`;
        fallbackToClipboard({ text: fallbackText });
    }
}

// Fallback function to copy text to clipboard
function fallbackToClipboard(data) {
    const text = data.text || data.title + ' ' + data.url;
    
    // Try to use the Clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text copied to clipboard');
                // Show user feedback
                const shareButton = document.getElementById('share-button');
                const originalText = shareButton.innerHTML;
                shareButton.innerHTML = '<i class="fas fa-check mr-2" aria-hidden="true"></i><span>Shared!</span>';
                setTimeout(() => {
                    shareButton.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Could not share or copy results. Please try again.');
            });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            console.log('Text copied to clipboard');
            // Show user feedback
            const shareButton = document.getElementById('share-button');
            const originalText = shareButton.innerHTML;
            shareButton.innerHTML = '<i class="fas fa-check mr-2" aria-hidden="true"></i><span>Shared!</span>';
            setTimeout(() => {
                shareButton.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('Could not share or copy results. Please try again.');
        }
        document.body.removeChild(textArea);
    }
}

// Function to save results to photos
function handleSaveToPhotos() {
    // Create a canvas to render the result
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions (standard phone screen ratio)
    canvas.width = 1080;
    canvas.height = 1920;
    
    // Set background
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set font styles
    context.fillStyle = '#1e293b';
    
    // Add EasyBin logo/text
    context.font = 'bold 48px sans-serif';
    context.fillText('EasyBin', 60, 120);
    
    context.font = '24px sans-serif';
    context.fillStyle = '#64748b';
    context.fillText('Smart Waste Sorting', 60, 160);
    
    // Add separator
    context.strokeStyle = '#e2e8f0';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(60, 200);
    context.lineTo(canvas.width - 60, 200);
    context.stroke();
    
    // Get the current result data
    const item = lastResultItems?.[0];
    if (!item) {
        alert('No results to save. Please scan an item first.');
        return;
    }
    
    // Add item name
    context.fillStyle = '#1e293b';
    context.font = 'bold 36px sans-serif';
    context.fillText(`Item: ${item.itemName}`, 60, 280);
    
    // Add bin information
    context.font = '32px sans-serif';
    const binDetails = generateBinDetails(item.primaryBin, item.material, userCountry);
    context.fillText(`Bin: ${binDetails.uiBinName}`, 60, 340);
    
    // Add confidence
    context.fillText(`Confidence: ${Math.round(item.primaryConfidence * 100)}%`, 60, 400);
    
    // Add material if available
    if (item.material) {
        context.fillText(`Material: ${item.material}`, 60, 460);
    }
    
    // Add reasoning
    context.font = '24px sans-serif';
    context.fillStyle = '#64748b';
    
    // Wrap reasoning text
    const reasoning = item.reasoning || 'No reasoning available';
    const words = reasoning.split(' ');
    let line = '';
    let y = 540;
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > canvas.width - 120 && n > 0) {
            context.fillText(line, 60, y);
            line = words[n] + ' ';
            y += 30;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, 60, y);
    
    // Add timestamp
    context.fillStyle = '#64748b';
    context.font = '20px sans-serif';
    const now = new Date();
    context.fillText(`Saved on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 60, canvas.height - 120);
    
    // Add watermark
    context.fillStyle = '#cbd5e1';
    context.font = '18px sans-serif';
    context.fillText('EasyBin - Smart Waste Sorting', 60, canvas.height - 60);
    
    // Convert canvas to data URL and trigger download
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `easybin-result-${now.toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show user feedback
        const saveButton = document.getElementById('save-button');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-check mr-2" aria-hidden="true"></i><span>Saved!</span>';
        setTimeout(() => {
            saveButton.innerHTML = originalText;
        }, 2000);
    }, 'image/png');
}

// Function to estimate storage usage
function getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
            console.log(`Total storage: ${Math.round(estimate.quota / 1024 / 1024)}MB`);
            console.log(`Used: ${Math.round(estimate.usage / 1024 / 1024)}MB`);
            console.log(`Available: ${Math.round((estimate.quota - estimate.usage) / 1024 / 1024)}MB`);
        });
    } else {
        console.log("Storage estimation not supported");
    }
}

// --- History Modal Functions ---
function toggleHistoryModal(show) {
    if (show) {
        displayHistory();
        historyModal.classList.remove('hidden');
        historyModal.classList.add('flex');
    } else {
        historyModal.classList.add('hidden');
        historyModal.classList.remove('flex');
    }
}

function displayHistory() {
    const history = loadHistory();
    const modalBody = document.getElementById('history-modal-body');
    const emptyStateElement = document.getElementById('history-empty-state'); // Get ref to empty state div

    // Clear previous items *except* the empty message structure
    modalBody.querySelectorAll('.history-item').forEach(item => item.remove());

    if (history.length === 0) {
        if (emptyStateElement) emptyStateElement.classList.remove('hidden'); // Show message
        return;
    }

    if (emptyStateElement) emptyStateElement.classList.add('hidden'); // Hide message

    history.forEach(entry => {
        // Generate bin details based on the STORED entry's region and bin type
        const entryRegion = entry.region || 'us'; // Use saved region or default
        const entryLang = entry.language || 'en'; // Use saved language or default
        const entry_t = translations[entryLang] || translations.en; // Translations matching the entry's context

        // Generate bin details using the entry's specific context
        const { regionalBinName: entryBinName } = generateBinDetails(entry.item.primaryBin, entry.item.material, entryRegion);

        // Get material name in the entry's language for display
        const entryMaterialName = entry.item.material
            ? (entry_t[`material${entry.item.material.charAt(0).toUpperCase() + entry.item.material.slice(1)}`] || entry.item.material)
            : '';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item flex items-center border-b border-gray-200 py-3 last:border-b-0'; // Add class for easy clearing

        const img = document.createElement('img');
        img.src = entry.image;
        img.className = 'history-thumbnail w-16 h-16 object-cover mr-4 rounded-md border border-gray-200 flex-shrink-0';
        img.alt = entry.item.itemName || 'Scanned item';
        img.loading = 'lazy'; // Lazy load images

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'history-details flex-grow';

        detailsDiv.innerHTML = `
            <strong class="block text-sm font-semibold text-gray-800 mb-0.5">${entry.item.itemName || (entry_t.materialMixed || 'Unknown Item')}</strong>
            <span class="block text-xs text-gray-600">Result (${entryRegion.toUpperCase()}): ${entryBinName}</span>
            ${entryMaterialName ? `<span class="block text-xs text-gray-600">Material: ${entryMaterialName}</span>` : ''}
            <span class="block text-xs text-gray-600">Confidence: ${Math.round((entry.item.primaryConfidence || 0) * 100)}%</span>
            <span class="block text-xs text-gray-400 mt-1">${new Date(entry.timestamp).toLocaleString(currentLanguage)}</span>
        `; // Display timestamp using CURRENT UI language format

        itemDiv.appendChild(img);
        itemDiv.appendChild(detailsDiv);
        modalBody.appendChild(itemDiv); // Append the new item
    });
}

// --- Event Listeners ---
historyButton.addEventListener('click', () => toggleHistoryModal(true));

retakeButton.addEventListener('click', handleRetake);

// Share button event listener
const shareButton = document.getElementById('share-button');
if (shareButton) {
    shareButton.addEventListener('click', handleShare);
}

// Save button event listener
const saveButton = document.getElementById('save-button');
if (saveButton) {
    saveButton.addEventListener('click', handleSaveToPhotos);
}

// Quick tips functionality
const tipsButton = document.getElementById('tips-button');
const tipsOverlay = document.getElementById('quick-tips-overlay');
const closeTips = document.getElementById('close-tips');
const nextTip = document.getElementById('next-tip');
const tipsContent = document.getElementById('tips-content');

// Array of tips (can be localized)
const tips = [
    {
        icon: '📸',
        title: 'Better Photos',
        text: 'Ensure good lighting and focus on a single item for best results.'
    },
    {
        icon: '♻️',
        title: 'Recycling Rules',
        text: 'Clean containers have higher recycling rates. Rinse food residue when possible.'
    },
    {
        icon: '🌍',
        title: 'Regional Differences',
        text: 'Recycling rules vary by location. Check your local guidelines for specifics.'
    },
    {
        icon: '🔍',
        title: 'Multiple Items',
        text: 'For multiple items, scan them one at a time for accurate sorting instructions.'
    },
    {
        icon: '📱',
        title: 'Offline Use',
        text: 'EasyBin works offline! Install as a PWA for full functionality without internet.'
    }
];

let currentTipIndex = 0;

// Function to show tips overlay
function showTips() {
    if (tipsOverlay) {
        // Update tips content
        updateTipContent();
        // Show overlay
        tipsOverlay.classList.remove('hidden');
        tipsOverlay.classList.add('flex');
    }
}

// Function to update tip content
function updateTipContent() {
    if (tipsContent) {
        const tip = tips[currentTipIndex];
        tipsContent.innerHTML = `
            <div class="tip-item p-4 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">${tip.icon} ${tip.title}</h4>
                <p class="text-gray-600 text-sm">${tip.text}</p>
            </div>
        `;
    }
}

// Event listeners for tips
if (tipsButton) {
    tipsButton.addEventListener('click', showTips);
}

// Event listener for view all history button
const viewAllHistoryButton = document.getElementById('view-all-history');
if (viewAllHistoryButton) {
    viewAllHistoryButton.addEventListener('click', () => toggleHistoryModal(true));
}

if (closeTips) {
    closeTips.addEventListener('click', () => {
        if (tipsOverlay) {
            tipsOverlay.classList.add('hidden');
            tipsOverlay.classList.remove('flex');
        }
    });
}

if (nextTip) {
    nextTip.addEventListener('click', () => {
        currentTipIndex = (currentTipIndex + 1) % tips.length;
        updateTipContent();
    });
}

// Close tips when clicking outside
if (tipsOverlay) {
    tipsOverlay.addEventListener('click', function(event) {
        if (event.target === tipsOverlay) {
            tipsOverlay.classList.add('hidden');
            tipsOverlay.classList.remove('flex');
        }
    });
}

languageSelect.addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    updateUIText(currentLanguage);
    if (lastResultItems && !resultCard.classList.contains('hidden')) {
        // Re-render the currently displayed result with new language texts
        displayAIResults(lastResultItems);
    }
});

countrySelect.addEventListener('change', (event) => {
    userCountry = event.target.value;
    if (lastResultItems && !resultCard.classList.contains('hidden')) {
        // Re-render the currently displayed result with new country rules/names
        displayAIResults(lastResultItems);
    }
});

// Close modal if user clicks outside of the modal content
historyModal.addEventListener('click', function(event) {
    if (event.target === historyModal) {
        toggleHistoryModal(false);
    }
});

// --- Scan Button Action ---
scanButton.onclick = function() {
    showSpinner();
    
    // Track scan attempt
    if (window.easyBinAnalytics) {
        window.easyBinAnalytics.trackScanAttempt(userCountry, currentLanguage);
    }
    
    try {
        // Snapshot visual feedback
        const cameraContainer = document.getElementById('camera-container');
        const snapshotOverlay = document.createElement('canvas');
        snapshotOverlay.width = cameraContainer.clientWidth;
        snapshotOverlay.height = cameraContainer.clientHeight;
        snapshotOverlay.className = 'absolute inset-0 z-10 bg-white bg-opacity-50 transition-opacity duration-400 ease-out';
        snapshotOverlay.style.opacity = '1';
        const snapContext = snapshotOverlay.getContext('2d');
        // Draw current video frame to hidden canvas first
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get data URL from hidden canvas (use jpg for smaller size)
        const imageData = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG with 85% quality instead of PNG
        lastImageDataUrl = imageData; // Store for history
        
        // Draw onto snapshot overlay for visual effect
        snapContext.drawImage(video, 0, 0, snapshotOverlay.width, snapshotOverlay.height);
        cameraContainer.appendChild(snapshotOverlay);
        setTimeout(() => {
            snapshotOverlay.style.opacity = '0';
            setTimeout(() => { if (snapshotOverlay.parentNode === cameraContainer) { cameraContainer.removeChild(snapshotOverlay); } }, 400);
        }, 150);

        // --- AI Prompt ---
        const prompt = `Analyze the item(s) in the image for waste sorting purposes based on common recycling rules (consider US, German, Italian, Brazilian variations if possible, but prioritize general rules). Identify the primary item(s). For each item identified, provide:
1.  \`itemName\`: A concise name for the item (e.g., "Plastic Bottle", "Aluminum Can").
2.  \`primaryBin\`: The most likely disposal bin type ('recyclable', 'organic', 'general-waste', 'hazardous').
3.  \`primaryConfidence\`: Confidence score (0.0 to 1.0) for the primaryBin.
4.  \`secondaryBin\`: Next likely bin type.
5.  \`secondaryConfidence\`: Confidence score (0.0 to 1.0) for secondaryBin.
6.  \`material\`: Specific material if identifiable (e.g., 'PET', 'Aluminum', 'Paper', 'Glass', 'Plastic').
7.  \`reasoning\`: Brief explanation for the primaryBin choice.
8.  \`isContaminated\`: Boolean (true/false) indicating likely contamination (e.g., food residue).
9.  \`position\`: Approximate position in image (e.g., 'center', 'top-left').

**IMPORTANT:** Return the response ONLY as a valid JSON object containing a list called "items".
*   If you successfully identify one or more items, list them in the "items" array.
*   **If you cannot confidently identify any item suitable for sorting, return a single item object in the list like this:**
    \`\`\`json
    {
      "items": [
        {
          "itemName": "Identification Failed",
          "primaryBin": "error",
          "primaryConfidence": 0.0,
          "secondaryBin": null,
          "secondaryConfidence": 0.0,
          "material": null,
          "reasoning": "Could not recognize a distinct item clearly enough for sorting. Please try again with a clearer image or different angle.",
          "isContaminated": false,
          "position": "unknown"
        }
      ]
    }
    \`\`\`
*   Do not include any text before or after the JSON object.

Example for a successful identification:
{
  "items": [
    {
      "itemName": "Aluminum Can",
      "primaryBin": "recyclable",
      "primaryConfidence": 0.98,
      "secondaryBin": "general-waste",
      "secondaryConfidence": 0.02,
      "material": "Aluminum",
      "reasoning": "Clean aluminum can, typically recyclable.",
      "isContaminated": false,
      "position": "center"
    }
  ]
}`;

        console.log("Sending prompt to AI...");
        puter.ai.chat(prompt, imageData)
            .then(response => {
                console.log("Raw AI Response Received:", response);
                let aiResult;
                let responseContent = '';
                try {
                    if (typeof response === 'string') {
                        responseContent = response;
                    } else if (typeof response === 'object' && response !== null) {
                        responseContent = response.content || response.text || (response.message && response.message.content) || JSON.stringify(response); // Handle various structures
                    } else { throw new Error("Unexpected AI response format."); }

                    responseContent = String(responseContent).trim().replace(/^```json\s*|```$/g, '').trim();

                    if (!responseContent) { throw new Error("Received empty content from AI after cleaning."); }

                    aiResult = JSON.parse(responseContent);
                    console.log("Parsed AI Result:", aiResult);

                    if (!aiResult || typeof aiResult !== 'object' || !Array.isArray(aiResult.items)) {
                        throw new Error("Invalid JSON structure: 'items' array not found or invalid.");
                    }

                    lastAIResponse = aiResult;
                    displayAIResults(aiResult.items);
                    
                    // Track successful scan
                    if (window.easyBinAnalytics && aiResult.items && aiResult.items.length > 0) {
                        const item = aiResult.items[0];
                        if (item.primaryBin !== 'error') {
                            window.easyBinAnalytics.trackScanSuccess(
                                item.itemName, 
                                item.primaryConfidence, 
                                item.primaryBin, 
                                userCountry, 
                                currentLanguage
                            );
                        } else {
                            window.easyBinAnalytics.trackScanFailure(item.reasoning || 'AI identification failed', userCountry, currentLanguage);
                        }
                    }

                } catch (parseError) {
                    console.error('AI Processing/Parsing Error:', parseError);
                    console.error('Problematic AI Response Content:', responseContent);
                    const currentLang = languageSelect.value || 'en'; // Get current lang for error msg
                    displayError("errorAIStructure", `${parseError.message}. Response: ${responseContent.substring(0, 100)}...`);
                    lastResultItems = null;
                    lastAIResponse = null;
                }
            })
            .catch(error => {
                console.error('AI Call Error:', error);
                const currentLang = languageSelect.value || 'en';
                displayError("errorAIAnalyze", error.message || (translations[currentLang]?.errorUnknownAI || 'Unknown AI error.'));
                lastResultItems = null;
                lastAIResponse = null;
            })
            .finally(() => {
                // Spinner is managed by displayAIResults/displayError
                scanButton.disabled = false;
            });

    } catch (error) {
        console.error("Error during capture/AI call setup:", error);
        const currentLang = languageSelect.value || 'en';
        displayError("errorCapture", error.message);
        hideSpinner(); // Ensure spinner hidden if setup fails
        lastResultItems = null;
        lastAIResponse = null;
    }
};

// --- Country/region detection ---
async function detectUserCountry() {
    try {
        // Prefer Puter Geo API if available
        if (puter?.geo?.get) {
            const geoInfo = await puter.geo.get();
            if (geoInfo?.countryCode) {
                const country = geoInfo.countryCode.toLowerCase();
                console.log("Country detected via Puter Geo:", country);
                if (['us', 'de', 'it', 'br'].includes(country)) return country; // Added 'br'
            }
        }

        // Fallback to ipapi.co
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error(`ipapi.co failed: ${response.status}`);
        const data = await response.json();
        if (data?.country_code) {
            const country = data.country_code.toLowerCase();
            console.log("Country detected via IP:", country);
            if (['us', 'de', 'it', 'br'].includes(country)) return country; // Added 'br'
        }
    } catch (e) {
        console.warn("IP/Puter geolocation failed:", e);
    }

    // Fallback to browser locale (less reliable for country)
    try {
        const browserLocale = navigator.language || navigator.userLanguage;
        if (browserLocale) {
            const localeParts = browserLocale.split('-');
            if (localeParts.length > 1) {
                const country = localeParts[1].toLowerCase();
                console.log("Trying country from browser locale:", country);
                if (['us', 'de', 'it', 'br'].includes(country)) return country; // Added 'br'
            }
        }
    } catch (e) {
        console.warn("Browser locale detection failed:", e);
    }

    console.log("Using default country: us");
    return 'us'; // Default if all else fails
}

// --- Camera Initialization Function ---
async function initApp() {
    console.log("Initializing app...");

    // 0. Ensure welcome state is visible initially and set initial status
    const welcomeState = document.getElementById('welcome-state');
    const resultContent = document.getElementById('result-content');
    if (welcomeState) welcomeState.classList.remove('hidden');
    if (resultContent) resultContent.classList.add('hidden');
    if (resultCard) resultCard.classList.remove('hidden');
    
    // Initialize app status
    updateAppStatus('Initializing...', 'loading');

    // 1. Detect country and set dropdown
    try {
        const detectedCountry = await detectUserCountry();
        const countryOption = countrySelect.querySelector(`option[value="${detectedCountry}"]`);
        if (countryOption) {
            countrySelect.value = detectedCountry;
            userCountry = detectedCountry;
        } else {
            userCountry = countrySelect.value; // Use default if detection fails or unsupported
        }
        console.log("Initial country set to:", userCountry.toUpperCase());
    } catch (err) {
        console.error("Failed to set initial country:", err);
        userCountry = countrySelect.value; // Ensure default is set on error
    }

    // 2. Set up canvas size
    canvas.width = 640;
    canvas.height = 480;

    // 3. Initialize translations for default language (English initially)
    // The language dropdown change listener will handle subsequent updates.
    updateUIText(currentLanguage);

    // 4. Initialize Camera
    if (navigator.mediaDevices?.getUserMedia) {
        showCameraLoading();
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                }
            });
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                video.play().catch(playError => {
                    console.error("Video play failed:", playError);
                    video.muted = true; // Try muted play as fallback
                    video.play().catch(e2 => console.error("Muted play failed:", e2));
                });
                const track = stream.getVideoTracks()[0];
                const settings = track.getSettings();
                const aspectRatio = settings.width / settings.height;
                canvas.height = canvas.width / aspectRatio; // Adjust canvas height to match video aspect ratio
                console.log(`Camera initialized (${settings.width}x${settings.height}), canvas aspect ratio adjusted`);
                scanButton.disabled = false; // Enable scan button
                
                // Hide loading state once camera is ready
                hideCameraLoading();
                
                // Set ready status
                updateAppStatus('Ready to scan', 'success');
            };
        } catch (error) {
            console.error("Camera access error:", error);
            
            // Hide loading state
            hideCameraLoading();
            
            if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                // Show permission denied help screen
                const permissionDenied = document.getElementById('camera-permission-denied');
                if (permissionDenied) {
                    permissionDenied.classList.remove('hidden');
                }
            } else {
                let errorKey = "errorCameraInit";
                if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
                    errorKey = "errorCameraNotFound";
                }
                displayError(errorKey, `(${error.name})`);
            }
        }
    } else {
        displayError("errorCameraInit", "getUserMedia() is not supported.");
        
        // Hide loading state on error
        hideCameraLoading();
    }
}

// Add retry camera functionality
document.getElementById('retry-camera')?.addEventListener('click', function() {
    const permissionDenied = document.getElementById('camera-permission-denied');
    if (permissionDenied) {
        permissionDenied.classList.add('hidden');
    }
    
    // Re-initialize camera
    initApp();
});

// Add retry camera functionality
document.getElementById('retry-camera')?.addEventListener('click', function() {
    const permissionDenied = document.getElementById('camera-permission-denied');
    if (permissionDenied) {
        permissionDenied.classList.add('hidden');
    }
    
    // Re-initialize camera
    initApp();
});

// --- Start the app ---
initApp();

// Initialize analytics
if (window.easyBinAnalytics) {
    window.easyBinAnalytics.trackAppStart();
}

// Add network status monitoring
window.addEventListener('online', () => {
    const networkStatus = document.getElementById('network-status');
    if (networkStatus) {
        networkStatus.classList.remove('hidden');
        networkStatus.innerHTML = '<i class="fas fa-wifi text-green-300"></i> <span>Online</span>';
        networkStatus.classList.add('online');
        networkStatus.classList.remove('offline');
    }
    console.log('Application came online');
});

window.addEventListener('offline', () => {
    const networkStatus = document.getElementById('network-status');
    if (networkStatus) {
        networkStatus.classList.remove('hidden');
        networkStatus.innerHTML = '<i class="fas fa-wifi-slash text-red-300"></i> <span>Offline</span>';
        networkStatus.classList.add('offline');
        networkStatus.classList.remove('online');
    }
    console.log('Application went offline');
    if (window.easyBinAnalytics) {
        window.easyBinAnalytics.trackOfflineUsage();
    }
});

// Try to detect potential storage issues early
window.addEventListener('load', function() {
    // Wait a bit after app initialization to check storage
    setTimeout(() => {
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                const usedPercent = (estimate.usage / estimate.quota) * 100;
                if (usedPercent > 80) {
                    console.warn(`Storage is ${usedPercent.toFixed(1)}% full. This may cause issues with saving history.`);
                    
                    // If extremely full, try to clean up proactively
                    if (usedPercent > 95) {
                        console.warn("Storage critically full. Attempting cleanup...");
                        try {
                            const history = loadHistory();
                            if (history.length > 5) {
                                // Keep only 5 most recent items
                                history.splice(5);
                                localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
                                console.log("Proactively cleaned up history to prevent storage errors.");
                            }
                        } catch (e) {
                            console.error("Failed to perform proactive cleanup:", e);
                        }
                    }
                }
            });
        }
    }, 2000);
});