---
title: React Compiler and why class objects can work against memoization
description: React Compiler removes a lot of manual memoization, but class instances can still trigger avoidable recomputation when dependency tracking falls back to object identity.
date: 2026-02-06
author: ilDon
type: Article
slug: react-compiler-and-why-class-objects-work-against-memoization
image: react-compiler-and-why-class-objects-work-against-memoization/react-compiler-and-why-class-objects-work-against-memoization.jpg
---
React Compiler is now stable and production-ready (React blog, October 7, 2025), and it significantly reduces the need for manual `useMemo`, `useCallback`, and `React.memo`.

This is great news for most React codebases, especially those with clean function components and immutable data. But there is one pattern that becomes increasingly awkward: class-heavy object models with methods that compute derived values.

If your render-time logic depends on class instances, compiler memoization can become less precise than you want, and you often end up re-introducing manual memoization just to recover control.

<!-- /preview -->

## React Compiler optimizes by observable dependencies

The official docs explain that React Compiler automatically memoizes components and values based on static analysis and heuristics:

- [React Compiler Introduction](https://react.dev/learn/react-compiler/introduction)
- [React Compiler v1.0 blog post](https://react.dev/blog/2025/10/07/react-compiler-1)

The key detail is this: memoization still depends on what React can observe as inputs.

In React, memoized comparisons are reference-based for objects (`Object.is` semantics). The `memo` and `useMemo` docs both make this explicit:

- [memo](https://react.dev/reference/react/memo)
- [useMemo](https://react.dev/reference/react/useMemo)

So if the meaningful value is hidden inside an object instance, and that instance reference changes, React has to assume the value changed too.

## `ElementClass` example

Suppose you model an element like this:

    class ElementClass {
      constructor(private readonly isoDate: string) {}

      public getFormattedDate(): string {
        const date = new Date(this.isoDate);

        if (Number.isNaN(date.getTime())) {
          return 'Invalid date';
        }

        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        });
      }
    }

And in a component:

    export function Row({ elementInstance }: { elementInstance: ElementClass }) {
      const formattedDate = elementInstance.getFormattedDate();
      return <span>{formattedDate}</span>;
    }

This is readable. But from the outside, the relevant reactive input is effectively `elementInstance` (the object reference).

If your state management layer returns a new `ElementClass` instance, React/Compiler sees a new dependency and the formatted value is recomputed, even when the underlying `isoDate` string did not change.

## The manual escape hatch works, but it is noisy

You can force a narrower dependency:

    class ElementClass {
      constructor(public readonly isoDate: string) {} // <-- expose isoDate as a public property
      // unchanged
    }

    export function Row({ elementInstance }: { elementInstance: ElementClass }) {
      const formattedDate = useMemo(
        () => elementInstance.getFormattedDate(),
        [elementInstance.isoDate],
      );

      return <span>{formattedDate}</span>;
    }

This is valid, and React explicitly documents `useMemo`/`useCallback` as escape hatches even with the compiler:

- [What should I do about useMemo, useCallback, and React.memo?](https://react.dev/blog/2025/10/07/react-compiler-1#what-should-i-do-about-usememo-usecallback-and-reactmemo)

But at this point, we are doing manual dependency plumbing again, plus we had to expose internals to the UI.

## A compiler-friendly alternative: plain data + pure helpers

If the UI receives plain immutable data, dependencies become explicit and cheap:

    type Element = {
      isoDate: string;
    };

    export function Row({ element }: { element: Element }) {
      const formattedDate = DateHelpers.formatDate(element.isoDate);
      return <span>{formattedDate}</span>;
    }

Now the relevant input of `DateHelpers.formatDate` is a primitive (`isoDate`), not hidden state behind a method call on a class instance. In this way, the output of `formatDate` can be memoized by the compiler taking `isoDate` as the only dependency, which is a primitive value that will trigger memoization correctly when it changes.

One could object that, even in this example with a simple object, the entire `element` is still passed down to the component. As a result, `Row` will be re-rendered anyway; the only real difference is that `formattedDate` is no longer recomputed.

This is true: if you pass a whole object and its reference changes, that component re-renders. We will get to that in a moment.

Before exploring the solution to that problem, I want to highlight that on large apps, the difference between class instances and plain data can still be significant, even if considering only the memoization of derived values. React Compiler injects memoization cells and dependency checks. If your dependencies are unstable object references, cache hit rate is low:

1. you still pay extra memory for memoization slots,
2. you still run dependency checks,
3. you still recompute because references change.

In other words, with class-instance-heavy render paths and no manual memoization, __compiler optimizations can become mostly overhead instead of a performance win__.

Now, back to the problem of passing a whole object. If you pass an object and its reference changes, the component re-renders. This is true regardless of whether the object is a class instance or a plain object. if you want to avoid unnecessary re-renders caused by object reference changes, you can pass only the primitive that the child actually needs, instead of the whole object. This way, the component will only re-render when the relevant primitive value changes, and not when the object reference changes:

    export function Row({ isoDate }: { isoDate: string }) {
      const formattedDate = DateHelpers.formatIsoDate(isoDate);
      return <span>{formattedDate}</span>;
    }

Now the dependency is explicit and primitive (`isoDate`) instead of hidden behind instance methods.

A possible objection is that, even when using an object-oriented approach, one could still pass to the child component the result of `element.getFormattedDate()`, which is again just a string:

    function Parent({ element }: { element: ElementClass }) {
      return <Row formattedDate={element.getFormattedDate()} />;
    }

    function Row({ formattedDate }: { formattedDate: string }) {
      return <span>{formattedDate}</span>;
    }

`Row` now receives a primitive prop, but the expensive or repeated computation has simply moved one level up, into `Parent`.

If `element` changes by reference frequently, `element.getFormattedDate()` is still re-executed frequently. So the bottleneck is not removed, only relocated.

With a data-first shape, you can pass `isoDate` directly across boundaries and keep derivations as pure functions close to where they are needed.

This aligns much better with React's purity and immutability model:

- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- [immutability lint rule](https://react.dev/reference/eslint-plugin-react-hooks/lints/immutability)

## Practical rule of thumb

Inside React render paths, prefer data-first models over behavior-rich class instances.

Use classes at boundaries if they add value (domain, parsing, adapters), but pass serializable plain data to components and keep render-time derivations as pure functions.

With React Compiler, this usually gives you:

1. better automatic memoization hit rate,
2. fewer manual `useMemo` escape hatches,
3. clearer dependency reasoning,
4. less accidental recomputation caused by object identity churn.

React Compiler removes a lot of optimization work, but it still rewards code where dependencies are explicit. For UI rendering in modern React, plain objects plus pure helper functions are often the more scalable choice.
