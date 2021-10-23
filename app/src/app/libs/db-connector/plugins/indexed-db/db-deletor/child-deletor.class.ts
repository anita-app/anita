import { AbstractModel } from '@anita/client/libs/db-connector/constants/ds.constant';
import { DbConnectorInstance } from '@anita/client/libs/db-connector/models/executers';
import { QueryMaker } from '@anita/client/libs/db-connector/plugins/indexed-db/query-makers/query-maker.class';
import { Logger } from '@anita/client/libs/logger/logger.class';
import Dexie from 'dexie';

/**
 * Deletes all childe elements of a parent element just deleted.
 */
export class ChildDeletor {

  /**
   * List all children of the given parent element
   */
  private listChildren: Array<Object>;

  /**
   * Creates an instance of child deletor.
   * @param idDeletedParentElement id of the parent deleted element
   * @param childSez name of the section from where children element must be deleted
   */
  constructor(
    private dbConnector: DbConnectorInstance<Dexie>,
    private idDeletedParentElement: string,
    private childSez: keyof AbstractModel
  ) { }

  /**
   * First finds all children, then deletes them all.
   */
  public async do(): Promise<void> {
    this.setListChildren();
    return this.destoryChildsIfExist();
  }

  /**
   * Finds all elements with parent the id of the deleted element
   */
  private async setListChildren(): Promise<void> {
    this.listChildren = await new QueryMaker(this.dbConnector, this.childSez)
      .addWhere([this.dbConnector.DS[this.childSez].parentsIdentifiers as string, '=', this.idDeletedParentElement])
      .select() as Array<Object>;
  }

  /**
   * Loops over all child elements
   */
  private destoryChildsIfExist(): void {
    this.listChildren.forEach(childElement => this.destroyChild(childElement));
  }

  /**
   * Deletes the child element
   *
   * @param element the element to delete
   */
  private destroyChild<E>(element: E): void {
    const childArgs = {};
    childArgs[this.dbConnector.DS[this.childSez].pk] = element[this.dbConnector.DS[this.childSez].pk];
    new QueryMaker(this.dbConnector, this.childSez)
      .addWhere([this.dbConnector.DS[this.childSez].pk as string, '=', element[this.dbConnector.DS[this.childSez].pk]])
      .delete()
      .catch(err => Logger.error('Error in destroyChild', err));
  }

}
