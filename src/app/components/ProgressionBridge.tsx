// Progression Path integration, 2026-10-11. GPL-3.0; see LICENSE.
import React, { useEffect } from 'react';
import { useStore } from '@/state';
import parseProgressionImport from '@/lib/ProgressionImport';

const ProgressionBridge: React.FC = () => {
  const store = useStore();
  useEffect(() => {
    if (window.parent === window) return undefined;
    document.documentElement.classList.add('pp-embedded');
    const channel = new URLSearchParams(window.location.search).get('channel');
    if (!channel || !/^[a-f0-9]{32}$/.test(channel)) return undefined;
    const origin = window.location.origin;
    let parentOrigin = '';
    const send = (type: string, fields: Record<string, unknown> = {}) => {
      window.parent.postMessage({ type, channel, ...fields }, parentOrigin && parentOrigin !== 'null' ? parentOrigin : '*');
    };
    const ready = () => send('pp-dps-ready');
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.data?.channel !== channel) return;
      // Some WKWebView versions serialize the custom capacitor: origin as null.
      // Opaque parents can only supply a setup, never request saved/private data.
      // The exact parent WindowProxy and per-frame random channel are mandatory;
      // hosted CSP additionally restricts which parents may embed this module.
      if (![origin, 'capacitor://localhost', 'https://localhost', 'http://localhost', 'null'].includes(event.origin)) return;
      parentOrigin = event.origin;
      if (event.data?.type !== 'pp-dps-import') return;
      try {
        const result = parseProgressionImport(JSON.stringify(event.data.payload));
        store.updatePreferences({ manualMode: false });
        store.updatePlayer(result.player);
        const target = store.availableMonsters.find((m) => m.name.toLowerCase() === result.targetName.toLowerCase() && (m.name !== 'Vorkath' || m.version === 'Post-quest'));
        if (target) store.updateMonster(target);
        send('pp-dps-imported', { message: `Loaded ${result.name}'s selected bank setup and base levels.${result.unmatched.length ? ` Unmatched items left empty: ${result.unmatched.join(', ')}.` : ''} Check spells, charges, prayers and boosts below.` });
      } catch (error) {
        send('pp-dps-error', { message: error instanceof Error ? error.message : 'Unable to load setup.' });
      }
    };
    // Polling the natural content height avoids ResizeObserver/iframe-height
    // feedback loops. The parent keeps one page scroll, including on phones.
    let lastHeight = 0;
    const measure = () => {
      const height = Math.ceil(document.body.getBoundingClientRect().height);
      if (height !== lastHeight && height > 0) { lastHeight = height; send('pp-dps-height', { height }); }
    };
    window.addEventListener('message', receive);
    window.addEventListener('pp-calculator-initialized', ready);
    const timer = window.setInterval(measure, 500);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('message', receive);
      window.removeEventListener('pp-calculator-initialized', ready);
      document.documentElement.classList.remove('pp-embedded');
    };
  }, [store]);
  return null;
};
export default ProgressionBridge;
