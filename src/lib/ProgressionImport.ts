// Progression Path modifications, 2026-10-11. GPL-3.0; see LICENSE.
import { availableEquipment, getCanonicalItemId } from '@/lib/Equipment';
import { generateEmptyPlayer } from '@/state';
import { PlayerEquipment, PlayerSkills } from '@/types/Player';
import { getCombatStylesForCategory } from '@/utils';
import { EquipmentCategory } from '@/enums/EquipmentCategory';

const skills: Record<keyof PlayerSkills, string> = {
  atk: 'Attack', def: 'Defence', hp: 'Hitpoints', magic: 'Magic', prayer: 'Prayer', ranged: 'Ranged', str: 'Strength', mining: 'Mining', herblore: 'Herblore',
};
const normalize = (name: string) => name.toLowerCase().replace(/[’]/g, "'").replace(/\s*\(/g, '(').trim();
const object = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {});

export default function parseProgressionImport(text: string) {
  if (text.length > 100000) throw new Error('Import is too large. Export only a selected setup, not your whole bank.');
  const input = object(JSON.parse(text));
  if (input.schema !== 'progression-path-dps/v1') throw new Error('Choose a Progression Path DPS setup export.');
  const character = object(input.character);
  const levels = object(character.skills);
  const setup = object(input.loadout);
  const slots = object(setup.slots);
  const name = typeof character.name === 'string' ? character.name.slice(0, 30) : 'Adventurer';
  const player = generateEmptyPlayer(`${name} · bank setup`);
  // The upstream manual template enables these. An account export does not
  // prove either condition, so imported setups must start without the bonuses.
  player.buffs.onSlayerTask = false;
  player.buffs.kandarinDiary = false;
  for (const [key, skill] of Object.entries(skills)) {
    const value = levels[skill];
    if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 99) throw new Error(`A synced base ${skill} level (1–99) is required. No max-stat assumptions are made.`);
    player.skills[key as keyof PlayerSkills] = Number(value);
  }
  const unmatched: string[] = [];
  for (const key of Object.keys(player.equipment) as (keyof PlayerEquipment)[]) {
    const item = object(slots[key]);
    const id = Number.isInteger(item.id) && Number(item.id) > 0 ? getCanonicalItemId(Number(item.id)) : 0;
    const itemName = typeof item.name === 'string' ? item.name.slice(0, 100) : '';
    if (!id && !itemName) continue;
    const found = availableEquipment.find((eq) => eq.slot === key && (id ? eq.id === id : normalize(eq.name) === normalize(itemName)));
    if (found) player.equipment[key] = { ...found };
    else unmatched.push(itemName || `Item ${id}`);
  }
  if (player.equipment.weapon?.isTwoHanded) player.equipment.shield = null;
  const styles = getCombatStylesForCategory(player.equipment.weapon?.category ?? EquipmentCategory.NONE);
  // Use the engine's own weapon styles. Users must explicitly choose spells,
  // prayers, potions, charges and task buffs after import.
  player.style = styles.find((style) => style.stance === 'Rapid') || styles[0] || player.style;
  const target = object(input.target);
  return {
    player, name, unmatched, targetName: typeof target.name === 'string' ? target.name.slice(0, 100) : '', bankUpdatedAt: object(input.source).bankUpdatedAt,
  };
}
