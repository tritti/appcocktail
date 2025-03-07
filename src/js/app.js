document.addEventListener('DOMContentLoaded', () => {
    // Elementi DOM
    const addRecipeButton = document.getElementById('addRecipe');
    const showRecipesButton = document.getElementById('showRecipes');
    const configureWLEDButton = document.getElementById('configureWLED');
    const showBackupRestoreButton = document.getElementById('showBackupRestore');
    const addRecipeSection = document.getElementById('addRecipeSection');
    const recipesSection = document.getElementById('recipesSection');
    const recipeDetailSection = document.getElementById('recipeDetailSection');
    const editRecipeSection = document.getElementById('editRecipeSection');
    const wledConfigSection = document.getElementById('wledConfigSection');
    const backupRestoreSection = document.getElementById('backupRestoreSection');
    const recipeForm = document.getElementById('recipeForm');
    const editRecipeForm = document.getElementById('editRecipeForm');
    const wledConfigForm = document.getElementById('wledConfigForm');
    const cocktailButtonsContainer = document.getElementById('cocktailButtons');
    const backToListButton = document.getElementById('backToList');
    const editRecipeButton = document.getElementById('editRecipe');
    const deleteRecipeButton = document.getElementById('deleteRecipe');
    const cancelEditButton = document.getElementById('cancelEdit');
    const exportRecipesBtn = document.getElementById('exportRecipesBtn');
    const importRecipesBtn = document.getElementById('importRecipesBtn');
    const importFileInput = document.getElementById('importFile');

    // Variabili globali
    let currentRecipe = null;

    // Inizializzazione
    loadCocktails();
    loadWLEDConfig();

    // Event Listeners
    addRecipeButton.addEventListener('click', () => showSection(addRecipeSection));
    showRecipesButton.addEventListener('click', () => showSection(recipesSection));
    configureWLEDButton.addEventListener('click', () => showSection(wledConfigSection));
    showBackupRestoreButton.addEventListener('click', () => showSection(backupRestoreSection));
    backToListButton.addEventListener('click', () => showSection(recipesSection));
    editRecipeButton.addEventListener('click', () => {
        if (currentRecipe) {
            populateEditForm(currentRecipe);
            showSection(editRecipeSection);
        }
    });
    deleteRecipeButton.addEventListener('click', () => {
        if (currentRecipe && confirm('Sei sicuro di voler eliminare questa ricetta?')) {
            deleteRecipe(currentRecipe.id);
            showSection(recipesSection);
        }
    });
    cancelEditButton.addEventListener('click', () => {
        if (currentRecipe) {
            showRecipeDetail(currentRecipe);
        } else {
            showSection(recipesSection);
        }
    });
    
    // Filtro per cocktail
    document.getElementById('showAllCocktails').addEventListener('click', () => {
        setActiveFilter('showAllCocktails');
        loadCocktails('all');
    });
    
    document.getElementById('showAlcoholicCocktails').addEventListener('click', () => {
        setActiveFilter('showAlcoholicCocktails');
        loadCocktails('alcoholic');
    });
    
    document.getElementById('showNonAlcoholicCocktails').addEventListener('click', () => {
        setActiveFilter('showNonAlcoholicCocktails');
        loadCocktails('non-alcoholic');
    });
    
    recipeForm.addEventListener('submit', saveRecipe);
    editRecipeForm.addEventListener('submit', updateRecipe);
    wledConfigForm.addEventListener('submit', saveWLEDConfig);
    
    // Event Listeners per il backup/ripristino
    exportRecipesBtn.addEventListener('click', exportRecipes);
    importRecipesBtn.addEventListener('click', importRecipes);
    
    // Helper per impostare il filtro attivo
    function setActiveFilter(filterId) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(filterId).classList.add('active');
    }

    /**
     * Mostra una sezione e nasconde le altre
     */
    function showSection(sectionToShow) {
        const sections = [
            addRecipeSection, 
            recipesSection, 
            recipeDetailSection, 
            editRecipeSection, 
            wledConfigSection,
            backupRestoreSection
        ];
        sections.forEach(section => {
            section.classList.add('hidden');
        });
        sectionToShow.classList.remove('hidden');
    }

    /**
     * Salva una nuova ricetta
     */
    function saveRecipe(e) {
        e.preventDefault();
        
        const cocktailName = document.getElementById('cocktailName').value;
        const ingredients = document.getElementById('ingredients').value;
        const preparation = document.getElementById('preparation').value;
        const ledPositions = document.getElementById('ledPositions').value;
        const displayOrder = parseInt(document.getElementById('displayOrder').value) || 999;
        const isAlcoholic = document.getElementById('alcoholic').value === 'true';
        
        // Validazione
        if (!cocktailName || !ingredients || !preparation || !ledPositions) {
            alert('Compila tutti i campi richiesti');
            return;
        }
        
        // Converte ledPositions in array di numeri
        const ledPositionsArray = ledPositions.split(',').map(pos => parseInt(pos.trim()));
        
        // Crea oggetto ricetta
        const recipe = {
            id: Date.now().toString(),
            name: cocktailName,
            ingredients: ingredients.split('\\n').filter(line => line.trim() !== ''),
            preparation: preparation,
            ledPositions: ledPositionsArray,
            displayOrder: displayOrder,
            alcoholic: isAlcoholic,
            createdAt: new Date().toISOString()
        };
        
        // Salva nel localStorage
        let recipes = JSON.parse(localStorage.getItem('cocktailRecipes') || '[]');
        recipes.push(recipe);
        localStorage.setItem('cocktailRecipes', JSON.stringify(recipes));
        
        // Reset form e aggiorna lista
        recipeForm.reset();
        loadCocktails();
        showSection(recipesSection);
    }

    /**
     * Popola il form di modifica con i dati della ricetta
     */
    function populateEditForm(recipe) {
        document.getElementById('editRecipeId').value = recipe.id;
        document.getElementById('editCocktailName').value = recipe.name;
        document.getElementById('editIngredients').value = recipe.ingredients.join('\\n');
        document.getElementById('editPreparation').value = recipe.preparation;
        document.getElementById('editLedPositions').value = recipe.ledPositions.join(',');
        document.getElementById('editDisplayOrder').value = recipe.displayOrder || 999;
        
        // Imposta il valore del campo alcoholic se presente, altrimenti default a true
        if (recipe.hasOwnProperty('alcoholic')) {
            document.getElementById('editAlcoholic').value = recipe.alcoholic ? 'true' : 'false';
        } else {
            document.getElementById('editAlcoholic').value = 'true';
        }
    }

    /**
     * Aggiorna una ricetta esistente
     */
    function updateRecipe(e) {
        e.preventDefault();
        
        const recipeId = document.getElementById('editRecipeId').value;
        const cocktailName = document.getElementById('editCocktailName').value;
        const ingredients = document.getElementById('editIngredients').value;
        const preparation = document.getElementById('editPreparation').value;
        const ledPositions = document.getElementById('editLedPositions').value;
        const displayOrder = parseInt(document.getElementById('editDisplayOrder').value) || 999;
        const isAlcoholic = document.getElementById('editAlcoholic').value === 'true';
        
        // Validazione
        if (!recipeId || !cocktailName || !ingredients || !preparation || !ledPositions) {
            alert('Compila tutti i campi richiesti');
            return;
        }
        
        // Carica ricette esistenti
        let recipes = JSON.parse(localStorage.getItem('cocktailRecipes') || '[]');
        
        // Trova l'indice della ricetta da aggiornare
        const recipeIndex = recipes.findIndex(r => r.id === recipeId);
        
        if (recipeIndex === -1) {
            alert('Ricetta non trovata!');
            return;
        }
        
        // Aggiorna la ricetta mantenendo data creazione
        const updatedRecipe = {
            ...recipes[recipeIndex],
            name: cocktailName,
            ingredients: ingredients.split('\\n').filter(line => line.trim() !== ''),
            preparation: preparation,
            ledPositions: ledPositions.split(',').map(pos => parseInt(pos.trim())),
            displayOrder: displayOrder,
            alcoholic: isAlcoholic,
            updatedAt: new Date().toISOString()
        };
        
        recipes[recipeIndex] = updatedRecipe;
        
        // Salva nel localStorage
        localStorage.setItem('cocktailRecipes', JSON.stringify(recipes));
        
        // Aggiorna ricetta corrente e mostra dettaglio
        currentRecipe = updatedRecipe;
        showRecipeDetail(updatedRecipe);
        
        // Aggiorna lista
        loadCocktails();
    }

    /**
     * Elimina una ricetta
     */
    function deleteRecipe(recipeId) {
        let recipes = JSON.parse(localStorage.getItem('cocktailRecipes') || '[]');
        recipes = recipes.filter(recipe => recipe.id !== recipeId);
        localStorage.setItem('cocktailRecipes', JSON.stringify(recipes));
        
        // Reset ricetta corrente e aggiorna lista
        currentRecipe = null;
        loadCocktails();
    }

    /**
     * Carica e visualizza i cocktail salvati
     * @param {string} filter - Filtra per: 'all', 'alcoholic', 'non-alcoholic'
     */
    function loadCocktails(filter = 'all') {
        const recipes = JSON.parse(localStorage.getItem('cocktailRecipes') || '[]');
        cocktailButtonsContainer.innerHTML = '';
        
        if (recipes.length === 0) {
            cocktailButtonsContainer.innerHTML = '<p>Nessuna ricetta salvata. Aggiungi la tua prima ricetta!</p>';
            return;
        }
        
        // Filtra le ricette se necessario
        let filteredRecipes = [...recipes];
        
        if (filter === 'alcoholic') {
            filteredRecipes = recipes.filter(recipe => recipe.alcoholic !== false); // Include anche quelle senza proprietà alcoholic
        } else if (filter === 'non-alcoholic') {
            filteredRecipes = recipes.filter(recipe => recipe.alcoholic === false);
        }
        
        // Mostra messaggio se non ci sono ricette nel filtro
        if (filteredRecipes.length === 0) {
            cocktailButtonsContainer.innerHTML = '<p>Nessuna ricetta corrisponde al filtro selezionato.</p>';
            return;
        }
        
        // Ordina le ricette per nome in ordine alfabetico
        const sortedRecipes = filteredRecipes.sort((a, b) => 
            a.name.localeCompare(b.name, 'it', {sensitivity: 'base'})
        );
        
        sortedRecipes.forEach(recipe => {
            const button = document.createElement('button');
            // Determina se è alcolico (default a true per ricette più vecchie)
            const isAlcoholic = recipe.hasOwnProperty('alcoholic') ? recipe.alcoholic : true;
            button.className = `cocktail-button ${isAlcoholic ? 'alcoholic' : 'non-alcoholic'}`;
            button.textContent = recipe.name;
            button.addEventListener('click', () => showRecipeDetail(recipe));
            cocktailButtonsContainer.appendChild(button);
        });
    }

    /**
     * Mostra i dettagli di un cocktail
     */
    function showRecipeDetail(recipe) {
        // Salva la ricetta corrente
        currentRecipe = recipe;
        
        // Popola i dettagli
        document.getElementById('detailTitle').textContent = recipe.name;
        
        const ingredientsList = document.getElementById('detailIngredients');
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });
        
        document.getElementById('detailPreparation').textContent = recipe.preparation;
        document.getElementById('detailLedPositions').textContent = recipe.ledPositions.join(', ');
        document.getElementById('detailOrder').textContent = recipe.displayOrder || '—';
        
        // Mostra se il cocktail è alcolico o no
        const isAlcoholic = recipe.hasOwnProperty('alcoholic') ? recipe.alcoholic : true;
        document.getElementById('detailAlcoholic').textContent = isAlcoholic ? 'Sì' : 'No';
        
        // Controlla e attiva i LED tramite WLED
        controlWLEDLights(recipe.ledPositions);
        
        showSection(recipeDetailSection);
    }

    /**
     * Salva configurazione WLED
     */
    function saveWLEDConfig(e) {
        e.preventDefault();
        
        const wledServerIP = document.getElementById('wledServerIP').value;
        const totalLeds = document.getElementById('totalLeds').value;
        
        if (!wledServerIP || !totalLeds) {
            alert('Compila tutti i campi richiesti');
            return;
        }
        
        const config = {
            serverIP: wledServerIP,
            totalLeds: parseInt(totalLeds)
        };
        
        localStorage.setItem('wledConfig', JSON.stringify(config));
        alert('Configurazione WLED salvata con successo');
        
        showSection(recipesSection);
    }

    /**
     * Carica configurazione WLED
     */
    function loadWLEDConfig() {
        const config = JSON.parse(localStorage.getItem('wledConfig') || '{}');
        
        if (config.serverIP) {
            document.getElementById('wledServerIP').value = config.serverIP;
        }
        
        if (config.totalLeds) {
            document.getElementById('totalLeds').value = config.totalLeds;
        }
    }

    /**
     * Controlla i LED tramite WLED API
     */
    async function controlWLEDLights(ledPositions) {
        const config = JSON.parse(localStorage.getItem('wledConfig') || '{}');
        
        if (!config.serverIP || !config.totalLeds) {
            console.log('Configurazione WLED non completa');
            return;
        }
        
        try {
            // Salva lo stato attuale di WLED prima di modificarlo
            let savedStateResponse = await fetch(`http://${config.serverIP}/json/state`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!savedStateResponse.ok) {
                console.error('Errore nel salvataggio dello stato WLED:', savedStateResponse.statusText);
                return;
            }
            
            const savedState = await savedStateResponse.json();
            
            // Crea array di stati dei LED (tutti spenti all'inizio)
            let segments = [];
            
            // Crea un segmento per ogni LED
            for (let i = 0; i < config.totalLeds; i++) {
                const isActive = ledPositions.includes(i);
                
                segments.push({
                    id: i,
                    start: i,
                    stop: i+1,
                    on: isActive,
                    bri: 255,
                    col: isActive ? [[255, 0, 0]] : [[0, 0, 0]], // Rosso per i LED attivi, spento per gli altri
                });
            }
            
            // Costruisci dati JSON per l'API WLED
            const apiData = {
                on: true,
                bri: 255,
                transition: 0, // Transizione istantanea
                mainseg: 0,
                seg: segments
            };
            
            // Invia richiesta al server WLED per modificare i LED
            const response = await fetch(`http://${config.serverIP}/json/state`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiData)
            });
            
            if (response.ok) {
                console.log('LED WLED configurati temporaneamente');
                
                // Dopo 10 secondi, ripristina lo stato originale
                setTimeout(async () => {
                    try {
                        // Mantieni solo i campi necessari per ripristinare lo stato
                        const restoreData = {
                            on: savedState.on,
                            bri: savedState.bri,
                            transition: 1000, // transizione graduale per il ripristino
                            seg: savedState.seg
                        };
                        
                        const restoreResponse = await fetch(`http://${config.serverIP}/json/state`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(restoreData)
                        });
                        
                        if (restoreResponse.ok) {
                            console.log('Stato WLED ripristinato con successo');
                        } else {
                            console.error('Errore nel ripristino dello stato WLED:', restoreResponse.statusText);
                        }
                    } catch (restoreError) {
                        console.error('Errore nel ripristino dello stato WLED:', restoreError);
                    }
                }, 10000); // 10 secondi
            } else {
                console.error('Errore nell\'interazione con WLED:', response.statusText);
            }
        } catch (error) {
            console.error('Errore nella gestione WLED:', error);
        }
    }
    
    /**
     * Esporta tutte le ricette in un file JSON
     */
    function exportRecipes() {
        try {
            // Recupera tutte le ricette dal localStorage
            const recipes = JSON.parse(localStorage.getItem('cocktailRecipes') || '[]');
            
            if (recipes.length === 0) {
                alert('Non ci sono ricette da esportare.');
                return;
            }
            
            // Crea l'oggetto per l'esportazione che include i metadati
            const exportData = {
                type: 'cocktail_recipes_export',
                version: '1.0',
                createdAt: new Date().toISOString(),
                data: recipes
            };
            
            // Converti in stringa JSON formattata
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Crea un oggetto Blob per il download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Crea un elemento <a> per il download
            const a = document.createElement('a');
            a.href = url;
            a.download = `cocktail_recipes_${new Date().toISOString().slice(0, 10)}.json`;
            
            // Aggiungi al documento, simula il click e rimuovi
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Rilascia l'URL creato
            URL.revokeObjectURL(url);
            
            alert('Esportazione completata con successo!');
        } catch (error) {
            console.error('Errore durante l\'esportazione:', error);
            alert('Si è verificato un errore durante l\'esportazione: ' + error.message);
        }
    }
    
    /**
     * Importa ricette da un file JSON
     */
    function importRecipes() {
        const fileInput = document.getElementById('importFile');
        const importOption = document.querySelector('input[name="importOption"]:checked').value;
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Seleziona un file JSON da importare.');
            return;
        }
        
        const file = fileInput.files[0];
        
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            alert('Il file deve essere in formato JSON.');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                // Parsa il file JSON
                const importedData = JSON.parse(e.target.result);
                
                // Verifica il formato del file
                if (!importedData.type || importedData.type !== 'cocktail_recipes_export' || !importedData.data) {
                    alert('Il formato del file non è valido. Seleziona un file JSON esportato dall\'app.');
                    return;
                }
                
                // Recupera le ricette esistenti
                const existingRecipes = JSON.parse(localStorage.getItem('cocktailRecipes') || '[]');
                
                let newRecipes;
                
                if (importOption === 'replace') {
                    // Sostituisci completamente le ricette esistenti
                    newRecipes = importedData.data;
                } else if (importOption === 'merge') {
                    // Unisci le ricette, evitando duplicati basati sull'ID
                    const mergedRecipes = [...existingRecipes];
                    
                    importedData.data.forEach(importedRecipe => {
                        // Controlla se esiste già una ricetta con lo stesso ID
                        const existingIndex = mergedRecipes.findIndex(r => r.id === importedRecipe.id);
                        
                        if (existingIndex !== -1) {
                            // Sostituisci la ricetta esistente con quella importata
                            mergedRecipes[existingIndex] = importedRecipe;
                        } else {
                            // Aggiungi la nuova ricetta
                            mergedRecipes.push(importedRecipe);
                        }
                    });
                    
                    newRecipes = mergedRecipes;
                }
                
                // Salva le nuove ricette nel localStorage
                localStorage.setItem('cocktailRecipes', JSON.stringify(newRecipes));
                
                // Aggiorna la visualizzazione
                loadCocktails();
                
                // Resetta il campo file
                fileInput.value = '';
                
                alert(`Importazione completata! ${importedData.data.length} ricette importate.`);
                
                // Torna alla pagina principale
                showSection(recipesSection);
                
            } catch (error) {
                console.error('Errore durante l\'importazione:', error);
                alert('Si è verificato un errore durante l\'importazione: ' + error.message);
            }
        };
        
        reader.onerror = function() {
            alert('Si è verificato un errore nella lettura del file.');
        };
        
        reader.readAsText(file);
    }
});