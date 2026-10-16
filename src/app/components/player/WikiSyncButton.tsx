// Progression Path companion import. GPL-3.0; see LICENSE and FORK-NOTICE.md.
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import RuneLiteLogo from '@/public/img/RuneLite.webp';
import Modal from '@/app/components/generic/Modal';

const WikiSyncButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const [viewport, setViewport] = useState<{ top: number; height: number }>();
  useEffect(() => {
    setEmbedded(window.parent !== window && /^[a-f0-9]{32}$/.test(new URLSearchParams(window.location.search).get('channel') || ''));
    const receive = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setPending(detail?.state === 'loading');
      setStatus(String(detail?.message || '').slice(0, 1000));
      if (detail?.viewport) setViewport(detail.viewport);
    };
    window.addEventListener('pp-companion-import-status', receive);
    return () => window.removeEventListener('pp-companion-import-status', receive);
  }, []);
  const load = () => {
    setOpen(true);
    if (embedded) window.dispatchEvent(new Event('pp-request-character-import'));
  };
  return (
    <>
      <button
        type="button"
        className="transition-all hover:text-white border border-body-500 bg-[#3e2816] p-1 rounded-md dark:bg-dark-300 dark:border-dark-200 flex items-center gap-1 w-9"
        aria-label="Import synced RuneLite gear"
        title="Import synced RuneLite gear"
        disabled={pending}
        onClick={load}
      >
        <Image alt="" src={RuneLiteLogo} />
      </button>
      <Modal isOpen={open} setIsOpen={setOpen} title="Import your RuneLite sync" embeddedViewport={viewport}>
        <div className="text-sm space-y-3">
          <p>Uses your selected character’s latest Progression Path companion snapshot: base levels and worn equipment. This works on desktop and mobile without WikiSync or local-network permission.</p>
          <p>It is a saved snapshot—not a live connection to your game. Equipment changes appear here after your next companion account sync.</p>
          {embedded ? (
            <>
              <p role="status" aria-live="polite" className="border border-dark-200 p-3 rounded">{status || 'Waiting for your character snapshot…'}</p>
              <button type="button" className="lab-button lab-button-primary" disabled={pending} onClick={load}>{pending ? 'Importing…' : 'Import latest synced gear'}</button>
              <p>
                Need newer gear? Use
                {' '}
                <b>Sync Account Now</b>
                {' '}
                in the Progression Path RuneLite companion, wait for the website’s account sync, then import again. To compare owned upgrades instead, use
                {' '}
                <b>Use my bank gear</b>
                {' '}
                above the calculator.
              </p>
            </>
          ) : (
            <p>
              Open DPS Lab inside
              {' '}
              <a href="https://progressionpath.netlify.app/" target="_blank" rel="noopener noreferrer" className="underline">Progression Path</a>
              , sign in and select your linked character. A calculator opened on its own cannot read your private account snapshot.
            </p>
          )}
          <p className="text-xs text-gray-300">Only the selected comparison setup is replaced. Verify spells, charges, prayers and boosts after import. No full bank, login token or private journal is sent to the calculator.</p>
          <a href="https://oldschool.runescape.wiki/w/RS:WSHELP" target="_blank" rel="noopener noreferrer" className="underline">Optional WikiSync help ↗ (opens separately)</a>
        </div>
      </Modal>
    </>
  );
};
export default WikiSyncButton;
