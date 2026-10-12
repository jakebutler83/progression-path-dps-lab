# Progression Path DPS Lab

An independent fork of Weird Gloop's OSRS Wiki DPS calculator, licensed under
GNU GPL version 3. Not an official OSRS Wiki, Jagex or RuneLite product.

Upstream: https://github.com/weirdgloop/osrs-dps-calc
Pinned upstream revision: 89c3e25b344aea90d0189746e4b5f73dde0f0383

Progression Path modifications dated October 11, 2026:
- Combat-workbench layout, responsive theme, target shortcuts and live metrics.
- Explicit local JSON import from Progression Path; no login or bank API access.
- Local-only calculation and fragment-based share links; no Wiki shortlink uploads.
- Removed click telemetry. Self-hosted existing item/monster images.
- Updated the Next.js build dependency to the patched 15.5 release line.

Calculation algorithms and regression tests are retained from upstream. They are
not guaranteed to support every future item or mechanic. Accuracy depends on
equipment, charges, prayers, styles, raid scaling and monster phase. Expected
time to kill assumes attack uptime and does not model every encounter.

Original software copyright belongs to its contributors, including Jayden Bailey
and Weird Gloop. See LICENSE and upstream history. GPL does not grant rights to
Jagex artwork or trademarks. Wiki-derived game data/images retain their notices:
https://oldschool.runescape.wiki/w/RuneScape:Copyrights

This is a separate static web application. Do not copy its engine into the
Progression Path Capacitor bundle without reviewing distribution terms.
Publish complete corresponding fork source with every distributed build,
including modified source, build scripts and the exact dependency lockfile.
The public footer links the complete GitHub source archive for the exact build
commit: https://github.com/jakebutler83/progression-path-dps-lab
