/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICommonFormEleProps } from 'app/components/shared-components/forms-automator/form-automator.types'
import { FormEleContainer } from 'app/components/shared-components/forms-automator/form-layout/form-ele-container.component'
import { FormElementLabel } from 'app/components/shared-components/forms-automator/form-layout/form-element-label.component'
import { RichTextEditor } from 'app/components/shared-components/rich-text-editor/rich-text-editor'
import { RichTextEditorHelpers } from 'app/components/shared-components/rich-text-editor/rich-text-editor-helpers.class'
import React, { memo, useRef } from 'react'
import { Descendant } from 'slate'

export const RichText: React.FC<ICommonFormEleProps> = memo(function BasicTextarea ({ formEle, element, handleChange }: ICommonFormEleProps) {
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
      <FormElementLabel label={formEle.label!} labelHint={formEle.labelHint} />
      <RichTextEditor initialValue={initialValue} onChange={handleEditorChange} />
    </FormEleContainer>
  )
}, (prevProps, nextProps) => prevProps.element[prevProps.formEle.fieldName] === nextProps.element[nextProps.formEle.fieldName])
