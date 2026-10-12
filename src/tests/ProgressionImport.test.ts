import { describe, expect, test } from '@jest/globals';
import parseProgressionImport from '@/lib/ProgressionImport';
import { fetchShortlinkData, generateShortlink } from '@/utils';
import { GlobalState } from '@/state';

const fixture = () => ({
  schema: 'progression-path-dps/v1',
  character: {
    name: 'HP Shooter',
    skills: {
      Attack: 75, Strength: 80, Defence: 70, Hitpoints: 77, Ranged: 76, Magic: 75, Prayer: 70, Mining: 64, Herblore: 65,
    },
  },
  loadout: { slots: { weapon: { name: 'Abyssal whip', id: 4151 }, neck: { name: 'Amulet of glory(6)', id: 11978 }, shield: { name: 'Dragon defender', id: 12954 } } },
  target: { name: 'King Black Dragon' },
  source: { bankUpdatedAt: 1726000000 },
});
describe('Progression Path import boundary', () => {
  test('imports real levels and item aliases without carrying boosts', () => {
    const { player, name, unmatched } = parseProgressionImport(JSON.stringify(fixture()));
    expect(name).toBe('HP Shooter'); expect(player.skills.atk).toBe(75); expect(player.skills.mining).toBe(64);
    expect(player.equipment.weapon?.name).toBe('Abyssal whip'); expect(player.equipment.neck?.name).toContain('Amulet of glory'); expect(unmatched).toEqual([]);
    expect(player.prayers).toEqual([]); expect(player.boosts.atk).toBe(0); expect(player.buffs.onSlayerTask).toBe(false);
    expect(player.buffs.kandarinDiary).toBe(false);
  });
  test('rejects missing/invented max stats and wrong schemas', () => {
    const input = fixture(); delete (input.character.skills as Partial<typeof input.character.skills>).Magic;
    expect(() => parseProgressionImport(JSON.stringify(input))).toThrow('Magic');
    expect(() => parseProgressionImport(JSON.stringify({ ...fixture(), schema: 'other' }))).toThrow('setup export');
    expect(() => parseProgressionImport('x'.repeat(100001))).toThrow('too large');
  });
  test('unknown equipment is left empty, not fuzzy-matched to a stronger item', () => {
    const input = fixture(); input.loadout.slots.weapon = { name: 'Fake abyssal whip ultimate', id: 999999 };
    const result = parseProgressionImport(JSON.stringify(input)); expect(result.player.equipment.weapon).toBeNull(); expect(result.unmatched).toEqual(['Fake abyssal whip ultimate']);
  });
  test('two-handed imports remove the shield', () => {
    const input = fixture(); input.loadout.slots.weapon = { name: 'Dragon 2h sword', id: 7158 };
    const result = parseProgressionImport(JSON.stringify(input)); expect(result.player.equipment.weapon?.isTwoHanded).toBe(true); expect(result.player.equipment.shield).toBeNull();
  });
  test('ignores extra private fields and prototype keys', () => {
    const input = {
      ...fixture(), token: 'never-import', email: 'never-import', __proto__: { injected: true },
    };
    const result = parseProgressionImport(JSON.stringify(input)); expect(JSON.stringify(result)).not.toContain('never-import'); expect(Object.prototype).not.toHaveProperty('injected');
  });
  test('share links round-trip locally without making a network request', async () => {
    const data = new GlobalState().asImportableData;
    const id = await generateShortlink(data); expect(id.startsWith('pp1:')).toBe(true);
    expect(await fetchShortlinkData(id)).toEqual(data);
    await expect(fetchShortlinkData('old-wiki-id')).rejects.toThrow('Unrecognised');
  });
});
