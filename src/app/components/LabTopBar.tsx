// Progression Path modifications, 2026-10-11. GPL-3.0; see LICENSE.
import {
  IconSwords, IconShare2, IconArrowUpRight, IconPlus,
} from '@tabler/icons-react';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/state';

const LabTopBar: React.FC = observer(() => {
  const store = useStore();
  return (
    <header className="lab-topbar">
      <a href="https://progressionpath.netlify.app" className="lab-brand" aria-label="Progression Path home">
        <span className="lab-brand-mark"><IconSwords size={25} /></span>
        <span>
          <strong>PROGRESSION PATH</strong>
          <small>THE COMBAT WORKBENCH</small>
        </span>
      </a>
      <nav aria-label="DPS Lab actions">
        <button type="button" className="lab-button lab-button-primary" disabled={!store.canCreateLoadout} onClick={() => store.createLoadout(true, store.selectedLoadout)}>
          <IconPlus size={17} />
          <span>Compare setup</span>
        </button>
        <button type="button" className="lab-button" onClick={() => store.updateUIState({ showShareModal: true })}>
          <IconShare2 size={17} />
          <span>Share</span>
        </button>
        <a className="lab-button lab-wiki-link" href="https://tools.runescape.wiki/osrs-dps/" target="_blank" rel="noopener noreferrer">
          Wiki original
          <IconArrowUpRight size={16} />
        </a>
      </nav>
    </header>
  );
});
export default LabTopBar;
