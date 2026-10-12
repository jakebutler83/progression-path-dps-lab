import React, { createRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import { IconClipboardCopy } from '@tabler/icons-react';
import { useStore } from '@/state';
import Modal from '@/app/components/generic/Modal';
import { generateShortlink } from '@/utils';

const ShareModal: React.FC = observer(() => {
  const store = useStore();
  const { ui } = store;
  const inputRef = createRef<HTMLInputElement>();

  const domain = typeof window === 'undefined' ? '' : `${/^https?:$/.test(window.location.protocol) ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_BASE_PATH || ''}/`;
  const [shareId, setShareId] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    async function generate() {
      setShareId('');
      setError(false);
      try {
        setShareId(await generateShortlink(store.asImportableData));
      } catch (e) {
        setError(true);
      }
    }

    if (ui.showShareModal) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.showShareModal]);

  return (
    <Modal
      isOpen={ui.showShareModal}
      setIsOpen={(b) => store.updateUIState({ showShareModal: b })}
      title="Share"
    >
      <div className="text-sm">
        <p>This link contains your loadouts and target in its fragment. Nothing is uploaded to the Wiki. Anyone you send the link to can read the included setups and names.</p>
        <div className="mt-2 flex gap-1">
          <input ref={inputRef} readOnly className="form-control w-full" value={shareId ? `${domain}#loadout=${encodeURIComponent(shareId)}` : 'Generating...'} />
          <button
            className="form-control flex items-center gap-1 hover:scale-105"
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(inputRef.current?.value as string).then(() => {
                toast('Copied share link to clipboard!', { toastId: 'share' });
              }).catch(() => {});
            }}
          >
            <IconClipboardCopy className="w-5" />
            Copy
          </button>
        </div>
        {error && (
          <p className="mt-2 text-red-400 dark:text-red-200">
            There was a problem generating a share link. Please try again.
          </p>
        )}
      </div>
    </Modal>
  );
});

export default ShareModal;
