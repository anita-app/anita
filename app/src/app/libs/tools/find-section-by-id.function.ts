import { Section } from '@anita/client/data/model/project-info';

export function findSectionById(sections: Array<Section>, toFindId: string): Section {
  return sections.find(section => section.id === toFindId);
}
