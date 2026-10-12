// Progression Path modifications, 2026-10-11. GPL-3.0; see LICENSE.
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/state';
import { getCdnImage } from '@/utils';

const LabOverview: React.FC = observer(() => {
  const store = useStore();
  const result = store.calc.loadouts[store.selectedLoadout];
  const number = (value: number | undefined, places = 2) => (Number.isFinite(value) ? value!.toFixed(places) : '—');
  const boss = store.monster;
  return (
    <>
      <section className="lab-hero" aria-labelledby="lab-title">
        <div className="lab-hero-copy">
          <span className="lab-eyebrow">PLAN THE FIGHT. KNOW YOUR EDGE.</span>
          <h1 id="lab-title">
            The DPS
            {' '}
            <em>Lab.</em>
          </h1>
          <p>
            Your gear. Their defences.
            <br />
            Find the upgrade that actually matters.
          </p>
          <div className="lab-status">
            <i />
            {' '}
            Calculated in your browser
            {' '}
            <span>·</span>
            {' '}
            Powered by the Wiki engine
          </div>
        </div>
        <div className="lab-target-art" aria-hidden="true">
          <div className="lab-orbit" />
          <img src={getCdnImage(`monsters/${boss.image || 'King Black Dragon.png'}`)} alt="" />
          <span>TARGET LOCKED</span>
          <strong>{boss.name || 'Choose a monster'}</strong>
        </div>
      </section>
      <div className="lab-metrics" aria-label="Selected loadout results">
        <article className="lab-metric-dps">
          <small>DAMAGE / SECOND</small>
          <strong data-lab-metric="dps">{number(result?.dps)}</strong>
          <span>{store.player.name}</span>
        </article>
        <article>
          <small>HIT CHANCE</small>
          <strong data-lab-metric="accuracy">{result?.accuracy === undefined ? '—' : `${number(result.accuracy * 100, 1)}%`}</strong>
          <span>
            Against
            {' '}
            {boss.name}
          </span>
        </article>
        <article>
          <small>MAXIMUM HIT</small>
          <strong data-lab-metric="maxHit">{number(result?.maxHit, 0)}</strong>
          <span>Current attack configuration</span>
        </article>
        <article>
          <small>EXPECTED KILL</small>
          <strong data-lab-metric="ttk">{result?.ttk && Number.isFinite(result.ttk) ? `${number(result.ttk, 1)}s` : '—'}</strong>
          <span>Ideal uptime · mechanics excluded</span>
        </article>
      </div>
      <div className="lab-quick-targets">
        <span className="lab-eyebrow">CHOOSE YOUR FIGHT</span>
        {['King Black Dragon', 'Vorkath', 'Zulrah', 'General Graardor', 'Abyssal demon'].map((name) => <button key={name} type="button" aria-pressed={boss.name === name} onClick={() => { const monster = store.availableMonsters.find((m) => m.name === name && (name !== 'Vorkath' || m.version === 'Post-quest')); if (monster) store.updateMonster(monster); }}>{name}</button>)}
      </div>
    </>
  );
});
export default LabOverview;
