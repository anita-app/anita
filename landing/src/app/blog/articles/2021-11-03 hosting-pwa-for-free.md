---
title: The journey of Anita to the ultimate bootstrapping thanks to GitHub Pages
date: 2021-11-02
author: ilDon
---
Since I've started developing for the web (spoiler alert: it has been a couple of decades), I have always looked for ways to develop, host, and distribute my free and open-source projects (FOSS) at no cost. The reasoning is that there are already enough factors that make open source challenging to maintain, so economic sustainability should not be one.

My latest FOSS project is [Anita](https://anita-app.com/), an app that I developed primarily because I needed it, and because the way I want to build it makes it a very fun project to work on. The first requirement that make this project fun is that I want it to __cost zero__ (as in *zero kelvins*), not considering my labor.

I’ll document here on the Anita Blog my experience in developing the most fun parts of Anita. In this first post I explain how I solved the first requirement (zero costs) by developing Anita as a Progressive Web App (PWA), and why I think this approach can suit many other FOSS projects. Due to the nature of this topic, there won’t be much code involved, I’ll improve that in future posts!

<!-- /preview -->

## Advantages of PWAs from a cost perspective

A PWA combines some advantages of traditional web pages, such as easily loading on any platform, with the speed, reliability, and functionality of modern desktop and mobile apps. 

On top of that, we are now at the point in which using FOSS to build web apps is easier than ever. All you need to publish a new web app is a computer. It does not need to be a fancy *n*-core, GPU-equipped workhorse. Anything that can run Linux will do.

### My tools: `free !== compromises`

The entire lifecycle of a web project can nowadays be covered by FOSS. Below I’ll list some of the tools I use on my dev machine, they are <u>all</u> available on Windows, Linux, and Mac. I’ll get to the hosting part later in the post.

- Code editor: [Visual Studio Code (VS Code)](https://code.visualstudio.com/) — it’s by far my favorite wed dev editor. Essentially with all the extensions and functionalities that have been added through the years, it has become one of the most customizable and complete IDEs for the web. If you factor in that it is completely free, it’s really hard to beat it. I have installed in VS Code many extensions, those that I find more useful for developing Anita are the following, and I could not recommend them more:
    - [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template): the Anita PWA is developed with Angular, this extension speeds up development significantly;
    - [Angular Snippets (Version 12)](https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2): same as above, and it’s maintained by [John Papa](https://johnpapa.net/), who’s [Style Guide](https://github.com/johnpapa/angular-styleguide) made me a much better developer in the AngularJS era;
    - [Comments in Typescript](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template): writing docs can be boring, this makes it at least efficient; 
    - [IntelliSense for CSS class names in HTML](https://marketplace.visualstudio.com/items?itemName=Zignd.html-css-class-completion): helps to suggest CSS class names based on your stylesheets, works like magic;
    - [JSON Viewer](https://marketplace.visualstudio.com/items?itemName=ccimage.jsonviewer): since Anita supports saving data to JSON, this helps debugging;
    - [LTeX – LanguageTool grammar/spell checking](https://marketplace.visualstudio.com/items?itemName=valentjn.vscode-ltex): prevents typos and other mistakes. Very useful for writing this blog with VS Code;
    - [Nebular Code snippets](https://marketplace.visualstudio.com/items?itemName=shalinjames.vscode-nebular-snippets): Anita uses [Nebular](https://akveo.github.io/nebular/) for the UI, snippets are always welcome;
    - [Sort Typescript Imports](https://marketplace.visualstudio.com/items?itemName=miclo.sort-typescript-imports): I like to keep things tidy;
    - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss): I chose to use Tailwind CSS for the landing page of Anita and for the blog. I had little previous experience with Tailwind, and it’s a lot of fun. Thanks to the code completion suggestions of this extension, and how intuitive is Tailwind, it's easy to guess the right CSS class name for any CSS property;
    - [Tailwind Docs](https://marketplace.visualstudio.com/items?itemName=austenc.tailwind-docs): faster than googling!;
    - [TSLint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin): once again, I like to keep things tidy, so with TSLint I can easily enforce (on myself) rules on how code should be written;
    - [Turbo Console Log](https://marketplace.visualstudio.com/items?itemName=ChakrounAnas.turbo-console-log): super quick way to dump to the console something for debugging.
- Vector images: [Lunacy](https://icons8.com/lunacy) — hands down the best vector image editor out there. I used to work with Sketch, but it’s lack of cross-platform support forced me to abandon it (at the time they did not offer a web app). Now I would not go back.
- Other images: [Gimp](https://www.gimp.org/) — I try to use Lunacy as much as possible, but when I can’t Gimp is an excellent editor for the price (free).
-  Version control system: [Git](https://git-scm.com/) — I think Git does not need any introduction. My favorite tools to work with git are:
    - [`changelog-flow`](https://www.npmjs.com/package/changelog-flow): a library I developed and currently maintain to automate some CLI operations. It has become a very quick way to automate the deployment of new versions of projects I work on;
    - [SourceTree](https://www.sourcetreeapp.com/): very complete GUI for git commands, with integrated git-flow support;
    - [GitHub Desktop](https://desktop.github.com/): minimal, sometimes just what’s needed.

### Wait a second, the same applies to installed desktop and mobile apps, especially hybrid ones!

If you are like me, meaning that you have developed hybrid apps for desktop and mobile, you must be thinking that, from a cost perspective, the upsides of PWAs apply also to hybrid apps.

I’ll even admit that for developing some features of Anita it would be easier to use tools like [Electron](https://www.electronjs.org/), [React Native]( https://reactnative.dev/), [Native Script](https://nativescript.org/) or [Capacitor](https://capacitorjs.com/). PWAs do still have some limitations that require some workarounds and, as a consequence, are less than ideal from a UX perspective. One great example would be access to the file system, which I will try to cover in an upcoming post.

Tools like Electron, however, are not suited for shipping apps at zero cost. Although they all are free, they are essentially just a different way of developing a native app. For this reason, they present some bottlenecks that make it very hard, if not impossible, to reach end-users of major OSes without any cost. At least app stores fees, or even mere signing certificates, still need some sort of (recurring) payment. Additionally, building the same app for multiple platforms on one single machine is still essentially impossible. [Even Electron-based apps can’t still be built on one machine](https://www.electron.build/multi-platform-build.html). There are cloud build services, but to cover all OSes they usually come at a cost.

For this reason, the only true zero cost is pure web development. This does have some limitations, but for Anita they are not a deal-breaker and the number of functionalities available to PWA is growing constantly, so it’s a matter of time before PWA are just as capable as installed apps.

## Converting a traditional web app into a PWA

Developing a PWA is essentially just a matter of developing for the web. This means that we can take advantage of all the existing tools and libraries. 

Even the specific code needed to convert a web app to a PWA is often a built-in feature of frameworks and libraries. Angular has a specific package for PWAs ([`@angular/pwa`](https://angular.io/guide/service-worker-getting-started)), and so does Vue ([`@vue/cli-plugin-pwa`](https://cli.vuejs.org/core-plugins/pwa.html)) and the same can be achieved with React (for example with [`create-react-app`](https://create-react-app.dev/docs/making-a-progressive-web-app/)).

I won’t go into the details of how I added PWA capabilities to Anita as that is very well covered by Angular guides, and many other tutorials online. As a general rule, in most cases, adding offline functionalities and other PWA capabilities is just a matter of configuring some parameters. The obvious advantage for any web developer is that it becomes very easy to ship to end users an application that can feel and look like a native app.

## Hosting a PWA on GitHub pages

Hosting a web app still requires a server. For commercial applications finding a very cheap and reliable hosting solution for a PWA is trivial. As much as those solutions are increasingly affordable though, they are often not completely free, especially when the usage exceeds some kind of threshold (bandwidth, traffic, etc.).

This is where [GitHub Pages](https://pages.github.com/) comes to the help. Thanks to GitHub Pages it is possible to host for free static sites. This includes PWA that don't depend on any server. In short, building a progressive web app on GitHub Pages is just like building a non-progressive web app, except it's hosted on GitHub Pages instead of your own server.

### Setting up a new GitHub page

Setting up a new repository and using it as a website is extremely easy. The [official GitHub Pages guide](https://pages.github.com/) is so well written that I could not possibly improve here on the setup process. I’ll just add that the whole process of setting up a new hosting does really take few minutes.

### Handling URLs of PWAs hosted on GitHub Pages

Hosting a PWA on the GitHub Pages server does come with few caveats. You do not have any control on the server whatsoever. You take it as it is. Likewise, you can’t change any configuration and there is no way in which you can implement rewrite rules. 

For a PWA this can be problematic because modern PWAs usually write internal URLs as proper web addresses. For example, the internal address of Anita to create a new project is `[baseUrl]/private/projects/add`, where `baseUrl` is `https://anita-app.com`. If this address was entered in the URL bar of the browser as it is, GitHub Pages would look for `https://anita-app.com/private/projects/add/index.html`. This would result in a 404 Error because the server of GitHub Pages looks only for static files at the exact destination matching the URL ([try](https://anita-app.com/private/projects/add/index.html)).

The solution, in Angular, is to set `useHash` to `true` when initializing `RouterModule` (for more info see the [Angular docs](https://angular.io/api/router/ExtraOptions)):

    RouterModule.forRoot(routes, { useHash: true })

With `useHash` set to `true` the above URL will be written by Angular like so: [`https://anita-app.com/app/#/private/projects/add`](https://anita-app.com/app/#/private/projects/add). In this way the GitHub Pages server will look for `https://anita-app.com/app/index.html`, which is the single HTML page in which our PWA is contained. The rest of the URL (after the `#`) is ignored because, for the server, that is an [anchor link to an element in `index.html`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a?retiredLocale=it#linking_to_an_element_on_the_same_page). Once GitHub Pages has served `index.html`, Angular will be able to interpret the “anchor link” and load the proper view of our app.

In React a similar behavior can be achieved with [`HashRouter`](https://reactrouter.com/web/api/HashRouter). In Vue it is even easier as the *hash mode* is on by default, unless the mode `history` is selected (see the [Vue docs](https://router.vuejs.org/guide/essentials/history-mode.html)).

### Remote database and cloud syncing

To my best knowledge there are currently no options to host a web app with a “forever free” cloud database. There are some services that offer free tiers, but as usage increases the free tier inevitably runs out.

Apart from privacy and security reasons, this is one of the main reasons I have chosen to develop Anita as a local and offline first PWA. All data can nowadays be stored on our (more than capable) devices.

A remote repository is nevertheless useful to easily sync data between devices. For this reason, the roadmap for Anita includes building support for syncing local data with a remote database. But because I can’t, and don’t want to, provide a free database to everyone, the idea at this stage is to let each user provide the connection details to their preferred remote database. In this way Anita can stay coherent with the zero costs requirement, and on top of that it will grant to users the highest degree of freedom possible in choosing their database provider.

There are many things to discuss on this topic, I’ll address them when I’ll start to design the logic for connecting to remote databases, possibly including support for the [InterPlanetary File System (IPFS)](https://ipfs.io/) protocol. Stay tuned!

### Legal stuff: watch out for the terms and conditions

Before hosting Anita on GitHub Pages I checked whether GitHub was actually ok with that.
The terms and conditions of GitHub Pages can be found under the [GitHub Terms for Additional Products and Features](https://docs.github.com/en/github/site-policy/github-terms-for-additional-products-and-features).

The [section dedicated to Pages](https://docs.github.com/en/github/site-policy/github-terms-for-additional-products-and-features) states the following:

> GitHub Pages is not intended for or allowed to be used as a free web hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions or providing commercial software as a service (SaaS). Some monetization efforts are permitted on Pages, such as donation buttons and crowdfunding links.

Anita is free and open source software, and I do not intend, at least in the foreseeable future, to monetize it, or transform it in any kind of business. At this time I don't think that it can be frames as a *commercial software as a service*.

I do intend to allow for some donations in the future, but that should be allowed. Given my use case, I think I am in the clear. If I am not, I sincerely apologize.

### Custom domain

Websites hosted on GitHub Pages are assigned by default a URL with this structure: `https://[username].github.io`, where `username` is the name of the organization or of the user to which the repository belongs. For Anita that would be `https://anita-app.github.io`.

Although a free subdomain is a nice thing, hosting a PWA on a subdomain has two main disadvantages:

1. Many PWA features that are relevant for Anita, [such as IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology), adhere to the same-origin policy. This means that data saved locally by Anita is scoped to the domain from which is served the PWA. A user visiting Anita on the same computer and on the same browser, but from different URLs, would see different data. For this reason, it is essential to ensure that Anita can be served from the same unique origin. A custom domain that can be set to point to any hosting is the best way to ensure that. If for any reason Anita can no longer be hosted on GitHub Pages, the whole app can be transferred to another server, and the domain can be pointed to the new location. In this way there won’t be any disruption for the users. Because the domain remains the same, the origin remains the same, even if the server changes.
2. The subdomain is rather long and difficult to remember for someone who is not familiar with GitHub. While among developers GitHub is well known, outside this (admittedly large) circle there are a ton of potential people interested in checking out Anita that have never heard of GitHub.

For these reasons I purchased the domain [anita-app.com](https://anita-app.com/). 

Unfortunately, this means that I did incur in a cost. For me that is still acceptable because the price is negligible (the domain was available) and because I consider that having a custom domain on internet is a condition of existence for a project like Anita.

## Final thoughts

As a web developer I am truly grateful for all the great tools and support from the open-source community that make coding for the web a very pleasant and exiting task. Without all these technologies and tools I’ve listed here Anita would not be possible.