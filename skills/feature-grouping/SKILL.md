---
name: feature-grouping
description: Group the features of the Anita app (the @feature tags of app/src) into app/features/groups.json, so that home page, guides and docs for non-expert users can be written group by group. Use it when `yarn features` or `yarn build` fails with "feature(s) not in any group", after adding, renaming or removing features, or when asked to review or reorganise the feature groups.
---

# Feature grouping

The build of the app fails when a feature is in no group (rules in `AGENTS.md` → "Feature catalogue"). This
skill is the grouping step: it decides where each feature goes so that whoever writes the home page, the guides
and the docs finds, in each group, the complete material of one guide.

Anita's users are not developers: they want to keep track of things (a collection, clients, a reading list),
not to learn a data model. Groups follow what they want to achieve, never the structure of the code.

## Steps

1. From `app/`, run `yarn features --list-ungrouped` (JSON of the features in no group, with all their fields)
   and read `features/groups.json` (the current groups) and `features/catalogue.md` if it exists. For a full
   review, read every feature in the sources: `grep -rn "@feature " src`.
2. For each ungrouped feature, read its fields (`title`, `summary`, `where`, `usage`, `rules`, `related`) and,
   when they are not enough, the code around the tag. Put it in the existing group whose guide a user would open
   to learn it. Create a new group only when no guide would cover it naturally.
3. Inside each group, order `features` as the guide should present them: first what a user needs first (the
   basic action), then variations, options, then limits and troubleshooting.
4. Run `yarn features` until it passes, then report what you changed: new groups, features moved, features
   that look duplicated or badly described (fix their tags only if asked).

## What makes a good group

- **One guide, one goal.** `goal` says what the user can do after reading, in their words ("Share a project
  with the members of your WordPress site"), not what the code does.
- **Size.** Usually 3 to 15 features. A group with one feature is fine only if the topic deserves a page of its
  own (e.g. a privacy rule); otherwise merge it. Split a group that would need a guide of many pages.
- **Order of the groups** is the order of a learning path: getting started, creating a project, adding records,
  views, fields, relations, storage and sync, import/export, templates, security, the app itself.
- **Errors and troubleshooting** stay with the feature that produces them (Dropbox errors with Dropbox sync), so
  each guide can end with "if something goes wrong".
- **Kinds are not groups.** `field.*` features can be in "Describe your data" and `view.*` in "See your records
  the way you need", but a field that only exists to link records belongs with relations.
- `audience`: who reads it and what they already know (e.g. "Has created a project; never used Dropbox").
- `notes`: hints for writers: screenshots to take, an example to follow through the guide, pitfalls users hit,
  features that should be mentioned on the home page.

## Format

```json
{
  "$comment": "Groups of the feature catalogue (AGENTS.md → Feature catalogue). Maintained with skills/feature-grouping.",
  "groups": [
    {
      "id": "getting-started",
      "title": "Getting started",
      "goal": "Open Anita, understand where your data is kept and create your first project.",
      "audience": "First-time users.",
      "notes": "Home page material: privacy and offline first.",
      "features": ["app.offline", "project.create"]
    }
  ]
}
```

Rules checked by the build: unique lowercase `id` with `-`, non-empty `title`, `goal` and `features`, every
listed id exists, every feature is in exactly one group.
