# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This file has been automatially generated with [changelog-flow](https://github.com/ilDon/changelog-flow)

---

## [0.18.4] - 2022-11-25
### Fixed
- redirect uri.

## [0.18.3] - 2022-11-25
### Fixed
- header buttons positioning and visibility.

## [0.18.2] - 2022-11-25
### Added
- styles for lists.

## [0.18.1] - 2022-11-25
### Fixed
- conflict.

## [0.18.0] - 2022-11-25
### Added
- cloud ync with dropbox (experimental).
- support for rich text.

## [0.17.0] - 2022-10-09
### Added
- add fields from list view.
- section name abbreviation for menu.

## [0.16.5] - 2022-09-28
### Added
- link to new article on landing page.

## [0.16.4] - 2022-09-27
### Fixed
- publication date.

## [0.16.3] - 2022-09-27
### Fixed
- checkbox position in table.

## [0.16.2] - 2022-09-27
### Added
- table sorting.
- close menu on click on mobile.

### Fixed
- duplicate field identifiers.

## [0.16.1] - 2022-09-26
### Fixed
- updating partial element removes data not included in the update.

## [0.16.0] - 2022-09-26
### Added
- show hide cols in table view.

## [0.15.1] - 2022-09-07
### Fixed
- new deploy.

## [0.15.0] - 2022-09-07
### Added
- added blog article.

### Changed
- improved landing texts.

## [0.14.20] - 2022-09-06
### Changed
- updated landing example.

## [0.14.19] - 2022-09-06
### Added
- improved landing description with typewriter.

## [0.14.18] - 2022-09-05
### Changed
- improved UI.

## [0.14.17] - 2022-09-02
### Fixed
- update storage method in data file on project import.

## [0.14.16] - 2022-09-02
### Fixed
- loading data for non existing section.

## [0.14.15] - 2022-09-01
### Fixed
- reading id of null.

## [0.14.14] - 2022-09-01
### Fixed
- debuggin.

## [0.14.13] - 2022-09-01
### Fixed
- debug.

## [0.14.12] - 2022-09-01
### Changed
- removed store method radio in edit mode.

## [0.14.11] - 2022-09-01
### Fixed
- debug.
- deleting project.

## [0.14.10] - 2022-09-01
### Fixed
- enabled debug.

## [0.14.9] - 2022-09-01
### Fixed
- centered icon.

## [0.14.8] - 2022-09-01
### Fixed
- check if filehandle has content.

## [0.14.7] - 2022-09-01
### Fixed
- log in production.

## [0.14.6] - 2022-09-01
### Fixed
- debug info.

## [0.14.5] - 2022-09-01
### Fixed
- error handling.

## [0.14.4] - 2022-09-01
### Fixed
- link to create new project.

## [0.14.3] - 2022-09-01
### Fixed
- installable pwa.

## [0.14.2] - 2022-09-01
### Fixed
- manifest.

## [0.14.1] - 2022-09-01
### Fixed
- manifest.

## [0.14.0] - 2022-09-01
### Added
- grid view.
- section icons.

### Changed
- ui improvements.

## [0.13.1] - 2022-08-27
### Fixed
- deploy.

## [0.13.0] - 2022-08-27
### Added
- export project to json.

### Fixed
- hover bg color.

## [0.12.1] - 2022-02-22
### Fixed
- form components parsing.

## [0.12.0] - 2022-02-02
### Added
- new types supported (color, time, week, month, email, url, tel, etc.).

### Changed
- improved scrollbars.
- improved performance of forms.

### Fixed
- large tables now scrollable instead of overflowing.

## [0.11.1] - 2021-12-18
### Changed
- improved UI of project picker.

## [0.11.0] - 2021-12-01
### Added
- added support for the delete function.
- added sqlite support in the PWA app.

## [0.10.1] - 2021-11-29
### Fixed
- improved project picker layout.

## [0.10.0] - 2021-11-29
### Added
- added project picker in sidebar.
- in mobile now the sidebar closes if the app background is touched.

### Changed
- breaking changes: renamed dateCreation and lastModified to createdAt and updatedAt.

## [0.9.0] - 2021-11-29
### Added
- added animations with animate.css.
- added animation on modal close.
- added support for IndexedDB.

### Changed
- improved styling of form elements.

## [0.8.2] - 2021-11-25
### Changed
- minor UI improvements.

## [0.8.1] - 2021-11-25
### Fixed
- fixed TailwindCSS purging.

## [0.8.0] - 2021-11-25
### Added
- Added switch mode in project editor to activate/deactivate advanced editing mode.

### Fixed
- new fields with options now correctly initialize.

## [0.7.1] - 2021-11-21
### Fixed
- fixed typos.

## [0.7.0] - 2021-11-21
### Changed
- complete rewrite of the entire app in React.
- BREAKING CHANGE: renamed Option prop txt to label.
- BREAKING CHANGE: removed the prop validators from FormModel and moved required to the main Object.
- using TailwindCSS.

## [0.6.3] - 2021-11-09
### Added
- added meta description to index.html.

## [0.6.2] - 2021-11-05
### Changed
- properly formatting dates.

## [0.6.1] - 2021-11-04
### Fixed
- landing navbar collapsable to prevent navbar from hiding hero text.

## [0.6.0] - 2021-11-04
### Added
- added blog section and first post.
- added licenses page with all FOSS used by Anita.

### Changed
- improved no-projects view with better spacing between buttons.

## [0.5.0] - 2021-10-26
### Added
- added maskable icon to manifest.json for Android.

## [0.4.1] - 2021-10-26
### Changed
- updated roadmap in the README.

## [0.4.0] - 2021-10-26
### Added
- support for child elements to link to parent elements of parent sections.

## [0.3.2] - 2021-10-26
### Changed
- changed fetch strategy in ngsw.json.

## [0.3.1] - 2021-10-25
### Fixed
- fixed assets files for service worker.

## [0.3.0] - 2021-10-25
### Added
- added ability to set parent sections in the project structure.

### Changed
- BREAKING CHANGE: simplified project structure, now section fields are stored in a 1D Array.

## [0.2.5] - 2021-10-23
### Fixed
- removed /index.html to link to app in get started button.

## [0.2.4] - 2021-10-23
### Changed
- set useHash to true in RouterModule.forRoot for compatibility with GitHub pages server.

## [0.2.3] - 2021-10-23
### Fixed
- changed start_url in manifest to index.html.

## [0.2.2] - 2021-10-23
### Fixed
- improved manifes.

## [0.2.1] - 2021-10-23
### Fixed
- fixed script to publish to github pages.
- applied copy changes to index.html.

## [0.2.0] - 2021-10-23
### Added
- added script to publish on github pages.

### Changed
- changed out folder to the github pages repository.
- improved landing texts.

## [0.1.0] - 2021-10-23
### Added
- created deploy pipe.

