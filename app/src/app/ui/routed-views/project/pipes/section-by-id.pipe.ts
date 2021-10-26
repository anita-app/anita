import { Pipe, PipeTransform } from '@angular/core';
import { findSectionById } from '@anita/client/libs/tools/find-section-by-id.function';

@Pipe({
  name: 'sectionById'
})
export class SectionByIdPipe implements PipeTransform {

  /**
   * Finds a section by its name 
   */
  public transform = findSectionById;

}
