import { Pipe, PipeTransform } from '@angular/core';
import { Section } from '@anita/client/data/model/project-info';

@Pipe({
  name: 'sectionById'
})
export class SectionByIdPipe implements PipeTransform {

  /**
   * Finds a section by its name 
   */
  public transform(sections: Array<Section>, toFindId: string): Section {
    return sections.find(section => section.id === toFindId);
  }

}
