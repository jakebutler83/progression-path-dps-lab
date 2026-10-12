'use client';

import type { NextPage } from 'next';
import { Tooltip } from 'react-tooltip';
import React, { Suspense, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ToastContainer } from 'react-toastify';
import { IReactionPublic, reaction, toJS } from 'mobx';
import { IconAlertTriangle } from '@tabler/icons-react';
import MonsterContainer from '@/app/components/monster/MonsterContainer';
import { useStore } from '@/state';
import PlayerContainer from '@/app/components/player/PlayerContainer';
import PlayerVsNPCResultsContainer from '@/app/components/results/PlayerVsNPCResultsContainer';
import InitialLoad from '@/app/components/InitialLoad';
import LoadoutComparison from '@/app/components/results/LoadoutComparison';
import TtkComparison from '@/app/components/results/TtkComparison';
import ShareModal from '@/app/components/ShareModal';
import DebugPanels from '@/app/components/results/DebugPanels';
import NPCVersusPlayerResultsContainer from '@/app/components/results/NPCVersusPlayerResultsContainer';
import { CalcProvider, useCalc } from '@/worker/CalcWorker';
import LabOverview from './components/LabOverview';
import LabImport from './components/LabImport';
import ProgressionBridge from './components/ProgressionBridge';

const Home: NextPage = observer(() => {
  const calc = useCalc();
  const store = useStore();
  store.debug = process.env && process.env.NODE_ENV === 'development';

  useEffect(() => {
    store.setCalcWorker(calc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const globalKeyDownHandler = (e: KeyboardEvent) => {
    // We only handle events that occur outside <input>, <textarea>, etc
    if (e.target !== document.body) return;

    // Ignore if any modifier keys are held (to not interfere with browser/system shortcuts)
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;

    switch (e.key) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6': {
        // Handle quickly switching between loadouts (max 6)
        const key = parseInt(e.key) - 1;
        if (store.loadouts[key] !== undefined) {
          store.setSelectedLoadout(key);
        }
        break;
      }
      default:
        return;
    }

    // If we get here, we've handled the event, so prevent it bubbling
    e.preventDefault();
  };

  useEffect(() => {
    // Load preferences from browser storage if there are any
    store.loadPreferences();

    // Setup global event handling
    document.addEventListener('keydown', globalKeyDownHandler);

    return () => {
      document.removeEventListener('keydown', globalKeyDownHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const recompute = () => {
      store.doWorkerRecompute()
        .catch(console.error);
    };

    // When a calculator input changes, trigger a re-compute on the worker
    const triggers: ((r: IReactionPublic) => unknown)[] = [
      () => toJS(store.loadouts),
      () => toJS(store.monster),
      () => store.prefs.showTtkComparison,
      () => store.prefs.showNPCVersusPlayerResults,
      () => store.prefs.hitDistsHideZeros,
    ];
    const reactions = triggers.map((t) => reaction(t, recompute, { fireImmediately: true }));

    return () => {
      for (const r of reactions) {
        r();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="lab-page">
      <ProgressionBridge />
      {store.prefs.manualMode && (
        <button
          type="button"
          className="w-full bg-orange-500 text-white px-4 py-1 text-sm border-b border-orange-400 flex items-center gap-1"
          onClick={() => store.updatePreferences({ manualMode: false })}
        >
          <IconAlertTriangle className="text-orange-200" />
          Manual mode is enabled! Some things may not function correctly. Click here to disable it.
        </button>
      )}
      <Suspense>
        <InitialLoad />
      </Suspense>
      <LabOverview />
      <LabImport />
      {/* Main container */}
      <div className="lab-workbench" id="lab-workbench">
        <div className="lab-combat-grid">
          <section className="lab-column lab-player">
            <h2 className="lab-step">
              <b>01</b>
              Your loadout
              {' '}
              <span>STATS · GEAR · BUFFS</span>
            </h2>
            <PlayerContainer />
          </section>
          <section className="lab-column lab-monster">
            <h2 className="lab-step">
              <b>02</b>
              Your opponent
              {' '}
              <span>MONSTER · SCALING</span>
            </h2>
            <MonsterContainer />
          </section>
          <section className="lab-column lab-results">
            <h2 className="lab-step">
              <b>03</b>
              The verdict
              {' '}
              <span>COMPARE YOUR EDGE</span>
            </h2>
            <PlayerVsNPCResultsContainer />
          </section>
        </div>
      </div>
      {/* Additional graphs and stuff */}
      <div className="lab-analysis">
        <div className="lab-analysis-heading">
          <span className="lab-eyebrow">GO DEEPER</span>
          <h2>Small upgrades. Measurable gains.</h2>
          <p>Compare up to six setups. Change one item, prayer or level to see what moves the needle.</p>
        </div>
        {/* LoadoutComparison requires its own calc context */}
        <CalcProvider>
          <LoadoutComparison />
        </CalcProvider>
        <TtkComparison />
        <NPCVersusPlayerResultsContainer />
        <DebugPanels />
      </div>
      <Tooltip id="tooltip" />
      <Tooltip id="tooltip-warning" />
      <ToastContainer
        position="bottom-right"
        hideProgressBar
        draggable={false}
        limit={3}
        closeButton={false}
        className="text-sm"
      />
      <ShareModal />
    </div>
  );
});

export default Home;
