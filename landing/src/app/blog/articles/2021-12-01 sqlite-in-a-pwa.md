---
title: SQLite in a PWA with FileSystemAccessAPI
description: How to use a Sqlite database in a PWA with FileSystemAccessAPI
date: 2021-12-01
author: ilDon
type: Article
slug: sqlite-in-a-pwa-with-file-system-access-api
image: sqlite-in-a-pwa/database-free.png
---
Anita now supports SQLite, which means you can save your data in a local database on your device from a Progressive Web App.

This is achieved by using the [`FileSystemAccessAPI`](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API), so the user only needs to choose where to keep the database once, and then the PWA can perform all CRUD operations it needs, with some caveats.

Before we proceed further in understanding how this works, let's first clear the air about the reason for implementing SQLite in a PWA with the `FileSystemAccessAPI`. 

SQLite is a database that is used to store data in a local file system, and the `FileSystemAccessAPI` is a way to access that file system. So combining the two a PWA can access the database and perform CRUD operations on it. And because Anita is an offline <s>first</s> only app, that is a very good match.

An even better reason, though, is well described by paraphrasing a quote from Michael Crichton's Jurassic Park:

> I was so preoccupied over whether or not I could, I didn't stop to think if *I should*.

<!-- /preview -->

I'll skip the parts on what is and how to use SQLite, and the `FileSystemAccessAPI`. Both have very good documentation, so I'll just jump straight to the "how to combine the two".

## SQLite in the browser

First, let's start by looking at how to use SQLite in the browser.

Normally, in NodeJS you can use the NPM package [`sqlite`](https://www.npmjs.com/package/sqlite). In a PWA however, it won't work because it relies on bindings that are not available in the browser.

Luckily enough, there is an excellent library called [`sql.js`](https://www.npmjs.com/package/sql.js) that is precisely aimed at making SQLite work in the browser. So we can use it to create a database in the browser, without having to reinvent the wheel to perform CRUD operations on the database.

## Let's create a database

To create a database, we need to import the `sql.js` library and create a new database. I'll skip the details of how to do this, for an in-depth guide, see the docs for [`sql.js`](https://sql.js.org/documentation/).

The first time we do this we can simply initialize an empty database, so we do not need (yet) to use the `FileSystemAccessAPI`:

    import initSqlJs from 'sql.js';
    const SQL = await initSqlJs({
      locateFile: () => '/path-to-the-wasm-file/sql-wasm.wasm'
    });
    const db = new SQL.Database();

Then we can perform CRUD operations on the database:

    db.run("CREATE TABLE IF NOT EXISTS people (name TEXT, age INT)");

And that's it. We are using SQLite in the browser thanks to the `sql.js` library.

The only downside, so far, is that the `db` is only stored in memory, and will be lost when the browser is closed.

And here is where the `FileSystemAccessAPI` comes in.

## Let's use the `FileSystemAccessAPI` to store the database on the device

To write to the file system with the `FileSystemAccessAPI` we need to get a `FileSystemFileHandle` `Object`. We will see later how to get one, first let's see how the `fileHandle` works for writing to the file system.

The `FileSystemFileHandle` `Object` has a convenient method `write` that we can use to write to the file. It accepts data in the form of:

    FileSystemWriteChunkType = BufferSource | Blob | string;

So first, we need to export the database to a readable buffer. To do so, `sql.js` provides a function called `export`:

    const binaryArray: Uint8Array = db.export();

And now we can use the `FileSystemAccessAPI` to save the database to the device. 

Note that we need to ask for permission to access a directory, not a single file. That is because we can't write in place to the db (see [here](https://wicg.github.io/file-system-access/#api-filesystemdirectoryhandle-removeentry), ISSUE 6). As a consequence, when we will update the contents of the file, we will need to get a "new" `FileSystemFileHandle` that is in sync with the object in memory, otherwise we will get the following error: 

> An operation that depends on state cached in an interface object was made but the state had changed since it was read from disk.

So we proceed by first getting a `FileSystemDirectoryHandle` `Object`:

    const dirHandle = window.showDirectoryPicker();

To reload the database on new browser sessions, we will want to store the `dirHandle` in the browser's local storage or in the IndexedDB. This goes beyond the scope of this post, but you can find a good example of this in the [source code of Anita](https://github.com/anita-app/anita), where we store it in the IndexedDB.

So from now on, we assume that we have a `FileSystemDirectoryHandle` `Object` and we can use it to create a file.

So let's now use `dirHandle` to create a file and store there the database:

    const fileHandle = await dirHandle.getFileHandle('my_data.db', { create: true })
    const writable = await fileHandle.createWritable();
    await writable.write(binaryArray);
    await writable.close();

## Retrieve the database from the device and use it in the browser

Having saved the database on the device, we can now retrieve it from the device and use it in the browser in new sessions. To do so, we will reuse the `dirHandle` we created in the previous step. In this way the user will not be bothered to select the directory again. 

Before we can use `dirHandle` in a new browser session, we need to re-ask the user the permission to access the file system. This is not ideal from a UX perspective, but it's a design choice of the `FileSystemAccessAPI` that we cannot change. So we need to ask the user again for permission to access the file system:

    function checkPerm(dirHandle): boolean {
        const opts = {
        writable: true,
        mode: 'readwrite'
      };
      
      // Check if we already have permission, if so, return
      if (await dirHandle.queryPermission(opts) === 'granted')
        return true;
      
      // Request permission to the file, if the user grants permission, return true.
      if (await dirHandle.requestPermission(opts) === 'granted')
        return true;
    }

Now we can load the database:

    const fileHandle = await dirHandle.getFileHandle('my_data.db');
    const file = await fileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();
    // sql.js expects a Uint8Array
    const dbAsUint8Array = new Uint8Array(arrayBuffer);

And finally, we can “reload” our existing database in the browser:

    const SQL = await initSqlJs({
      locateFile: () => '/path-to-the-wasm-file/sql-wasm.wasm'
    });
    // By passing the Uint8Array, we are initializing the database with the data from the device
    db = new SQL.Database(dbAsUint8Array);

Now we have all our data available back in our PWA, and we can perform CRUD operations on it. 

Whenever we want to update the database, we can simply call again `db.export()` and all the related logic shown above and store the result in the device.

## Final thoughts

Implementing SQLite in the browser with persistent data stored on the device thanks to the `FileSystemAccessAPI` has been quite interesting, and incredibly easy thanks to `sql.js`.

There are, however, some drawbacks, that probably should discourage most from using this solution in a data intensive app in production:

- The `FileSystemAccessAPI` is available only in very few selected browsers, so until broader adoption is achieved, it will be available [only to Chrome (and Chromium based browsers](https://web.dev/file-system-access/#browser-support) other than [Brave](https://github.com/brave/brave-browser/issues/11407)).
    - -> Broader adoption is needed
- Even in Browsers that do support the `FileSystemAccessAPI`, we can't load data automatically when the app is loaded. For security reasons we need to ask the user for permission to access the file system at each new session, and we can't prompt the user for permission without a prior user action (`click` event). 
    - -> This could be improved if the `FileSystemAccessAPI` allowed the user to grant permissions once and for all.
- All the data is stored in memory while being used in the browser. Large datasets might cause memory issues. 
    - -> This could be improved if we could write in place to the database, but this is not possible with the `FileSystemAccessAPI` (see above).

Hopefully these issues will be solved in the future, in the meanwhile have fun with `sql.js` and the `FileSystemAccessAPI`!