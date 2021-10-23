import { Injectable } from '@angular/core';
import { CLIENT_SECTIONS, CLIENT_SEZ_DEFINITIONS, previousVersions } from '@anita/client/data/client-sections.enum';
import { dbInstances } from '@anita/client/data/db-instances.const';
import { DbConnector } from '@anita/client/libs/db-connector/db-connector.class';
import { INDEXEDDB_PLUGIN } from '@anita/client/libs/db-connector/plugins/indexed-db/exporter.constant';
import { Logger } from '@anita/client/libs/logger/logger.class';
import { ProjectsListLoader } from '@anita/client/libs/projects-helpers/projects-handlers/projects-list-loader.class';
import { RouteListenerService } from '@anita/client/ng-services/app-routing/route-listener.service';
import { StateDataService } from '@anita/client/ng-services/state-data/state-data.service';
import { environment } from '../../../environments/environment';

/**
 * Handles initialization processes
 */
@Injectable({
  providedIn: 'root'
})
export class StartupperService {

  private systemDbName = 'anitaDB';

  constructor(
    private stateData: StateDataService,
    private routeListener: RouteListenerService
  ) { }

  public async init(): Promise<void> {
    Logger.info('Anita web app.');
    await this.initSystemIndexedDb(this.systemDbName);
    this.startRouteListener();
    this.setLoggerDebug();
    this.initRedux();
    this.loadExistingProject();
  }

  /**
   * Inits IndexedDB for system data
   */
  private async initSystemIndexedDb(indexedDbName: string): Promise<void> {
    dbInstances.system = await new DbConnector(CLIENT_SEZ_DEFINITIONS, INDEXEDDB_PLUGIN, { previousVersions, indexedDbName }, false).init();
  }

  /**
   * Starts route listener
   */
  private startRouteListener(): void {
    this.routeListener.startListening();
  }

  /**
   * Sets logger debug
   */
  private setLoggerDebug(): void {
    Logger.debug = !environment.production;
  }

  /**
   * Inits redux
   */
  private initRedux(): void {
    this.stateData.initRedux();
  }

  /**
   * Loads existing projects
   */
  private loadExistingProject(): void {
    new ProjectsListLoader().load();
  }

}
