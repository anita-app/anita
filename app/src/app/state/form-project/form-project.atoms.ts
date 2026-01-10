import { atom } from 'jotai'
import { PROJECT_EDITOR_MODE } from 'app/data/project-form-builder/project-editor-form-builder.const'
import { RESERVED_AUDS_KEYS } from 'app/models/project/project.declarations'
import type { TSystemData } from 'app/models/project/project.declarations'

const createEmptySystemData = (): Partial<TSystemData> => ({
  [RESERVED_AUDS_KEYS._settings]: [],
  [RESERVED_AUDS_KEYS._sections]: [],
})

export class FormProjectAtoms {
  public static original = atom<Partial<TSystemData>>(createEmptySystemData())
  public static project = atom<Partial<TSystemData>>(createEmptySystemData())
  public static mode = atom<PROJECT_EDITOR_MODE>(PROJECT_EDITOR_MODE.basic)
}
