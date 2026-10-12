# Progression Path DPS Lab

An independently styled, **separate GPL-3.0 web application** forked from
[Weird Gloop's OSRS Wiki calculator](https://github.com/weirdgloop/osrs-dps-calc).
See `LICENSE`, `FORK-NOTICE.md`, and the original README/acknowledgements. The
upstream combat engine is retained, not replaced by an approximate calculator.
Public fork: https://github.com/jakebutler83/progression-path-dps-lab
Standalone hosting target: https://progression-path-dps-lab.netlify.app

## Local development

Use Node 22 or newer. The checked-in Yarn release avoids a global install:

```sh
node .yarn/releases/yarn-4.9.2.cjs install --immutable
node .yarn/releases/yarn-4.9.2.cjs dev
```

Open `http://127.0.0.1:4174`. `build` produces the static `out` directory.
For production preview, serve `out` locally after building. The UI uses bundled
item/monster images and browser workers; normal calculation needs no server API.

## Verification

```sh
node .yarn/releases/yarn-4.9.2.cjs test --runInBand --coverage=false
node .yarn/releases/yarn-4.9.2.cjs eslint src
node .yarn/releases/yarn-4.9.2.cjs build
node scripts/check-lab-browser.mjs
```

Browser QA needs Playwright and a local static preview on port 4174. Set
`PLAYWRIGHT_MODULE` to the installed Playwright module and, optionally,
`PLAYWRIGHT_CHANNEL=msedge` on Windows. Tests use only local fixture accounts.

## Publish separately

1. Push this public fork to `jakebutler83/progression-path-dps-lab`. The original
   repository is retained as the read-only `upstream` reference, not the push target.
2. Use the included `netlify.toml` in a **new, separate** hosting project. Set
   `NEXT_PUBLIC_BASE_URL` to its real HTTPS origin and leave
   `NEXT_PUBLIC_BASE_PATH` empty for root hosting.
3. Build and publish `out`, including `LICENSE.txt` and `FORK-NOTICE.md`. The
   footer links the public fork and complete GitHub source archive for this
   build's exact commit, including data, images, scripts and lockfile. Keep that
   revision publicly available for distributed builds. `yarn source:archive`
   can optionally package current working files as `.lab-qa/source.tar.gz` for
   offline development; it is not duplicated into the web/native bundle.
4. In the main Progression Path site, set
   `window.PROGRESSION_PATH_DPS_LAB_URL` to that published HTTPS address before
   `dps-lab.js` loads. Main-site launch controls remain hidden until configured.
5. Keep this engine and its build output out of the Capacitor/native app bundle.
   The main application contains only an original launcher/export adapter and
   opens the independently hosted calculator in a browser.

Recheck upstream fixes, dependency security, game-data currency and image/data
licensing before a public release. The upstream GPL code licence is not a grant
of rights to Jagex artwork/trademarks. Existing permission work remains relevant.

## Account import and privacy

The main site's DPS Lab tab exports `progression-path-dps/v1` JSON only on an
explicit click. It contains the chosen equipment names/IDs, character name,
nine synced base levels, target name and bank timestamp. It contains no login,
email, full bank, private journal or authentication token. No cross-origin
authenticated connection is created between the sites.

Import validates the schema and all nine levels, resolves exact item IDs/known
aliases, leaves unmatched gear empty, and clears a shield for a two-handed
weapon. It replaces only the selected setup. Prayers, potions, Slayer/diary
bonuses and charges are not inferred. Choose the combat style, spell, task
conditions and charges yourself before trusting results. Initial manual
templates are not automatically your character's stats or owned equipment.

The exported bank plan is a curated starting priority, **not proven optimal
DPS**. Use the calculator to compare alternatives and encounter-specific rules.

Setup sharing encodes loadouts/target in the URL fragment. No shortlink service
is contacted. Anyone receiving the link can read included names and setups;
do not treat it as encrypted/private storage. Browser-local session persistence
remains enabled. Optional, explicit Hiscores/Wiki Sync requests contact upstream
public endpoints; normal calculation/import/compare/share does not.
