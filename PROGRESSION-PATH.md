# Progression Path DPS Lab

An independently styled, **GPL-3.0 calculator module** forked from
[Weird Gloop's OSRS Wiki calculator](https://github.com/weirdgloop/osrs-dps-calc).
See `LICENSE`, `FORK-NOTICE.md`, and the original README/acknowledgements. The
upstream combat engine is retained, not replaced by an approximate calculator.
Public fork: https://github.com/jakebutler83/progression-path-dps-lab
Hosted only within Progression Path: https://progressionpath.netlify.app/dps-calculator/

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

## Build within Progression Path

1. Push this public fork to `jakebutler83/progression-path-dps-lab`. The original
   repository is retained as the read-only `upstream` reference, not the push target.
2. Keep `NEXT_PUBLIC_BASE_URL=https://progressionpath.netlify.app` and
   `NEXT_PUBLIC_BASE_PATH=/dps-calculator`. There is no standalone hosting project.
3. The main site's `scripts/prepare-dps.mjs` builds the exact public revision
   pinned in `dps-engine.json` and copies `out` to its `/dps-calculator/` directory,
   including `LICENSE.txt` and `FORK-NOTICE.md`. The
   footer links the public fork and complete GitHub source archive for this
   build's exact commit, including data, images, scripts and lockfile. Keep that
   revision publicly available for distributed builds. `yarn source:archive`
   can optionally package current working files as `.lab-qa/source.tar.gz` for
   offline development; it is not duplicated into the web/native bundle.
4. The DPS Lab tab displays this module inside the existing site. Explicit bank
   setup imports use a source-window/origin/channel-checked message bridge;
   users do not download/upload files or navigate to another website.
5. The native app displays the hosted module inside its DPS Lab tab. The engine
   is not copied into the Capacitor IPA. A connection is needed to load it.

Recheck upstream fixes, dependency security, game-data currency and image/data
licensing before a public release. The upstream GPL code licence is not a grant
of rights to Jagex artwork/trademarks. Existing permission work remains relevant.

## Account import and privacy

The main site's DPS Lab tab sends `progression-path-dps/v1` JSON only on an
explicit click. It contains the chosen equipment names/IDs, character name,
nine synced base levels, target name and bank timestamp. It contains no login,
email, full bank, private journal or authentication token. No authentication
connection is created for the calculator.

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
is disabled when embedded, and the frame resets when the active character changes.
Direct share-link sessions retain local persistence. Optional, explicit Hiscores
requests contact upstream public endpoints; normal calculation/import/compare/share
does not.

### Companion gear import (October 16)

The RuneLite button inside the embedded calculator requests a sanitized setup
from the signed-in Progression Path shell, rather than probing local WikiSync
WebSockets. It imports the active character's latest synced base levels and worn
equipment, preserving the current target. Bank-priority imports remain separate.
The snapshot time is shown; this is not a live connection to the desktop client.
Only explicit user clicks trigger an import, and matching window/origin/channel,
request ID, character/member/group ownership and comparison-setup checks prevent
cross-account or late responses. Unknown equipment remains empty with a warning.

This works with desktop and native iOS parent origins, including opaque WKWebView
origins. Older native shells need an app update for the new request handler; they
can continue using the existing bank-setup controls. Standalone calculator pages
cannot read private account data and direct users back to the main app. External
help opens separately, never inside the calculator frame. Import dialogs use the
visible parent viewport so they stay reachable in long phone-sized iframe pages.
