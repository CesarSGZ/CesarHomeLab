# Training Lab: Sheet connection

The Training view logs sets in the owner's Google Sheet through this Apps Script.
The app never talks to the Sheet directly: `functions/control/api/training/status.js` does, behind owner authentication, and keeps the script URL and key in D1 (`personal_datasets`, row `training-lab`).

## Install

1. In the Sheet, open **Extensions > Apps Script** and paste `Code.gs`.
2. Run `instalar`. It creates the `Rutina`, `Alternativas` and `Registro` tabs and the key; older tabs are not modified.
3. **Deploy > New deployment > Web app**: execute as me, access for anyone. The key protects the data.
4. In the Training view, paste the deployment URL ending in `/exec` followed by `#` and the key logged by `instalar`.

## Day to day

- Change the routine in the `Rutina` tab, and the alternatives in `Alternativas`. The app reads them when it opens.
- Keep an exercise's exact name to keep its history.
- After editing `Code.gs`, publish it with **Manage deployments > edit > New version**, so the URL stays the same.

## Data notes

History in `Registro` was rebuilt from the Sheet's version history: `Excel` rows are the state of each cell after each editing session, and their `Nota` column keeps the original text. A note such as `7x16.25 (6x16.25 Duro)` is read as 6 reps done at about RPE 9. `6x2x85` is read as 85 kg per side. `Entrenamientos` and `CVLPP` rows come from older sheets; their reps and dates are partly inferred.
