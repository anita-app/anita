---
title: A simpler way to use Tippy.js with React 
description: Use Tippy.js in any React project without third-party libraries or other middleware.
date: 2022-12-18
author: ilDon
type: Article
slug: a-simpler-way-to-use-tippyjs-with-react
image: a-simpler-way-to-use-tippyjs-with-react/a-simpler-way-to-use-tippyjs-with-react.jpg
---
Tooltips are a powerful UX element. They help users understand the purpose of UI elements without cluttering the layout of the page.

That is, if tooltips are properly rendered. When dealing with tooltips in a web app, there are many things to consider. 

First, the UI in itself is obviously very important. Tooltips should be nice to look at, and they should be easy to use. But there are also many other things to consider. Tooltips should be accessible, they should be easy to implement, and they should be easy to maintain. 

Due to the many things to consider, developing them from scratch can be a lengthy and tedious process. Thankfully, there are many libraries that can help us with this task. [Tippy.js](https://atomiks.github.io/tippyjs/) is probably one of the most popular libraries for rendering tooltips in a web app. It is lightweight, it is easy to use, and it is very flexible.

In this article I will discuss how I implemented tooltips in Anita using Tippy.js, and how I integrated it with React.

<!-- /preview -->
## My frustration with most React tooltip libraries

When I [migrated Anita from Angular to React](/blog/articles/porting-anita-from-angular-to-react-resulted-in-20-less-code.html), I picked [react-tooltip](https://github.com/ReactTooltip/react-tooltip#readme) to render tooltips. The choice seemed nearly obvious. With more than [1,200,000 weekly downloads on NPM](https://www.npmjs.com/package/react-tooltip), it is easily one of the most popular tooltip libraries for React. But after using it for a while I found that I did not like the developer experience.

The thing that bothered me the most was the way the tooltips are implemented. The library uses a custom tooltip component, `ReactTooltip`. As explained in the docs, to render a simple tooltip we need to do something like this:

    <button data-tip="Hello world">Hover me</button>
    <ReactTooltip />

For each tooltip, we need to add a `data-tip` attribute to the element we want to attach the tooltip to, and we need to include in the React Tree a `ReactTooltip` node. This is not a big deal, but it does add some clutter to the markup. If we need to add multiple tooltips to a page, we also need to add a `data-for` attribute to the element for which we want to render the tooltip. The `data-for` value must then match the `id` of a `ReactTooltip` component. Again, this is not a big deal, but it adds even more clutter to the markup.

What I would prefer is to have a simple way of adding tooltips to any element, without adding any additional custom data attributes to the element. I would also prefer to keep the markup clean, and not have to include a custom component simply to render tooltips.

Unfortunately most React libraries I came across, have the same problem. They all rely on, in one way or the other, a custom component to render the tooltips. For example, [@tippyjs/react](https://github.com/atomiks/tippyjs-react#readme) uses a `Tippy` component to render the tooltips:

    <Tippy content={<span>Tooltip</span>}>
      <button>My button</button>
    </Tippy>

## Rendering tooltips with Tippy.js and a custom hook

Tippy.js provides a `tippy` function that can be used to render a tooltip. 

The function takes two arguments. The first identifies the DOM elements to which a tooltip should be attached to. It can be a `selector`, an array of DOM `Element`s, or a `NodeList`. The second argument is an object with the configuration of the tooltip. 

For example, to render a tooltip with the text “Hello world” we can do something like this:

    tippy('#my-button', {
      content: 'Hello world',
    });

The problem of integrating Tippy.js in a React app is that the `tippy` function will attach tooltips only to elements that are in the DOM when the function `tippy` is called. 

Because React renders the elements in the DOM only after the component is mounted, we need a strategy to render the tooltips after the component is mounted. We can do this by using a custom hook. The idea is that the hook will call the `tippy` function when the component is mounted, it will create an instance for the DOM element, and it will destroy such instance when the component is unmounted.

To create the Tippy.js instance, we could pass to the hook a reference to the element to which we want to attach a tooltip. This, however, would result again in a cluttered component. We would first need to create a `ref` constant with `React.useRef`, and then we would need to add a `ref` attribute to the element to which we want to attach the tooltip. We would then need to pass the reference to the hook. This would look something like this:

    const MyButton = () => {
      const buttonRef = React.useRef();
      useTippy(buttonRef, { content: 'Hello world' });

      return (
        <button ref={buttonRef}>Hover me</button>
      )
    }

In the hook we would then need to call the `tippy` function only once the reference is set.

This approach might be an improvement over the "component-based" approach of many libraries, but it's a little one. Instead of a custom component, we now have a reference to the element to which we want to attach the tooltip. We can do better.

We can pass to the hook the `selector` of the element to which we want to attach the tooltip. The hook can then rely on Tippy.js to find the element to which we want to attach the tooltip. 

This is how the hook looks like:

    import { useEffect, useRef } from 'react'
    import tippy, { Instance } from 'tippy.js'

    export const useTippyTooltip = (selector: string, options): void => {
      const instancesRef = useRef<Array<Instance> | undefined>()
      window.requestAnimationFrame(() => {
        if (instancesRef.current?.length) {
          return
        }
        instancesRef.current = tippy(selector, options)
      })
      useEffect(() => () => {
        instancesRef.current?.every((i) => i.destroy())
      }
      , [])
    }

The hook takes two arguments: the `selector` and the `options` object. The `selector` is the same as the one used by Tippy.js. The `options` object is as well the same object that we would pass to the `tippy` function. The hook then uses a `useRef` hook to store the instances of the tooltips to avoid creating multiple instances for the same elements. 

Note that the hook uses `window.requestAnimationFrame` to delay the creation of the tooltip until the next frame. This is necessary because the element to which we want to attach the tooltip is most likely not in the DOM yet when the hook is first executed. The hook then calls the `tippy` function to create the tooltip. Finally, the hook also uses the return function of a `useEffect` hook to destroy the tooltip when the component is unmounted.

The hook can be used in a functional component like this:

    const MyButton = () => {
      useTippyTooltip('#my-button', { content: 'Click the button to do something' })
      return (
        <button id="my-button">Hover me</button>
      )
    }

## Conclusion

As an additional bonus, this approach has the benefit of directly interacting with Tippy.js. We don’t need to rely on a third-party library to render the tooltips. This means that we can use any Tippy.js feature directly, without any of the limitations that might be imposed by a middleware. 

For example, in Anita we show tooltips on certain buttons only below certain screen widths. This is achieved with the [responsive design breakpoints prefixes](https://tailwindcss.com/docs/responsive-design), such as `lg:hidden`. Tippy.js does not support adding custom CSS classes via the `options` object, and we don't want to define an entire new Tippy.js theme just for this. Thanks to the approach described in this post, we can use the `onShow` callback to add the custom CSS class to the tooltip. This is how we do it:

    instancesRef.current?.forEach((i) => {
      i.props.onShow = (i: Instance) => {
        i.popper.classList.add(additionalClasses)
      }
    })
    
In conclusion, the approach described in this post is a good compromise between the flexibility of Tippy.js and the way in which React renders the DOM. It allows us to use Tippy.js directly, without relying on a third-party library, and without adding any additional custom data attributes to the elements to which we want to attach the tooltips.