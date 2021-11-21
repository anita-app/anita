---
title: Porting an Angular app to React
description: How to port a complex Angular Progressive Web App, with offline capabilities and NgRx to React, step by step guide
date: 2021-11-10
author: ilDon
---
Create new react app with `create-react-app`. We want PWA and TS

    npx create-react-app anita-react --template cra-template-pwa-typescript

Check everything works: 

    2021-11-10-11_18_22 app initialized.png

Clean index.ts and enable service worker

Form

        import React from 'react';
        import ReactDOM from 'react-dom';
        import './index.css';
        import App from './App';
        import * as serviceWorkerRegistration from './serviceWorkerRegistration';
        import reportWebVitals from './reportWebVitals';

        ReactDOM.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>,
          document.getElementById('root')
        );

        // If you want your app to work offline and load faster, you can change
        // unregister() to register() below. Note this comes with some pitfalls.
        // Learn more about service workers: https://cra.link/PWA
        serviceWorkerRegistration.unregister();

        // If you want to start measuring performance in your app, pass a function
        // to log results (for example: reportWebVitals(console.log))
        // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
        reportWebVitals();

To

        import React from 'react';
        import ReactDOM from 'react-dom';
        import './index.css';
        import * as serviceWorkerRegistration from './serviceWorkerRegistration';

        ReactDOM.render(
          <React.StrictMode>
            "Hello World"
          </React.StrictMode>,
          document.getElementById('root')
        );

        serviceWorkerRegistration.register();

Delete files:

        App.csss
        App.test.tsx
        App.tsx

Check everything works: 

    2021-11-10-11_18_22 app cleaned.png

Copy src/assets folder to public

Update manifest and index.html with new icons, title and description. Remove files

    public/favicon.ico
    public/logo192.png
    public/logo512.png

## Absolute imports

In Angular, we use `paths` in `tsconfig.json` to import files with absolute paths from `src/app` folder, with the prefix `@anita/client`:

    "CompilerOptions": {
        ...
        "paths": {
          "@anita/client/*": [
            "src/app/*"
          ]
        }
        ...
    }


The advantage in general is that in this way we avoid import hell. In the process of porting all code to React, this comes in very handy as we can use absolute imports in the new code.

In React, however, we cannot use `paths` in `tsconfig.json` because we are using `create-react-app`. We can however use `baseUrl`, which allows us to import files with absolute paths from `src` folder:

    "CompilerOptions": {
        ...
        "baseUrl": "/"
        ...
    }

In this way, when porting the code we can simply replace all occurrences of `@anita/client` with `app` and we will be able to use the same absolute paths, as long as we retain the same folder hierarchy.

## From Nebular to Tailwind

Nebular great, but only for Angular, and over engineered and complicated for React.

Because we use Tailwind in landing, and Tailwind is a very good match for React we use it.

Installation as described here: https://tailwindcss.com/docs/guides/create-react-app

Only customization is theme colors, same as landing (create shared constant?)

Now lets' add some layout with Tailwind. Because we will have an admin panel as our main view, we an start from there. A simple example of a layout with a sidebar and a content area can be found here: https://codepen.io/chris__sev/pen/RwKWXpJ

Let's try it in index.tsx, with some minor modifications to start the customization for Anita:

    ReactDOM.render(
      <React.StrictMode>
        <div className="bg-prussian-blue-400 text-gray-100 flex justify-between">
          <div className="flex-grow relative flex items-center lg:w-auto lg:static pl-5">
            <a className="text-lg font-bold leading-relaxed inline-block mr-4 py-2 whitespace-no-wrap uppercase text-white" href="/">
              <img src="/assets/logo/logo_square.svg" style={{ height: '30px', width: 'auto' }} alt="Anita" />
            </a>
            <a className="text-md font-bold leading-relaxed inline-block mr-4 py-2 whitespace-no-wrap uppercase text-white" href="/">
              Anita
            </a>
          </div>

          <button className="mobile-menu-button p-4 focus:outline-none focus:bg-gray-700">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="relative min-h-screen md:flex">


          <div className="sidebar bg-gray-200 text-prussian-blue-500 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <nav>
              <a href="https://anita-app.com" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-prussian-blue-600 hover:text-white">
                Menu item 1
              </a>
              <a href="https://anita-app.com" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-prussian-blue-600 hover:text-white">
                Menu item 2
              </a>
              <a href="https://anita-app.com" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-prussian-blue-600 hover:text-white">
                Menu item 3
              </a>
              <a href="https://anita-app.com" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-prussian-blue-600 hover:text-white">
                Menu item 4
              </a>
            </nav>
          </div>

          <div className="flex-1 p-10">
            Content
          </div>

        </div>
      </React.StrictMode>,
      document.getElementById('root')
    );


Lets' test if tailwind works and how our initial layout works:

    2021-11-10-12_19_23 tailwind.png

Good enough for now. Let's add some components to improve the layout.

We will divide the layout in three sections:
- Header
- Sidebar
- Content

Each of these will be a component. They will be imported into a container component called AdminLayout and will be used in the index.tsx file.

To ease the transition from Angular to React, we keep a similar folder hierarchy:

 - src/app/ui/admin-layout/admin-layout.tsx
 - src/app/ui/admin-layout/header.tsx
 - src/app/ui/admin-layout/sidebar.tsx
 - src/app/ui/admin-layout/content.tsx

 AdminLayout is the container component for the layout and it looks like this:

    export const AdminLayout = (props: any) => (
      <div>
        <Header />

        <div className="relative admin-container md:flex">

          <Sidebar>
            <nav>
              <a href="https://anita-app.com" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-prussian-blue-600 hover:text-white">
                Menu item 1
              </a>
              <a href="https://anita-app.com" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-prussian-blue-600 hover:text-white">
                Menu item 2
              </a>
              <a href="https://anita-app.com" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-prussian-blue-600 hover:text-white">
                Menu item 3
              </a>
              <a href="https://anita-app.com" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-prussian-blue-600 hover:text-white">
                Menu item 4
              </a>
            </nav>
          </Sidebar>

          <Content>
            Hello world!<br />
          </Content>

        </div>
      </div>
    );

For now, we keep the dummy text, we will add the actual content later. We will also take care of implementing the open/close functionality for the sidebar later. First we take care of state management. In this way as we port the app we can easily change the state and the layout will be updated.


## Porting state management from NgRx to Redux

Because in the Angular app we use NgRx, which is essentially the same thing as Redux, to maintain the same state management logic we use Redux also in our React app.

First, let's add Redux and React-Redux to our project.

    yarn add react-redux redux 
    
And the types:

    yarn add @types/react-redux --dev

Converting an NgRx reducer to a Redux reducer is then quite straightforward.

Given the following NgRx reducer:

    /**
    * The initial state of the container of the current project
    */
    export const projectState: SystemData = undefined;

    /**
    * Reducer actions for projectState
    */
    const _projectReducer = createReducer(projectState,
      on(REDUCER_ACTIONS.setCurrentProject, (state, data) => {
        return data.payload;
      })
    );

    /**
    * Updates the projectState
    */
    export function projectReducer(state: SystemData, action: typeof REDUCER_ACTIONS.setCurrentProject): any {
      return _projectReducer(state, action);
    }

As a Redux reducer we can simply use the following:

    /**
    * The initial state of the container of the current project
    */
    const projectState: SystemData = undefined;

    /**
    * Updates the projectState
    */
    export const projectReducer = (state: SystemData = projectState, action: Action<REDUX_ACTIONS>): SystemData => {
      switch (action.type) {
        case REDUX_ACTIONS.setCurrentProject:
          return action.payload
        default:
          return state;
      }
    }

We can simplify the code as follows as we will create the reducer later on, before combining all our reducers:

    const REDUCERS = {
      project: projectReducer,
      projects: projectsReducer,
      sectionsForChildOfSelector: sectionsForChildOfSelectorReducer
    };

    const combinedReducers = combineReducers(REDUCERS)

    export const store = createStore(combinedReducers);

Now we can reference the exported const `store` in our React app.

In Angular we had a service that was responsible for handling the store:

    /**
      * Initializes ngRx and sets the pointer on `stateData` constant
      */
    @Injectable({
      providedIn: 'root'
    })
    export class StateDataService {

      constructor(
        private store: Store<ReducerTypes>
      ) { }

      /**
      * Sets the pointer to the ngRx store already loaded in memory on `stateData` constant
      */
      public initRedux(): void {
        stateData.ngRxStore = this.store;
      }

    }

There are two things to note here:

- `private store: Store<ReducerTypes>` initalizes NgRx according to the logic governing [Angular singleton Services](https://angular.io/guide/singleton-services)
- `stateData.ngRxStore` is a pointer to the store loaded in memory as a singleton

For reasons that go beyond the scope of this post, when using NgRx in an Angular app I often set the store on a constant called `stateData`. In this way I can access the store from anywhere in the app without the need to Inject the store in the constructor. Doing so I can keep most of the code as vanilla TypeScript/JavaScript and not as an Angular Service. This trick has proven to be quite useful in the past, and also in this case it is quite convenient as we can more transfer all non-angular code unmodified to React, simply using the Redux `store` instead of `stateData.ngRxStore`.

## Routing

### Angular

In Angular, we use the Router to handle the routing:

    export const routes: Routes = [

      { path: 'private', redirectTo: 'private/projects/list', pathMatch: 'full' },
      { path: 'private', children:
          [
              {
                path: '', component: AdminComponent, children: [

                  { path: 'projects', redirectTo: 'projects/list', pathMatch: 'full' },
                  { path: 'projects', children: [
                      { path: 'list', component: ProjectsListComponent, canActivate: [ProjectsGuardService] },
                      ...
                    ] 
                  },
                  { path: 'project', redirectTo: 'projects/list', pathMatch: 'full' },
                  { path: 'project', canActivate: [ProjectGuardService], children: [
                      { path: '', redirectTo: 'projects/list', pathMatch: 'full' },
                      { path: `:${URL_PARAMS.projectId}`, redirectTo: ':projectId/info', pathMatch: 'full' },
                      { path: `:${URL_PARAMS.projectId}/info`, component: ProjectInfoComponent },
                      ...
                    ]
                  }
                ]
              }
          ]
      },

      { path: '', redirectTo: 'private/projects/list', pathMatch: 'full' },

      { path: '**', redirectTo: 'private/projects/list', pathMatch: 'full' }

    ];

### React

In React, we use react-router to handle the routing. React-router is by far the most popular routing library at this moment, and we don't want to be exotic with our router choice.

First, we need to install react-router. Then, since we host our app on GitHub Pages, we need to use `HashRouter` instead of `BrowserRouter`. In this way we can use the `#` symbol to navigate between pages. To know more about this, check out my previous post on [hosting a PWA on GitHub Pages](https://anita-app.com/blog/articles/the-journey-of-anita-to-the-ultimate-bootstrapping-thanks-to-git-hub-pages.html), and the [React Router docs](https://reacttraining.com/react-router/web/guides/quick-start).

Since all views are rendered in the same place, the content area of the `AdminLayout` component is the place where we will render the router.

To keep things readable, all routes are defined in a separate React component `AniteRoutes`.

    import { HashRouter as Router } from 'react-router-dom';

    export const AdminLayout = () => (
      <Router>
        <Header />
        <div className="relative admin-container flex">
          <Sidebar>
            <SidebarMenu />
          </Sidebar>
          <Content>
            <AnitaRoutes />
          </Content>
        </div>
      </Router>
    );

In `AniteRoutes` we define all the routes:

    import { Navigate, Route, Routes } from 'react-router-dom';

    export const AnitaRoutes = () => (
      <Routes>
        <Route path={ANITA_URLS.projectsList} element={<ProjectsList />} />
        <Route path={ANITA_URLS.projectAdd} element={<AddEditProject />} />
        <Route path={ANITA_URLS.projectEdit} element={<AddEditProject />} />
        <Route path={ANITA_URLS.projectsNone} element={<ProjectsNone />} />
        <Route path={ANITA_URLS.projectDetails} element={<ProjectDetails />} />
        <Route path={ANITA_URLS.projectSectionElesList} element={<SectionElementsList />} />
        <Route path={ANITA_URLS.projectSectionEleDetails} element={<SectionElementDetails />} />
        <Route path={ANITA_URLS.projectSectionAddEle} element={<AddEditSectionElement />} />
        <Route path={ANITA_URLS.projectSectionEditEle} element={<AddEditSectionElement />} />
        <Route path="*" element={<Navigate to={ANITA_URLS.projectsList} />}
        />
      </Routes>
    )

Notice how all routes are defined in a `ANITA_URLS` constant. This is because we want to keep the code as clean as possible, and we want to keep the routes as simple as possible.

    export const ANITA_URLS = {
    // PROJECTS
    projectsNone: '/projects/none',
    projectsList: '/projects/list',
    projectAdd: `/projects/${EDITOR_MODE.add}`,
    projectEdit: `/projects/${EDITOR_MODE.edit}/:${URL_PARAMS.projectId}`,
    // PROJECT
    projectDetails: `/project/:${URL_PARAMS.projectId}/info`,
    projectSectionElesList: `/project/:${URL_PARAMS.projectId}/list/:${URL_PARAMS.sectionId}`,
    projectSectionAddEle: `/project/:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/${EDITOR_MODE.add}`,
    projectSectionEditEle: `/project/:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/${EDITOR_MODE.edit}/:${URL_PARAMS.elementId}`,
    projectSectionEleDetails: `/project/:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/details/:${URL_PARAMS.elementId}`,
  }

As you can see, some portions of the routes are defined by other constants, `URL_PARAMS` and `EDITOR_MODE`. In this way we avoid typos, and we can easily change the routes in the future.

These two constants are pretty simple:

    export const URL_PARAMS = {
      projectId: 'projectId',
      sectionId: 'sectionId',
      elementId: 'elementId',
      parentId = 'parentId'
    }

    export const EDITOR_MODE = {
      add: 'add',
      edit: 'edit',
    }

So, for example, the route `projectSectionEditEle`, is defined as:

    /project/:${URL_PARAMS.projectId}/:${URL_PARAMS.sectionId}/${EDITOR_MODE.edit}/:${URL_PARAMS.elementId}
    
translates to:

    /project/:projectId/:sectionId/edit/:elementId

Now we only need a way to generate the links to the routes. We can do that with a function that fills all `params` expected by a route. In our design, the function accepts a URL and an array of `params` and values to be replaced in the URL:

    export function urlParamFiller(url: string, paramsToFill: Array<{ name: URL_PARAMS; value: string }>): string {
    
      let result = url;
    
      paramsToFill.forEach(params => { 
        result = result.replace(new RegExp(`:${params.name}`, 'g'), params.value) }
      );
      
      return result;
    
    }

We don't need to worry about the order of the `params`, because the `urlParamFiller` function will replace all occurrences of the `params` in the route.

This function is used to generate the links to the routes, for example to generate the link to the details' page of a project:

    <Link 
      to={urlParamFiller(ANITA_URLS.projectDetails, [{ name: URL_PARAMS.projectId, value: project.id }])} 
      className="px-4 py-3 text-white inline-flex items-center leading-none text-sm bg-prussian-blue-400 hover:bg-prussian-blue-500 rounded"
      >
      <i className="bi-info-circle mr-2"></i>Project details
    </Link>

This is a great example of one of the many ways in which React is much easier to use compared to Angular. Our Routes are mere strings concatenated with constants that we use to generate the links. And to avoid human mistakes, we use the `urlParamFiller` function to fill the route with its expected `params`. We don't need to specify a hierarchy of routes, although we could if we wanted with [nested routes](https://reactrouter.com/docs/en/v6/getting-started/overview#nested-routes). We can simply use `urlParamFiller` to set the `to` prop of the `Link` component, and we will navigate where we need to.