# Anita — notes for agents

Repository layout: `app/` is the React app (Vite, Yarn 4 workspace), `landing/` the website (YASSB),
`anita-app.github.io/` the published files (not tracked). Commands of the app run from `app/`:
`yarn build`, `yarn typecheck`, `yarn test`, `yarn lint`, `yarn features`.

## Feature catalogue

Every feature of the app is declared in the code with a `@feature` JSDoc tag, and every feature belongs to a
group in `app/features/groups.json`. The build (`yarn build`, and `yarn features` alone) fails when the catalogue
is incomplete or a feature is in no group, and writes the grouped catalogue to `app/features/catalogue.json` and
`app/features/catalogue.md`. Home page, guides and docs are written by people or agents, not generated: the
catalogue guarantees that nothing is forgotten, and the groups say which material explains what.

Users of Anita are not developers. A feature is anything a user can see, do, choose or run into: a screen, a
button, a field type, a view, an option, a shortcut, a message, a rule of how data is saved or synced.

### 1. Decide for every export

Each exported declaration in `app/src/` (except `*.test.ts(x)`, `src/types/` and the generated `version.ts`)
carries, in the JSDoc block right before it, exactly one of:

- `@feature <kind>.<name>` — it *defines* something a user can see or do;
- `@featurePart <id>[, <id>]` — it implements part of features defined elsewhere (a sub-component, the state or
  the class behind a screen, the model of a field type);
- `@internal` — an implementation detail no user would notice (helpers, stores, generic UI pieces, types).

How to choose: ask "would a user notice if this changed or disappeared?". If yes, it is a feature or part of one.
Unexported code needs no tag. A feature that lives inside a component, not on an export, can be defined by a
standalone `@feature` block anywhere in the file (one block = one feature).

### 2. Fields of a `@feature`

All required (`none` allowed for options and errors). They describe what whoever documents the feature must
cover, in plain words, not the text of the docs.

| Tag | Content |
|---|---|
| `@feature` | id `<kind>.<name>`, lowercase with `-`. Kinds (in `features.config.json`): project, section, record, field, view, relation, storage, sync, import, export, template, security, navigation, app |
| `@title` | name of the feature as a user would call it ("Hide columns in a table") |
| `@summary` | one line: what it does for the user |
| `@where` | where it is in the app: screen, menu, button label |
| `@usage` | the steps to use it |
| `@options` | choices the user has, defaults |
| `@rules` | behaviour, limits, edge cases, messages the user can see |
| `@errors` | error codes the user can run into (`dropbox.authFailed`, `wordpress.forbidden`...) or `none` |
| `@status` | stable, beta, experimental, deprecated |
| `@since` | version that introduced it. Not released yet: the next release, choosing yourself whether it is a major, minor or patch release of the last released version (CHANGELOG.md) from the kind of changes found; if in doubt, ask |
| `@routes` | optional: screens (keys of `ANITA_URLS`) where it lives |
| `@shortcuts` | optional: keyboard shortcuts, as `Mod+S`, `Escape`, `C` (`Mod` = Cmd on macOS, Ctrl elsewhere) |
| `@covers` | optional: items of the enumerated surfaces below (`field:richText`, `view:grid`, `input-type:email`...) |
| `@related` | optional: other feature ids |

### 3. Surfaces checked automatically

Read from the sources (`features.config.json` → `surfaces`), each item must be listed by at least one feature:
screens (`ANITA_URLS` → `@routes`), keyboard shortcuts (`useShortcut` calls → `@shortcuts`), WordPress and
Dropbox error codes (→ `@errors`), and in `@covers`: field types the user can pick (`field:`), input types
(`input-type:`), validators (`validator:`), list views (`view:`), cloud services (`cloud:`), export scopes
(`export-scope:`). Add a surface to the config when the app gets a new registry of user-visible choices.

### 4. Groups

`app/features/groups.json` sorts the features by what users want to achieve. Each group is the material of one
guide (and of a section of the home page); a feature is in exactly one group. Fields: `id`, `title`, `goal`
(what the user can do after reading), optional `audience` and `notes` (hints for writers), `features` (ids in
the order the guide should present them).

Grouping is a separate step, done by an agent with `skills/feature-grouping/SKILL.md` after features are added
or changed. `yarn features --list-ungrouped` prints the features that are in no group.

### 5. Docs coverage

Each docs target in `features.config.json` must reference every feature with `<!-- feature: id -->` next to the
text that covers it, and every group with `<!-- feature-group: id -->` (several ids separated by commas). Targets
with `enforce: false` only report what is missing; references to unknown ids are always errors. Set
`enforce: true` once the docs exist.

When you add or change a feature: tag it, run `yarn features`, group it if the build asks, update the docs.
