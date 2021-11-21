import { dbInstances } from 'app/data/db-instances.const';

export function isProjectLoaded(projectId: string): boolean {
  // The project has not been loaded yet
  // For now we only suppor the FileSystem, which requires user input to load the project
  // So we set the project to undefined and navigate to the project selection page
  // TODO: once other storage types are supported, we can try to load the project
  if (!dbInstances[projectId])
    return false;

  return true;
}