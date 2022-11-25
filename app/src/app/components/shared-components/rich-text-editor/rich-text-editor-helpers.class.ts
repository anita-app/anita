import { Descendant } from 'slate'

export class RichTextEditorHelpers {
  public static makeInitialOutputData = (rawValue: string): Array<Descendant> => {
    try {
      if (rawValue.startsWith('[')) {
        return JSON.parse(rawValue)
      }
      return [
        {
          type: 'paragraph',
          children: [
            { text: rawValue }
          ]
        } as any
      ]
    } catch (error) {
      return []
    }
  }
}
