/**
 * Feature catalogue of the Anita app: collects the `@feature` tags from the sources, checks that the catalogue is
 * complete, that every feature belongs to a group, and (optionally) that the docs reference features and groups.
 * Run by `yarn build` (scripts/check-features.ts) and by the tests (feature-check.test.ts).
 *
 * Rules (see AGENTS.md → "Feature catalogue"):
 * 1. Every exported declaration in the sources declares exactly one of `@feature <id>`, `@featurePart <id>[, <id>]`
 *    or `@internal`. A `@feature` block can also stand alone (not before an export), anywhere in a file.
 * 2. A `@feature` has every required field (`none` allowed for options and errors); ids are `<kind>.<name>`,
 *    unique; `@featurePart` and `@related` point to existing ids.
 * 3. Surfaces are complete: every item of every surface in features.config.json (screens, field types, views,
 *    shortcuts, error codes...) is listed by at least one feature, in the tag of that surface; listed items exist.
 * 4. Every feature is in exactly one group of the groups file; groups are valid and not empty.
 * 5. Docs targets reference features with `<!-- feature: id -->` and groups with `<!-- feature-group: id -->`;
 *    with `enforce: false` missing references are only warnings. References to unknown ids are always errors.
 *
 * Plain TypeScript with erasable syntax only: Node runs it directly (`node scripts/check-features.ts`).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/** Fields every `@feature` must have. */
export const REQUIRED_FIELDS = ['title', 'summary', 'where', 'usage', 'options', 'rules', 'errors', 'status', 'since'] as const

export interface SourceRef {
  file: string
  line: number
  symbol: string
}

export interface Feature {
  id: string
  kind: string
  /** Name of the feature as a user would call it. */
  title: string
  summary: string
  where: string
  usage: string
  options: string
  rules: string
  status: string
  since: string
  related: Array<string>
  /** Items of the surfaces, by tag (routes, shortcuts, errors, covers). */
  surfaces: { [tag: string]: Array<string> }
  /** Group of the feature (from the groups file). */
  group?: string
  source: SourceRef
  parts: Array<SourceRef>
}

export interface Declaration extends SourceRef {
  kind: string
  tags: Tags
}

export interface Tags {
  [tag: string]: Array<string>
}

export interface FeatureGroup {
  id: string
  title: string
  /** What a user can do once they have read the material of this group. */
  goal: string
  /** Who the material is for, what they already know. */
  audience?: string
  /** Hints for whoever writes the material (order, examples, pitfalls). */
  notes?: string
  /** Feature ids, in the order the material should present them. */
  features: Array<string>
}

export interface GroupsFile {
  $comment?: string
  groups: Array<FeatureGroup>
}

export type SurfaceSource =
  | { type: 'object-keys', file: string, name: string }
  | { type: 'enum', file: string, name: string }
  | { type: 'enum-refs', file: string, name: string, enum: string }
  | { type: 'shortcuts', hook: string }

export interface SurfaceConfig {
  /** Name used in messages. */
  name: string
  /** Tag of the features listing the items of this surface. */
  tag: string
  /** Prefix of the items, e.g. `field:`. */
  prefix?: string
  from: SurfaceSource
}

export interface DocsTarget {
  path: string
  enforce: boolean
}

export interface FeatureCheckConfig {
  sources: string
  /** Regular expressions; matching files (path relative to the root) are not scanned. */
  exclude?: Array<string>
  catalogue: string
  catalogueMarkdown?: string
  groups: string
  kinds: Array<string>
  statuses: Array<string>
  surfaces: Array<SurfaceConfig>
  docs: Array<DocsTarget>
}

/** Items of each surface, as read from the sources. */
export interface SurfaceItems {
  name: string
  tag: string
  items: Array<string>
}

export interface FeatureCheckResult {
  features: Array<Feature>
  groups: Array<FeatureGroup>
  declarations: Array<Declaration>
  errors: Array<string>
  warnings: Array<string>
}

// ---------------------------------------------------------------------------------------------------------
// Parsing

const DECLARATION = /^export\s+(?:declare\s+)?(?:default\s+)?(?:abstract\s+)?(?:async\s+)?(class|function|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/

/** `@tag value` pairs of a JSDoc body; a value continues on the following lines until the next tag. */
export function parseTags (body: string): Tags {
  const tags: Tags = {}
  let current: { name: string, lines: Array<string> } | undefined
  const flush = () => {
    if (current) {
      (tags[current.name] = tags[current.name] || []).push(current.lines.join('\n').trim())
    }
  }
  for (const raw of body.split('\n')) {
    const line = raw.replace(/^\s*\*? ?/, '')
    const tag = /^@(\w+)\s?(.*)$/.exec(line)
    if (tag) {
      flush()
      current = { name: tag[1], lines: [tag[2]] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  flush()
  return tags
}

interface DocBlock {
  line: number
  tags: Tags
  /** Symbol of the declaration right after the block, if any. */
  symbol: string
}

/** Every JSDoc block of a file. */
export function parseBlocks (text: string): Array<DocBlock> {
  const blocks: Array<DocBlock> = []
  for (const match of text.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
    const after = text.slice(match.index + match[0].length).replace(/^\s+/, '')
    const symbol = /^(?:export\s+)?(?:declare\s+)?(?:default\s+)?(?:abstract\s+)?(?:async\s+)?(?:class|function|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/.exec(after)?.[1] ||
      /^([A-Za-z_$][\w$]*)\s*[(:=]/.exec(after)?.[1] || ''
    blocks.push({ line: lineOf(text, match.index), tags: parseTags(match[1]), symbol })
  }
  return blocks
}

/** Exported declarations of one file, with the tags of the JSDoc block right before them. */
export function parseDeclarations (file: string, text: string): Array<Declaration> {
  const declarations: Array<Declaration> = []
  let offset = 0
  for (const [index, line] of text.split('\n').entries()) {
    const match = DECLARATION.exec(line)
    if (match) {
      declarations.push({ file, line: index + 1, symbol: match[2], kind: match[1], tags: tagsBefore(text, offset) })
    }
    offset += line.length + 1
  }
  return declarations
}

/** Tags of the JSDoc block that ends right before `position` (only whitespace in between). */
function tagsBefore (text: string, position: number): Tags {
  const before = text.slice(0, position).replace(/\s+$/, '')
  if (!before.endsWith('*/')) {
    return {}
  }
  const start = before.lastIndexOf('/**')
  return start < 0 ? {} : parseTags(before.slice(start + 3, -2))
}

function lineOf (text: string, index: number): number {
  return text.slice(0, index).split('\n').length
}

/** Values of a tag as a list (`none` = empty), separated by commas, spaces or new lines. */
export function splitList (value: string | undefined): Array<string> {
  if (!value || value.trim() === 'none') {
    return []
  }
  return value.split(/[\s,]+/).map(item => item.trim()).filter(Boolean)
}

export function listFiles (dir: string, test: (name: string) => boolean): Array<string> {
  const files: Array<string> = []
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      files.push(...listFiles(path, test))
    } else if (test(entry)) {
      files.push(path)
    }
  }
  return files
}

export const isSourceFile = (name: string) => /\.(ts|tsx)$/.test(name) && !/\.d\.ts$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)

// ---------------------------------------------------------------------------------------------------------
// Checks

export function checkFeatures (root: string, config: FeatureCheckConfig, surfaces: Array<SurfaceItems>, groupsFile: GroupsFile | undefined): FeatureCheckResult {
  const errors: Array<string> = []
  const warnings: Array<string> = []
  const declarations: Array<Declaration> = []
  const features = new Map<string, Feature>()
  const parts: Array<{ id: string, ref: SourceRef }> = []
  const exclude = (config.exclude || []).map(pattern => new RegExp(pattern))
  const surfaceTags = new Set(surfaces.map(surface => surface.tag))
  const where = (ref: SourceRef) => `${ref.file}:${ref.line}${ref.symbol ? ` ${ref.symbol}` : ''}`

  const files = listFiles(join(root, config.sources), isSourceFile)
    .map(path => relative(root, path))
    .filter(file => !exclude.some(pattern => pattern.test(file)))

  for (const file of files) {
    const text = readFileSync(join(root, file), 'utf8')
    declarations.push(...parseDeclarations(file, text))

    // Rule 2: features, wherever their block is.
    for (const block of parseBlocks(text)) {
      if (!block.tags.feature) {
        continue
      }
      const ref: SourceRef = { file, line: block.line, symbol: block.symbol }
      if (block.tags.feature.length > 1) {
        errors.push(`${where(ref)}: one JSDoc block defines one feature (found ${block.tags.feature.length} @feature tags).`)
      }
      const feature = readFeature(block.tags, ref, config, surfaceTags, errors)
      if (!feature) {
        continue
      }
      const existing = features.get(feature.id)
      if (existing) {
        errors.push(`${where(ref)}: feature "${feature.id}" is already defined at ${existing.source.file}:${existing.source.line}.`)
        continue
      }
      features.set(feature.id, feature)
    }
  }

  // Rule 1: every export decides.
  for (const declaration of declarations) {
    const decisions = ['feature', 'featurePart', 'internal'].filter(tag => declaration.tags[tag])
    if (decisions.length !== 1) {
      errors.push(decisions.length
        ? `${where(declaration)}: use only one of @feature, @featurePart, @internal (found ${decisions.map(tag => `@${tag}`).join(', ')}).`
        : `${where(declaration)}: missing @feature, @featurePart or @internal. Would a user notice if it changed or disappeared?`)
      continue
    }
    if (declaration.tags.featurePart) {
      const ids = splitList(declaration.tags.featurePart[0])
      if (!ids.length) {
        errors.push(`${where(declaration)}: @featurePart needs at least one feature id.`)
      }
      for (const id of ids) {
        parts.push({ id, ref: { file: declaration.file, line: declaration.line, symbol: declaration.symbol } })
      }
    }
  }

  for (const { id, ref } of parts) {
    const feature = features.get(id)
    if (!feature) {
      errors.push(`${where(ref)}: @featurePart points to unknown feature "${id}".`)
    } else {
      feature.parts.push(ref)
    }
  }
  for (const feature of features.values()) {
    for (const related of feature.related) {
      if (!features.has(related)) {
        errors.push(`${where(feature.source)}: @related of "${feature.id}" points to unknown feature "${related}".`)
      }
    }
  }

  // Rule 3: surfaces.
  for (const tag of surfaceTags) {
    const known = new Set(surfaces.filter(surface => surface.tag === tag).flatMap(surface => surface.items))
    const listed = new Set<string>()
    for (const feature of features.values()) {
      for (const item of feature.surfaces[tag] || []) {
        listed.add(item)
        if (!known.has(item)) {
          errors.push(`${where(feature.source)}: @${tag} of "${feature.id}" lists "${item}", which does not exist${suggest(item, known)}.`)
        }
      }
    }
    for (const surface of surfaces.filter(candidate => candidate.tag === tag)) {
      for (const item of surface.items) {
        if (!listed.has(item)) {
          errors.push(`${capitalize(surface.name)} "${item}" is not listed in the @${tag} of any feature.`)
        }
      }
    }
  }

  // Rule 4: groups.
  const groups = groupsFile ? checkGroups(groupsFile, features, config.groups, errors) : []
  if (!groupsFile) {
    errors.push(`Groups file ${config.groups} does not exist. Group the features (skills/feature-grouping/SKILL.md).`)
  }

  // Rule 5: docs.
  for (const target of config.docs) {
    checkDocs(root, target, features, groups, errors, warnings)
  }

  return { features: [...features.values()].sort((a, b) => a.id.localeCompare(b.id)), groups, declarations, errors, warnings }
}

function readFeature (tags: Tags, ref: SourceRef, config: FeatureCheckConfig, surfaceTags: Set<string>, errors: Array<string>): Feature | undefined {
  const where = `${ref.file}:${ref.line}${ref.symbol ? ` ${ref.symbol}` : ''}`
  const id = tags.feature[0].trim()
  const [kind] = id.split('.')
  if (!/^[a-z0-9-]+\.[a-z0-9-]+$/.test(id) || !config.kinds.includes(kind)) {
    errors.push(`${where}: feature id "${id}" must be <kind>.<name> (lowercase, words separated by -) with kind in ${config.kinds.join(', ')}.`)
  }
  for (const field of REQUIRED_FIELDS) {
    if (!tags[field] || !tags[field][0].trim()) {
      errors.push(`${where}: feature "${id}" has no @${field}${field === 'options' || field === 'errors' ? ' (write "none" if there are none)' : ''}.`)
    }
  }
  if (tags.feature.length > 1 || tags.featurePart || tags.internal) {
    if (tags.featurePart || tags.internal) {
      errors.push(`${where}: a @feature block cannot also be @featurePart or @internal.`)
    }
  }
  const text = (tag: string) => (tags[tag]?.[0] || '').trim()
  const status = text('status')
  if (status && !config.statuses.includes(status)) {
    errors.push(`${where}: @status of "${id}" must be one of ${config.statuses.join(', ')}.`)
  }
  const since = text('since')
  if (since && !/^\d+\.\d+\.\d+$/.test(since)) {
    errors.push(`${where}: @since of "${id}" must be a version like 1.0.0.`)
  }
  const surfaces: { [tag: string]: Array<string> } = {}
  for (const tag of surfaceTags) {
    surfaces[tag] = splitList(tags[tag]?.join(','))
  }
  return {
    id,
    kind,
    title: text('title'),
    summary: text('summary'),
    where: text('where'),
    usage: text('usage'),
    options: text('options'),
    rules: text('rules'),
    status,
    since,
    related: splitList(tags.related?.[0]),
    surfaces,
    source: ref,
    parts: [],
  }
}

function checkGroups (file: GroupsFile, features: Map<string, Feature>, path: string, errors: Array<string>): Array<FeatureGroup> {
  const groups = Array.isArray(file.groups) ? file.groups : []
  if (!Array.isArray(file.groups)) {
    errors.push(`${path}: "groups" must be an array.`)
  }
  const groupOf = new Map<string, string>()
  const ids = new Set<string>()
  for (const [index, group] of groups.entries()) {
    const label = `${path}: group ${group.id ? `"${group.id}"` : `#${index + 1}`}`
    if (!group.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(group.id)) {
      errors.push(`${label}: "id" must be lowercase words separated by -.`)
    } else if (ids.has(group.id)) {
      errors.push(`${label}: id already used by another group.`)
    }
    ids.add(group.id)
    for (const field of ['title', 'goal'] as const) {
      if (typeof group[field] !== 'string' || !group[field].trim()) {
        errors.push(`${label}: "${field}" is required.`)
      }
    }
    if (!Array.isArray(group.features) || !group.features.length) {
      errors.push(`${label}: "features" must list at least one feature.`)
      continue
    }
    for (const id of group.features) {
      if (!features.has(id)) {
        errors.push(`${label} lists unknown feature "${id}".`)
      } else if (groupOf.has(id)) {
        errors.push(`${label}: feature "${id}" is already in group "${groupOf.get(id)}" (a feature belongs to one group).`)
      } else {
        groupOf.set(id, group.id)
        features.get(id)!.group = group.id
      }
    }
  }
  const ungrouped = [...features.keys()].filter(id => !groupOf.has(id)).sort()
  if (ungrouped.length) {
    errors.push(`${ungrouped.length} feature(s) not in any group of ${path}: ${ungrouped.join(', ')}. Group them (skills/feature-grouping/SKILL.md).`)
  }
  return groups
}

function checkDocs (root: string, target: DocsTarget, features: Map<string, Feature>, groups: Array<FeatureGroup>, errors: Array<string>, warnings: Array<string>) {
  const path = join(root, target.path)
  const report = target.enforce ? errors : warnings
  if (!existsSync(path)) {
    report.push(`Docs target ${target.path} does not exist.`)
    return
  }
  const groupIds = new Set(groups.map(group => group.id))
  const references = collectReferences(path)
  for (const [id, files] of references.features) {
    if (!features.has(id)) {
      errors.push(`${relative(root, files[0])} references unknown feature "${id}".`)
    }
  }
  for (const [id, files] of references.groups) {
    if (!groupIds.has(id)) {
      errors.push(`${relative(root, files[0])} references unknown feature group "${id}".`)
    }
  }
  const missingGroups = [...groupIds].filter(id => !references.groups.has(id))
  if (missingGroups.length) {
    report.push(`${target.path} does not reference ${missingGroups.length} feature group(s): ${missingGroups.join(', ')}`)
  }
  const missing = [...features.keys()].filter(id => !references.features.has(id)).sort()
  if (missing.length) {
    report.push(`${target.path} does not reference ${missing.length} feature(s): ${missing.join(', ')}`)
  }
}

/** `<!-- feature: a.b, c.d -->` and `<!-- feature-group: x -->` markers in a file or folder of Markdown/HTML. */
export function collectReferences (path: string): { features: Map<string, Array<string>>, groups: Map<string, Array<string>> } {
  const features = new Map<string, Array<string>>()
  const groups = new Map<string, Array<string>>()
  const files = statSync(path).isDirectory() ? listFiles(path, name => /\.(md|html|txt)$/.test(name)) : [path]
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/<!--\s*(features?|feature-groups?):\s*([^>]*?)\s*-->/g)) {
      const store = match[1].startsWith('feature-group') ? groups : features
      for (const id of match[2].split(/[\s,]+/).filter(Boolean)) {
        store.set(id, [...(store.get(id) || []), file])
      }
    }
  }
  return { features, groups }
}

function capitalize (text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function suggest (item: string, known: Set<string>): string {
  const prefix = item.includes(':') ? item.slice(0, item.indexOf(':') + 1) : item.includes('.') ? item.slice(0, item.indexOf('.') + 1) : ''
  const candidates = [...known].filter(candidate => prefix && candidate.startsWith(prefix))
  return candidates.length ? ` (known: ${candidates.join(', ')})` : ''
}
