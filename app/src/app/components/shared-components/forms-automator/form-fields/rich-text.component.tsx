import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { RichTextEditor } from 'app/components/shared-components/rich-text-editor/rich-text-editor'
import { RichTextEditorHelpers } from 'app/components/shared-components/rich-text-editor/rich-text-editor-helpers.class'
import { memo, useRef } from 'react'
import type { FC } from 'react'
import type { ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'
import type { Descendant } from 'slate'

/**
 * @feature field.long-text
 * @title Long text field
 * @summary A multi-line field with formatting (bold, headings, lists...) for notes, descriptions and any longer text.
 * @where Project editor: a field with Data type "Long text". Filled with a text editor with a toolbar in the form to add or edit a record; shown formatted on the details page, in the lists and as the description of the cards in grid view.
 * @usage In the project editor, give the field the Data type "Long text". When adding or editing a record, click in the editor (it shows "Enter text…" when empty), write, and format the text with the toolbar or the keyboard shortcuts. Save the record.
 * @options none: there is no Content type. The formatting available is described in "Format a long text".
 * @rules The text is saved with its formatting. A value written as plain text (e.g. imported, or saved before long texts had formatting) opens as a single paragraph. When a section has a Long text field, the form has two buttons: "Save", which keeps the form open, and "Save & Close"; otherwise there is only "Save". In grid view the first Long text field of the section is the description of each card, faded at the bottom when it is cut. Long texts are not shown in the tabs of linked records. The spell checker of the browser is active. If the field is required, its label shows the asterisk but the record can be saved with the editor empty.
 * @errors none
 * @status stable
 * @since 0.18.0
 * @covers field:richText
 * @related field.rich-text-formatting, field.required
 */
export const RichText: FC<ICommonFormEleProps> = memo(function BasicTextarea ({ formEle, element, handleChange }: ICommonFormEleProps) {
  const { current: initialValue } = useRef<Array<Descendant>>(RichTextEditorHelpers.makeInitialOutputData(element[formEle.fieldName]))

  const width = formEle.width ? formEle.width : 'w-full'

  if (element[formEle.fieldName] === undefined || element[formEle.fieldName] === null) {
    element[formEle.fieldName] = ''
  }

  const handleEditorChange = (value: Array<Descendant>) => {
    handleChange(formEle.fieldName, JSON.stringify(value))
  }

  return (
    <FormEleContainer width={width}>
      <FormElementLabel
        label={formEle.label!}
        required={!!formEle.required}
        labelHint={formEle.labelHint}
      />
      <RichTextEditor
        initialValue={initialValue}
        onChange={handleEditorChange}
      />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName])
