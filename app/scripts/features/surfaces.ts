/**
 * Reads the user-facing surfaces of the app (screens, field types, views, shortcuts, error codes...) from the
 * sources, as configured in features.config.json, so the catalogue check knows what must be covered by a feature
 * without guessing. The sources are read as text: nothing of the app is imported.
 */
import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { isSourceFile, listFiles } from './feature-check.ts'
import type { FeatureCheckConfig, SurfaceConfig, SurfaceItems } from './feature-check.ts'

export function readSurfaces (root: string, config: FeatureCheckConfig): Array<SurfaceItems> {
  return config.surfaces.map(surface => ({
    name: surface.name,
    tag: surface.tag,
    items: [...new Set(readItems(root, config, surface))].map(item => `${surface.prefix || ''}${item}`).sort(),
  }))
}

function readItems (root: string, config: FeatureCheckConfig, surface: SurfaceConfig): Array<string> {
  const from = surface.from
  switch (from.type) {
    case 'enum':
      return Object.keys(bodyKeys(body(root, from.file, new RegExp(`\\benum\\s+${from.name}\\s*\\{`), surface)))
    case 'object-keys':
      return Object.keys(bodyKeys(body(root, from.file, new RegExp(`\\bconst\\s+${from.name}\\b[^=]*=\\s*\\{`), surface)))
    case 'enum-refs': {
      const text = body(root, from.file, new RegExp(`\\bconst\\s+${from.name}\\b[^=]*=\\s*[[{]`), surface)
      return [...text.matchAll(new RegExp(`\\b${from.enum}\\.([A-Za-z_$][\\w$]*)`, 'g'))].map(match => match[1])
    }
    case 'shortcuts':
      return readShortcuts(root, config, from.hook)
  }
}

/** Text between the braces (or brackets) opened at the end of the first match of `start`. */
function body (root: string, file: string, start: RegExp, surface: SurfaceConfig): string {
  const text = readFileSync(join(root, file), 'utf8')
  const match = start.exec(text)
  if (!match) {
    throw new Error(`features.config.json: surface "${surface.name}" not found in ${file} (${start}).`)
  }
  const open = match.index + match[0].length - 1
  return text.slice(open + 1, closing(text, open))
}

function closing (text: string, open: number): number {
  const pairs: { [char: string]: string } = { '{': '}', '[': ']', '(': ')' }
  const stack: Array<string> = []
  for (let i = open; i < text.length; i++) {
    const char = text[i]
    if (pairs[char]) {
      stack.push(pairs[char])
    } else if (char === stack[stack.length - 1] && (stack.pop(), !stack.length)) {
      return i
    }
  }
  return text.length
}

/** Top-level keys of an enum or object literal body. */
function bodyKeys (text: string): { [key: string]: true } {
  const keys: { [key: string]: true } = {}
  let depth = 0
  let start = 0
  const add = (entry: string) => {
    const key = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/|\s)*['"]?([A-Za-z_$][\w$-]*)['"]?\s*(?:[:=,]|$)/.exec(entry)
    if (key) {
      keys[key[1]] = true
    }
  }
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if ('{[('.includes(char)) {
      depth++
    } else if ('}])'.includes(char)) {
      depth--
    } else if (char === ',' && !depth) {
      add(text.slice(start, i))
      start = i + 1
    }
  }
  add(text.slice(start))
  return keys
}

/**
 * Keyboard shortcuts registered with the hook, as `Mod+Shift+Key` (`Mod` = Cmd on macOS, Ctrl elsewhere). A key
 * given by a variable is resolved from the string literals assigned to that variable in the same file.
 */
function readShortcuts (root: string, config: FeatureCheckConfig, hook: string): Array<string> {
  const shortcuts: Array<string> = []
  for (const path of listFiles(join(root, config.sources), isSourceFile)) {
    const text = readFileSync(path, 'utf8')
    for (const match of text.matchAll(new RegExp(`\\b${hook}\\(\\s*\\{`, 'g'))) {
      const open = match.index + match[0].length - 1
      const args = text.slice(open + 1, closing(text, open))
      const literal = /\bkey\s*:\s*['"]([^'"]+)['"]/.exec(args)?.[1]
      const variable = /\bkey\s*:\s*([A-Za-z_$][\w$]*)/.exec(args)?.[1] || (/(?:^|[,{\s])key\s*(?:,|$)/m.test(args) ? 'key' : '')
      const keys = literal
        ? [literal]
        : variable
          ? [...(new RegExp(`\\b(?:const|let)\\s+${variable}\\b[^=]*=([^\\n]*)`).exec(text)?.[1] || '').matchAll(/['"]([^'"]+)['"]/g)].map(found => found[1])
          : []
      if (!keys.length) {
        throw new Error(`${relative(root, path)}: cannot read the key of a ${hook}() call; use a string literal or a const with literals.`)
      }
      const modifiers = `${/\bwithMetaKey\s*:\s*true/.test(args) ? 'Mod+' : ''}${/\bwithShift\s*:\s*true/.test(args) ? 'Shift+' : ''}`
      for (const key of keys) {
        shortcuts.push(`${modifiers}${key.length === 1 ? key.toUpperCase() : key}`)
      }
    }
  }
  return shortcuts
}
