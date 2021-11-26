import { Section } from 'app/data/project-structure/project-info';

export function findSectionById(sections: Array<Section>, toFindId: string): Section {
  return sections.find(section => section.id === toFindId);
}
