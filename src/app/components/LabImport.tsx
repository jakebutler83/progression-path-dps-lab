// Progression Path modifications, 2026-10-11. GPL-3.0; see LICENSE.
import React, { useState } from 'react';
import { useStore } from '@/state';
import parseProgressionImport from '@/lib/ProgressionImport';

const LabImport: React.FC = () => {
  const store = useStore();
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const load = (raw: string) => {
    try {
      const result = parseProgressionImport(raw);
      store.updatePreferences({ manualMode: false });
      store.updatePlayer(result.player);
      const target = store.availableMonsters.find((m) => m.name.toLowerCase() === result.targetName.toLowerCase() && (m.name !== 'Vorkath' || m.version === 'Post-quest'));
      if (target) store.updateMonster(target);
      setError(false);
      setMessage(`Imported ${result.name}'s base stats and selected bank setup. ${result.unmatched.length ? `Not matched (left empty): ${result.unmatched.join(', ')}. ` : ''}Choose your style, spell, prayers and boosts; confirm weapon charges. This replaces only the selected loadout.`);
    } catch (e) { setError(true); setMessage(e instanceof Error ? e.message : 'Could not read the setup.'); }
  };
  return (
    <details className="lab-import">
      <summary>Bring your Progression Path bank setup into the Lab</summary>
      <div className="lab-import-body">
        <p>Export a setup from the DPS Lab tab in Progression Path, then choose the JSON file or paste it here. Only your chosen setup and base levels are used—not your full bank, email, login token or private journal. Import stays in this browser.</p>
        <label htmlFor="lab-import-file">
          Choose setup file
          <input id="lab-import-file" type="file" accept=".json,application/json" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 100000) { setError(true); setMessage('File is too large. Choose a selected setup export.'); return; } load(await file.text()); event.target.value = ''; }} />
        </label>
        <label htmlFor="lab-import-json">
          Or paste setup JSON
          <textarea id="lab-import-json" value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste your selected setup export…" />
        </label>
        <div className="lab-import-actions">
          <button type="button" className="lab-button lab-button-primary" onClick={() => load(text)} disabled={!text.trim()}>Import selected setup</button>
          <button type="button" className="lab-button" onClick={() => { setText(''); setMessage(''); }}>Clear text</button>
        </div>
        <p role="status" className={error ? 'lab-import-error' : 'lab-import-status'}>{message}</p>
      </div>
    </details>
  );
};
export default LabImport;
