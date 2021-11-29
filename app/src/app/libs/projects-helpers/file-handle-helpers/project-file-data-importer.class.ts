import { AnitaUniversalDataStorage } from 'app/data/project-structure/project-info';
import { FileSystemFileHandle } from 'app/libs/db-connector/plugins/file-handles/helpers/file-system-access-api';
import { getFileHandle, readFileHandleAsText } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper';

/**
 * Imports one or more existing project files, and then calls `SaveProjectSettingsInIndexedDB`.
 * Also sets the last imported project as the current one by calling `CurrentProjectSetter`.
 *
 * @see SaveProjectSettingsInIndexedDB
 * @see CurrentProjectSetter
 */
export class ProjectFileDataImporter {

  /**
   * List of FileSystemFileHandle for each project to import
   */
  private fileHandle: FileSystemFileHandle;
  /**
   * The file contents of each project to import
   */
  private fileContents: string;
  /**
   * The project data of each project to import
   */
  private projectData: AnitaUniversalDataStorage;

  /**
   * Asks for the files to import and processes them, then sets the current project as the last one imported 
   */
  public async import(): Promise<{ project: AnitaUniversalDataStorage, fileHandle: FileSystemFileHandle }> {
    await this.askForFile();
    await this.setFileContents();
    this.parseFileContents();
    return { project: this.projectData, fileHandle: this.fileHandle };
  }

  /**
   * Asks for user permission to open a file
   */
  private async askForFile(): Promise<void> {
    const fileHandles = await getFileHandle();
    this.fileHandle = fileHandles[0];
  }

  /**
   * Saves the project settings in IndexedDB and adds the project to the project list 
   */
  private async setFileContents(): Promise<void> {
    this.fileContents = await readFileHandleAsText(this.fileHandle);
  }

  /**
   * Converts the string of the project to the type `AnitaUniversalDataStorage`
   */
  private parseFileContents(): void {
    this.projectData = JSON.parse(this.fileContents);
  }

}
