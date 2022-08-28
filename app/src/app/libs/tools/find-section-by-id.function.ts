import { ISection } from 'app/data/project-structure/project-info';

export function findSectionById(sections: Array<ISection>, toFindId: string): ISection {
  return sections.find(section => section.id === toFindId);
}
