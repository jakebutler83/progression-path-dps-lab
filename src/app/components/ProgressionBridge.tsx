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
    let pending: { id: string; loadout: number; timer: number } | null = null;
    let viewport: { top: number; height: number } | undefined;
    const status = (state: string, message: string) => window.dispatchEvent(new CustomEvent('pp-companion-import-status', { detail: { state, message, viewport } }));
    const finish = (state: string, message: string) => {
      if (pending) window.clearTimeout(pending.timer);
      pending = null;
      status(state, message);
    };
    const send = (type: string, fields: Record<string, unknown> = {}) => {
      window.parent.postMessage({ type, channel, ...fields }, parentOrigin && parentOrigin !== 'null' ? parentOrigin : '*');
    };
    const ready = () => send('pp-dps-ready');
    const requestCharacter = () => {
      if (pending) return;
      const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) => n.toString(16).padStart(2, '0')).join('');
      pending = { id, loadout: store.selectedLoadout, timer: window.setTimeout(() => finish('error', 'No response from Progression Path. Reload the calculator and retry. On iOS, synced-gear import needs the updated app build; the bank-setup controls above remain available.'), 15000) };
      status('loading', 'Loading your selected character’s latest synced gear…');
      send('pp-dps-request-character', { requestId: id });
    };
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.data?.channel !== channel) return;
      // Some WKWebView versions serialize the custom capacitor: origin as null.
      // Opaque parents can only supply a setup, never request saved/private data.
      // The exact parent WindowProxy and per-frame random channel are mandatory;
      // hosted CSP additionally restricts which parents may embed this module.
      if (![origin, 'capacitor://localhost', 'https://localhost', 'http://localhost', 'null'].includes(event.origin)) return;
      parentOrigin = event.origin;
      if (event.data?.requestId && (!pending || event.data.requestId !== pending.id)) return;
      const bounds = event.data?.viewport;
      if (bounds && Number.isFinite(bounds.top) && bounds.top >= 0 && bounds.top <= 20000 && Number.isFinite(bounds.height) && bounds.height >= 160 && bounds.height <= 4000) viewport = { top: bounds.top, height: bounds.height };
      if (event.data?.type === 'pp-dps-import-failed') {
        if (pending && event.data.requestId === pending.id) finish('error', String(event.data.message || 'No matching character snapshot is available.').slice(0, 1000));
        return;
      }
      if (event.data?.type !== 'pp-dps-import') return;
      if (pending && pending.loadout !== store.selectedLoadout) {
        finish('error', 'The selected comparison setup changed. Import again into the setup you want to replace.');
        return;
      }
      try {
        const result = parseProgressionImport(JSON.stringify(event.data.payload));
        store.updatePreferences({ manualMode: false });
        store.updatePlayer(result.player);
        const target = store.availableMonsters.find((m) => m.name.toLowerCase() === result.targetName.toLowerCase() && (m.name !== 'Vorkath' || m.version === 'Post-quest'));
        if (target) store.updateMonster(target);
        const stamp = new Date(result.snapshotUpdatedAt);
        const freshness = result.sourceLabel === 'last synced worn gear' ? ` Snapshot: ${Number.isFinite(stamp.valueOf()) ? stamp.toLocaleString() : 'time unavailable'}.` : '';
        const message = `Loaded ${result.name}'s ${result.sourceLabel} and base levels.${freshness}${result.unmatched.length ? ` Unmatched items left empty: ${result.unmatched.join(', ')}.` : ''} Check spells, charges, prayers and boosts below.`;
        finish('success', message);
        send('pp-dps-imported', { message });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load setup.';
        finish('error', message);
        send('pp-dps-error', { message });
      }
    };
    // The embedded shell is content-sized, not 100vh: measuring a viewport-sized
    // shell would feed the parent's height back into itself on every poll.
    // Include the footer and let the parent keep one page scroll on phones.
    let lastHeight = 0;
    const measure = () => {
      const height = Math.ceil(document.body.getBoundingClientRect().height);
      if (height !== lastHeight && height > 0) { lastHeight = height; send('pp-dps-height', { height }); }
    };
    window.addEventListener('message', receive);
    window.addEventListener('pp-calculator-initialized', ready);
    window.addEventListener('pp-request-character-import', requestCharacter);
    const timer = window.setInterval(measure, 500);
    return () => {
      window.clearInterval(timer);
      if (pending) window.clearTimeout(pending.timer);
      window.removeEventListener('message', receive);
      window.removeEventListener('pp-calculator-initialized', ready);
      window.removeEventListener('pp-request-character-import', requestCharacter);
      document.documentElement.classList.remove('pp-embedded');
    };
  }, [store]);
  return null;
};
export default ProgressionBridge;
