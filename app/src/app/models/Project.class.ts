import { LOCAL_STORAGE_SYSTEMS } from 'app/data/local-dbs/local-storage-systems.enum';
import { IProjectSettings } from 'app/data/project-structure/project-info';

export class Project implements IProjectSettings {

  id: string;
  title: string;
  description: string;
  createdAt: string;
  localStorage: LOCAL_STORAGE_SYSTEMS;
  updatedAt?: string;
  encrypted?: boolean;

  constructor(
    private projectSettings: IProjectSettings
  ) {
    this.id = projectSettings.id;
    this.title = projectSettings.title;
    this.description = projectSettings.description;
    this.createdAt = projectSettings.createdAt;
    this.localStorage = projectSettings.localStorage;
    this.updatedAt = projectSettings.updatedAt;
    this.encrypted = projectSettings.encrypted;
  }

}