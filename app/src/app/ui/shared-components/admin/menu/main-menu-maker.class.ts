import {
  AnitaUniversalDataStorage,
  LocalProjectSettings,
  RESERVED_UDS_KEYS,
  Section
  } from '@anita/client/data/model/project-info';
import { stateData } from '@anita/client/ng-services/state-data/state-data.constant';
import { PROJECTS_GENERIC_WITH_PROJECTS, PROJECTS_GENERIC_WITHOUT_PROJECTS } from '@anita/client/ui/shared-components/admin/menu/non-project-menu.constant';
import { NbMenuItem } from '@nebular/theme';
import { select } from '@ngrx/store';
import { take } from 'rxjs/operators';

export class MainMenuMaker {

  constructor(
    private projects?: Array<LocalProjectSettings>,
    private project?: AnitaUniversalDataStorage
  ) { }

  public async make(): Promise<Array<NbMenuItem>> {

    this.projects = (this.projects) ? this.projects : await stateData.ngRxStore.pipe(select('projects'), take(1)).toPromise<Array<LocalProjectSettings>>();

    if (!this.projects.length)
      return [PROJECTS_GENERIC_WITHOUT_PROJECTS];

    const menuItems = [
      PROJECTS_GENERIC_WITH_PROJECTS
    ];

    this.project = (this.project) ? this.project : await stateData.ngRxStore.pipe(select('project'), take(1)).toPromise<AnitaUniversalDataStorage>();

    if (!this.project)
      return menuItems;

    menuItems.push({
      title: this.returnProjectTitle(this.project[RESERVED_UDS_KEYS._settings][0].title.toUpperCase()),
      group: true
    });

    if (!this.project)
      return menuItems;

    this.project[RESERVED_UDS_KEYS._sections].forEach(section => menuItems.push(this.buildMenuItem(section, this.project[RESERVED_UDS_KEYS._settings][0].id)));

    return menuItems;

  }

  private returnProjectTitle(title: string): string {
    const label = (title.length < 6) ? 'CURRENT PROJECT:' : 'PROJECT:';

    return (title.length < 11) ? `${label} ${title}` : title;
  }

  private buildMenuItem(section: Section, projectId: string): NbMenuItem {
    return {
      title: section.title,
      icon: 'chevron-right-outline',
      link: `/private/project/${projectId}/list/${section.id}`
    };
  }
}
