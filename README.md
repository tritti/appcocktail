# App Cocktail

Un'applicazione web per gestire ricette di cocktail e controllare luci LED tramite server WLED per indicare quali bottiglie sono necessarie per la preparazione.

## Funzionalità

- **Gestione Ricette**: Aggiungi, modifica ed elimina ricette di cocktail
- **Visualizzazione**: Lista di cocktail ordinata alfabeticamente
- **Ingredienti**: Visualizzazione dettagliata di ingredienti e procedura
- **Integrazione WLED**: Controllo automatico di LED per indicare quali bottiglie sono necessarie
- **Ripristino Automatico**: Dopo aver mostrato le bottiglie necessarie, l'app ripristina le impostazioni originali del server WLED

## Utilizzo

1. Configura il server WLED (indirizzo IP e numero di LED)
2. Aggiungi le tue ricette di cocktail, specificando:
   - Nome del cocktail
   - Ingredienti
   - Procedura di preparazione
   - Posizioni dei LED corrispondenti agli ingredienti
3. Seleziona un cocktail dalla lista per visualizzare la ricetta e attivare i LED corrispondenti

## Tecnologie

- HTML5
- CSS3
- JavaScript (Vanilla)
- API WLED
- LocalStorage per salvare ricette e configurazioni

## Installazione

1. Clona il repository
2. Apri il file `index.html` in un browser web
3. Configura il server WLED
4. Inizia ad aggiungere le tue ricette

## Note

L'app è progettata per funzionare con un server WLED che controlla LED corrispondenti a bottiglie di liquori/ingredienti. Quando selezioni un cocktail, i LED corrispondenti agli ingredienti necessari si accendono di colore rosso per 10 secondi, per poi ripristinare le impostazioni originali del server.