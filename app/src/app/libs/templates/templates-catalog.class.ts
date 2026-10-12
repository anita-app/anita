import { IdCreator } from 'app/libs/id-creator/id-creator.class'
import { DateTools } from 'app/libs/tools/date-tools.class'
import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import type { TIconName } from 'app/libs/icons/icons.class'
import type { TSystemData } from 'app/models/project/project.declarations'
import type { ISection } from 'app/models/section/section.declarations'
import type { FormFieldsModel, TSupportedFormsTypes } from 'app/components/shared-components/forms-automator/form-automator.types'

/**
 * The catalog is maintained in https://github.com/anita-app/templates and downloaded at runtime,
 * so templates can be changed without releasing the app. Self-hosted installations can point to their own copy.
 */
export const TEMPLATES_URL = process.env.REACT_APP_TEMPLATES_URL || 'https://raw.githubusercontent.com/anita-app/templates/main/templates.json'

const CACHE_KEY = 'anita.templates.catalog'
const SUPPORTED_SCHEMA_VERSION = 1
const REQUEST_TIMEOUT_MS = 15000

export interface ITemplateCategory {
  id: string
  label: string
  icon?: TIconName
}

export interface ITemplateField {
  label: string
  fieldName: string
  componentCode: number
  type?: string
  options?: Array<{ value: string | number; label: string }>
  required?: boolean
}

export interface ITemplateSection {
  key: string
  title: string
  icon?: TIconName
  childOf?: Array<string>
  fields: Array<ITemplateField>
}

export interface IProjectTemplate {
  id: string
  title: string
  description: string
  category: string
  tags?: Array<string>
  icon?: TIconName
  sections: Array<ITemplateSection>
}

export interface ITemplatesCatalog {
  schemaVersion: number
  categories: Array<ITemplateCategory>
  templates: Array<IProjectTemplate>
}

export interface ILoadedCatalog {
  catalog: ITemplatesCatalog
  /** The catalog comes from the copy saved on this device, because the download failed. */
  fromCache: boolean
}

const isTemplate = (value: any): value is IProjectTemplate => (
  !!value && typeof value.id === 'string' && typeof value.title === 'string' && typeof value.category === 'string' &&
  Array.isArray(value.sections) && value.sections.length > 0 &&
  value.sections.every((section: any) => (
    typeof section?.key === 'string' && typeof section.title === 'string' && Array.isArray(section.fields) && section.fields.length > 0 &&
    section.fields.every((field: any) => typeof field?.fieldName === 'string' && typeof field.componentCode === 'number')
  ))
)

/**
 * Keeps only the templates the app can use, so that a mistake in one template does not break the gallery.
 */
const sanitizeCatalog = (raw: any): ITemplatesCatalog | null => {
  if (!raw || raw.schemaVersion !== SUPPORTED_SCHEMA_VERSION || !Array.isArray(raw.templates)) {
    return null
  }
  const categories: Array<ITemplateCategory> = Array.isArray(raw.categories) ? raw.categories.filter((category: any) => typeof category?.id === 'string' && typeof category.label === 'string') : []
  const templates: Array<IProjectTemplate> = raw.templates.filter(isTemplate)
  return { schemaVersion: raw.schemaVersion, categories, templates }
}

export class TemplatesCatalog {
  private static loading: Promise<ILoadedCatalog> | undefined

  /**
   * Downloads the catalog, falling back to the copy saved on this device.
   */
  public static load (): Promise<ILoadedCatalog> {
    if (!TemplatesCatalog.loading) {
      TemplatesCatalog.loading = TemplatesCatalog.doLoad().finally(() => {
        TemplatesCatalog.loading = undefined
      })
    }
    return TemplatesCatalog.loading
  }

  private static async doLoad (): Promise<ILoadedCatalog> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const response = await fetch(TEMPLATES_URL, { signal: controller.signal, cache: 'no-cache' })
      clearTimeout(timeout)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const catalog = sanitizeCatalog(await response.json())
      if (!catalog) {
        throw new Error('Unsupported catalog')
      }
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(catalog))
      } catch {
        // Storage full or disabled: the catalog is used anyway.
      }
      return { catalog, fromCache: false }
    } catch (error) {
      const cached = TemplatesCatalog.readCache()
      if (cached) {
        return { catalog: cached, fromCache: true }
      }
      throw error
    }
  }

  private static readCache (): ITemplatesCatalog | null {
    try {
      return sanitizeCatalog(JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null'))
    } catch {
      return null
    }
  }

  /**
   * Text used by the search box.
   */
  public static searchableText (template: IProjectTemplate): string {
    return [template.title, template.description, ...(template.tags ?? []), ...template.sections.map(section => section.title)].join(' ').toLowerCase()
  }

  /**
   * Builds a new project from a template, with new ids.
   */
  public static instantiate (template: IProjectTemplate, settings: { title: string; description: string }): TSystemData {
    const now = DateTools.getUtcIsoString()
    const sectionIds: Record<string, string> = {}
    template.sections.forEach((section) => {
      sectionIds[section.key] = IdCreator.make(`${template.id}-${section.key}`)
    })

    const sections: Array<ISection> = template.sections.map((section) => {
      const result: ISection = {
        id: sectionIds[section.key],
        title: section.title,
        createdAt: now,
        formModel: section.fields.map(field => ({ ...field })) as unknown as Array<FormFieldsModel<TSupportedFormsTypes>>,
      }
      if (section.icon) {
        result.icon = section.icon
      }
      const parents = (section.childOf ?? []).map(key => sectionIds[key]).filter(Boolean)
      if (parents.length) {
        result.childOf = parents
      }
      return result
    })

    return {
      [RESERVED_AUDS_KEYS._settings]: [{
        id: IdCreator.random(),
        title: settings.title,
        description: settings.description,
        createdAt: now,
        localStorage: LOCAL_STORAGE_SYSTEMS.IndexedDB,
      }],
      [RESERVED_AUDS_KEYS._sections]: sections,
    }
  }
}
