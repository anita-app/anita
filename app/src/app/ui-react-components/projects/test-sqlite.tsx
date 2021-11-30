import { getFileHandle, readFileAsUint8Array } from 'app/libs/db-connector/plugins/file-handles/helpers/fs-helper';
import initSqlJs from 'sql.js';

export const TsxSqlite = () => {

  const openDatabase = async () => {
    /**
     * 
     const filehandles = await getFileHandle();
     const filehandle = filehandles[0];
     
     var uint8View = await readFileAsUint8Array(filehandle);
     
     
     const SQL = await initSqlJs({
       locateFile: (file: string) => '/assets/sql-wasm.wasm'
      });
      
      // Create a database
      const db = new SQL.Database(uint8View);
      // NOTE: You can also use new SQL.Database(data) where
      // data is an Uint8Array representing an SQLite database file
      
      
      const res = db.exec("SELECT * FROM hello");
      
      const serialized = res[0].values.map(row => {
        const objData = {};
        row.forEach((cell, index) => objData[res[0].columns[index]] = cell);
        return objData;
      });
      console.log('openDatabase ~ serialized', serialized);
      
      // You can not use your statement anymore once it has been freed.
      // But not freeing your statements causes memory leaks. You don't want that.
      
      // Export the database to an Uint8Array containing the SQLite database file
      */




  }


  return (
    <div>
      <button className="rounded mt-3 ml-5 py-3 px-5 bg-gray-300" onClick={() => { openDatabase() }}>Open Database</button>
    </div>
  )
};
