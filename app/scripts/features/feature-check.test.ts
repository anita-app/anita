/**
 * The feature catalogue check: the real catalogue of the app is valid, and each rule catches what it should on
 * small synthetic sources.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { checkFeatures } from './feature-check.ts'
import type { FeatureCheckConfig, GroupsFile, SurfaceItems } from './feature-check.ts'
import { readSurfaces } from './surfaces.ts'

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

describe('feature catalogue of the app', () => {
  test('is complete and grouped', () => {
    const config: FeatureCheckConfig = JSON.parse(readFileSync(join(APP, 'features.config.json'), 'utf8'))
    const groups: GroupsFile = JSON.parse(readFileSync(join(APP, config.groups), 'utf8'))
    const result = checkFeatures(APP, config, readSurfaces(APP, config), groups)
    expect(result.errors).toEqual([])
    expect(result.features.length).toBeGreaterThan(0)
  })
})

const FEATURE = (id: string, extra = '') => `/**
 * @feature ${id}
 * @title Title
 * @summary Summary.
 * @where Somewhere.
 * @usage Usage.
 * @options none
 * @rules Rules.
 * @errors none
 * @status stable
 * @since 0.21.0${extra ? `\n * ${extra}` : ''}
 */`

const config: FeatureCheckConfig = {
  sources: 'src',
  catalogue: 'catalogue.json',
  groups: 'groups.json',
  kinds: ['project', 'view', 'navigation'],
  statuses: ['stable', 'beta'],
  surfaces: [],
  docs: [],
}

function project (files: { [path: string]: string }): string {
  const root = mkdtempSync(join(tmpdir(), 'anita-features-'))
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(root, path, '..'), { recursive: true })
    writeFileSync(join(root, path), content)
  }
  return root
}

const grouped = (...ids: Array<string>): GroupsFile => ({ groups: [{ id: 'basics', title: 'Basics', goal: 'Goal.', features: ids }] })
const check = (files: { [path: string]: string }, groups: GroupsFile | undefined, surfaces: Array<SurfaceItems> = [], extraConfig: Partial<FeatureCheckConfig> = {}) =>
  checkFeatures(project(files), { ...config, ...extraConfig }, surfaces, groups)

describe('feature catalogue rules', () => {
  test('every export must declare @feature, @featurePart or @internal', () => {
    const { errors } = check({ 'src/a.ts': 'export function helper () {}\n/** @internal */\nexport const x = 1\n' }, grouped())
    expect(errors).toContain('src/a.ts:1 helper: missing @feature, @featurePart or @internal. Would a user notice if it changed or disappeared?')
  })

  test('test files and excluded files are not scanned', () => {
    const { errors } = check({ 'src/a.test.ts': 'export const x = 1\n', 'src/types/b.ts': 'export const y = 1\n' }, { groups: [] }, [], { exclude: ['^src/types/'] })
    expect(errors).toEqual([])
  })

  test('a feature needs every field and a valid id, status and version', () => {
    const { errors } = check({ 'src/a.ts': '/**\n * @feature thing\n * @summary S\n * @status maybe\n * @since 1\n */\nexport class A {}\n' }, grouped('thing'))
    expect(errors.some(error => error.includes('must be <kind>.<name>'))).toBe(true)
    for (const field of ['title', 'where', 'usage', 'options', 'rules', 'errors']) {
      expect(errors.some(error => error.includes(`has no @${field}`))).toBe(true)
    }
    expect(errors.some(error => error.includes('@status'))).toBe(true)
    expect(errors.some(error => error.includes('@since'))).toBe(true)
  })

  test('a standalone @feature block defines a feature; ids are unique', () => {
    const files = { 'src/a.tsx': `/** @internal */\nexport const A = () => {\n  ${FEATURE('view.a')}\n  const x = 1\n  return x\n}\n${FEATURE('view.a')}\nconst B = 2\n` }
    const { errors, features } = check(files, grouped('view.a'))
    expect(features.map(feature => feature.id)).toEqual(['view.a'])
    expect(features[0].source.symbol).toBe('x')
    expect(errors).toEqual([expect.stringMatching(/feature "view\.a" is already defined at src\/a\.tsx:3/)])
  })

  test('parts and related features must exist', () => {
    const { errors, features } = check({
      'src/a.ts': `${FEATURE('view.a', '@related view.nope')}\nexport class A {}\n/** @featurePart view.a, view.b */\nexport class B {}\n`,
    }, grouped('view.a'))
    expect(errors).toEqual([
      expect.stringMatching(/B: @featurePart points to unknown feature "view\.b"\.$/),
      expect.stringMatching(/@related of "view\.a" points to unknown feature "view\.nope"\.$/),
    ])
    expect(features[0].parts.map(part => part.symbol)).toEqual(['B'])
  })

  test('every surface item is listed by a feature; listed items exist', () => {
    const surfaces: Array<SurfaceItems> = [
      { name: 'screen', tag: 'routes', items: ['projectsList', 'projectAdd'] },
      { name: 'list view', tag: 'covers', items: ['view:table'] },
    ]
    const { errors } = check({ 'src/a.ts': `${FEATURE('view.a', '@routes projectsList, projectEdit\n * @covers view:table')}\nexport class A {}\n` }, grouped('view.a'), surfaces)
    expect(errors).toEqual([
      expect.stringMatching(/@routes of "view\.a" lists "projectEdit", which does not exist\.$/),
      'Screen "projectAdd" is not listed in the @routes of any feature.',
    ])
  })

  test('every feature is in exactly one valid group', () => {
    const files = { 'src/a.ts': `${FEATURE('view.a')}\nexport class A {}\n${FEATURE('view.b')}\nexport class B {}\n${FEATURE('view.c')}\nexport class C {}\n` }
    const groups: GroupsFile = {
      groups: [
        { id: 'one', title: 'One', goal: 'Goal.', features: ['view.a', 'view.nope'] },
        { id: 'Two', title: '', goal: 'Goal.', features: ['view.a'] },
        { id: 'three', title: 'Three', goal: 'Goal.', features: [] },
      ],
    }
    const { errors } = check(files, groups)
    expect(errors).toEqual([
      'groups.json: group "one" lists unknown feature "view.nope".',
      'groups.json: group "Two": "id" must be lowercase words separated by -.',
      'groups.json: group "Two": "title" is required.',
      'groups.json: group "Two": feature "view.a" is already in group "one" (a feature belongs to one group).',
      'groups.json: group "three": "features" must list at least one feature.',
      '2 feature(s) not in any group of groups.json: view.b, view.c. Group them (skills/feature-grouping/SKILL.md).',
    ])
    expect(check(files, undefined).errors).toContain('Groups file groups.json does not exist. Group the features (skills/feature-grouping/SKILL.md).')
  })

  test('docs targets reference features and groups; unknown references are always errors', () => {
    const files = {
      'src/a.ts': `${FEATURE('view.a')}\nexport class A {}\n${FEATURE('view.b')}\nexport class B {}\n`,
      'docs/guide.md': '<!-- feature-group: basics -->\n<!-- feature: view.a, view.gone -->\n',
    }
    const enforced = check(files, grouped('view.a', 'view.b'), [], { docs: [{ path: 'docs', enforce: true }] })
    expect(enforced.errors).toEqual([
      expect.stringMatching(/guide\.md references unknown feature "view\.gone"\.$/),
      'docs does not reference 1 feature(s): view.b',
    ])
    const reported = check(files, grouped('view.a', 'view.b'), [], { docs: [{ path: 'docs', enforce: false }, { path: 'missing', enforce: false }] })
    expect(reported.errors).toHaveLength(1)
    expect(reported.warnings).toEqual(['docs does not reference 1 feature(s): view.b', 'Docs target missing does not exist.'])
  })
})

describe('surfaces read from the sources', () => {
  test('enum members, object keys, enum references and shortcuts', () => {
    const root = project({
      'src/codes.ts': 'export enum CODES {\n  a = 1,\n  // comment\n  b = 2,\n}\nexport const PICKABLE = [\n  { value: CODES.b, label: "B" },\n]\n',
      'src/urls.ts': "export const URLS = {\n  // LIST\n  list: '/list',\n  edit: `/edit/${'x'}`,\n}\n",
      'src/c.tsx': "useShortcut({ key: 'Escape', callback })\nuseShortcut({ key: 's', withMetaKey: true, callback })\nconst key: 'c' | 'e' = add ? 'c' : 'e'\nuseShortcut({ key, callback })\n",
    })
    const surfaces = readSurfaces(root, {
      ...config,
      surfaces: [
        { name: 'code', tag: 'covers', prefix: 'code:', from: { type: 'enum', file: 'src/codes.ts', name: 'CODES' } },
        { name: 'pickable', tag: 'covers', prefix: 'pick:', from: { type: 'enum-refs', file: 'src/codes.ts', name: 'PICKABLE', enum: 'CODES' } },
        { name: 'screen', tag: 'routes', from: { type: 'object-keys', file: 'src/urls.ts', name: 'URLS' } },
        { name: 'shortcut', tag: 'shortcuts', from: { type: 'shortcuts', hook: 'useShortcut' } },
      ],
    })
    expect(surfaces.map(surface => surface.items)).toEqual([['code:a', 'code:b'], ['pick:b'], ['edit', 'list'], ['C', 'E', 'Escape', 'Mod+S']])
  })
})
