# Anita

Anita is a private, no-server, powerful and fully customizable data management solution, open source and free of charge. 

With Anita you can organize any number of things you want to track, with one of our pre-configured Anita Templates or by defining your own custom data structure. 

Anita can handle many different data types, and can present your data in multiple useful ways.

### Portable

Your data is stored on your computer in a JSON file and/or on a remote database of your choice: flexible, open & no lock-in. Stay independent from servers that will go away, sooner or later.

### Secure

There is no risk of a data breach like there is with cloud based solutions: Anita works fully offline. You keep your data where it's most safe, with you.

### Private

Anita is the privacy you want, the convenience you need. It fully works without any cloud, so your data is never exposed to a third party: no more middlemen, profiling or ads targeting.

## Anita is still in Beta

Anita is still in early beta, we are improving it daily to add features and customization options.

As we move forward we will make available our current roadmap, as of now our next big milestone is reaching v. 1.0.0.

Our goal for version 1.0.0 is to implement the following:

- [X] full support for custom data structures ([see the blog post about it](https://anita-app.com/blog/articles/most-secure-cloud.html))
- [X] full support for custom data types
- [X] full support for CRUD operations on data stored:
  - [X] locally in the browser's IndexedDB (with [Dexie.js](https://dexie.org/));
  - [X] locally in a JSON or SQLite file in the device FS [see the blog post](https://anita-app.com/blog/articles/sqlite-in-a-pwa-with-file-system-access-api.html);
- [X] list views and grid views (cards);
- [X] relationships between sections and sections elements (-> child elements can link to parent elements of parent sections);
- [X] possibility to exclude certain sections from the main menu: useful for child sections to be displayed only as a subsection of a parent element;
- [X] hide show columns in table views;
- [ ] addition of a tab view for child sections;
- [ ] Anita templates (at least one example template); 
- [X] support for synchronization of locally stored data with at least one remote data store: Dropbox and WordPress (see below);

## WordPress

Any WordPress site with the [Anita Project Manager](https://wordpress.org/plugins/anita-project-manager/) plugin can store Anita projects and share them with the users of the site, according to their WordPress roles. The plugin lives in the [anita-project-manager-for-wordpress](https://github.com/anita-app/anita-project-manager-for-wordpress) repository, together with its API reference and quickstart.

In the app, the integration is in `app/src/app/libs/cloud-sync/wordpress/`:

- `wordpress-auth.class.ts`: connection flow (site check, login on the site, single-use code exchanged with PKCE);
- `wordpress-client.class.ts`: REST client with transparent token refresh;
- `wordpress-sync.class.tsx`: first-sync policy, import of the site's projects, projects removed from the site, record pushes;
- `../remote-and-local-merger.class.ts`: two-way merge of the open project, shared with Dropbox.

Self-hosted installations of Anita must be added to the *Allowed app URLs* of the plugin settings. During development, run the WordPress environment of the plugin repository (`docker compose up -d && ./tests/setup.sh`): it accepts `http://localhost:3000`.

Unit tests: `cd app && CI=true npx react-app-rewired test --watchAll=false`.
