/** @jest-environment jsdom */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import ProgressionBridge from '@/app/components/ProgressionBridge';

const mockStore = {
  selectedLoadout: 0, updatePreferences: jest.fn(), updatePlayer: jest.fn(), availableMonsters: [], updateMonster: jest.fn(),
};
const mockParse = jest.fn((text: unknown) => ({
  player: { name: 'Example · synced gear' }, name: 'Example', targetName: '', sourceLabel: 'last synced worn gear', snapshotUpdatedAt: '2026-10-16T02:00:00Z', unmatched: typeof text === 'string' ? [] : ['Invalid input'],
}));
jest.mock('@/state', () => ({ useStore: () => mockStore }));
jest.mock('@/lib/ProgressionImport', () => ({ __esModule: true, default: (text: unknown) => mockParse(text) }));

describe('companion import bridge', () => {
  const channel = 'a'.repeat(32);
  const parent = { postMessage: jest.fn() };
  const environment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
  beforeAll(() => { environment.IS_REACT_ACT_ENVIRONMENT = true; });
  afterAll(() => { delete environment.IS_REACT_ACT_ENVIRONMENT; });
  let root: Root;
  let host: HTMLDivElement;
  const statuses: { state: string; message: string }[] = [];
  const onStatus = (event: Event) => statuses.push((event as CustomEvent).detail);
  const reply = (data: Record<string, unknown>, origin = window.location.origin, source: unknown = parent) => act(() => {
    window.dispatchEvent(new MessageEvent('message', { data: { channel, ...data }, origin, source: source as Window }));
  });
  const request = () => {
    act(() => { window.dispatchEvent(new Event('pp-request-character-import')); });
    return [...parent.postMessage.mock.calls].reverse().find((call) => call[0].type === 'pp-dps-request-character')![0].requestId;
  };
  beforeEach(() => {
    jest.useFakeTimers(); statuses.length = 0; mockStore.selectedLoadout = 0;
    Object.defineProperty(window, 'parent', { value: parent, configurable: true });
    window.history.replaceState({}, '', `/?channel=${channel}`);
    host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
    window.addEventListener('pp-companion-import-status', onStatus);
    act(() => root.render(<ProgressionBridge />));
  });
  afterEach(() => {
    act(() => root.unmount()); host.remove(); jest.useRealTimers();
    window.removeEventListener('pp-companion-import-status', onStatus);
    Object.defineProperty(window, 'parent', { value: window, configurable: true });
  });
  test.each(['https://localhost', 'capacitor://localhost', 'null'])('accepts the bound native parent origin %s', (origin) => {
    const requestId = request(); expect(statuses.at(-1)?.state).toBe('loading');
    reply({ type: 'pp-dps-import', requestId, payload: {} }, origin);
    expect(mockStore.updatePlayer).toHaveBeenCalledTimes(1);
    expect(statuses.at(-1)?.message).toContain('last synced worn gear');
    expect(statuses.at(-1)?.message).toContain('Snapshot:');
  });
  test('rejects foreign windows, origins, channels and late request IDs', () => {
    const requestId = request();
    reply({ type: 'pp-dps-import', requestId, payload: {} }, window.location.origin, window);
    reply({ type: 'pp-dps-import', requestId, payload: {} }, 'https://foreign.invalid');
    reply({
      type: 'pp-dps-import', channel: 'b'.repeat(32), requestId, payload: {},
    });
    reply({ type: 'pp-dps-import', requestId: 'c'.repeat(32), payload: {} });
    expect(mockStore.updatePlayer).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(15001); });
    expect(statuses.at(-1)?.state).toBe('error');
    reply({ type: 'pp-dps-import', requestId, payload: {} });
    expect(mockStore.updatePlayer).not.toHaveBeenCalled();
  });
  test('keeps failed or switched comparison setups unchanged', () => {
    const requestId = request();
    reply({ type: 'pp-dps-import-failed', requestId, message: 'Sync this character first.' });
    expect(statuses.at(-1)?.message).toContain('Sync this character first.');
    const next = request(); mockStore.selectedLoadout = 1;
    reply({ type: 'pp-dps-import', requestId: next, payload: {} });
    expect(mockStore.updatePlayer).not.toHaveBeenCalled();
    expect(statuses.at(-1)?.message).toContain('comparison setup changed');
  });
});
