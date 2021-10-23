import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Converter } from 'showdown';
import { Renderer, RendererProps } from 'yassb-web';

interface FeaturesList {
  label: string;
  data: Array<string>;
}

/**
 * Generates a list of features to be displayed on the landing page.
 * @remarks uses Showdown to parse MD elemento to HTML. Removes <p> and </p> tags to show text inline. It does so with `replace` as otherwise is not supported by showdown.
 * @see https://github.com/showdownjs/showdown/issues/573 (on removing `p` tags).
 */
export const featuresList: Renderer = ({ source, lang, options }: RendererProps<Array<FeaturesList>>) => {
  const mainContainer = []
  source.forEach((section, index) => {
    const sectionEles = [<h2 key={'h2-' + index} className="font-medium title-font tracking-widest text-gray-900 mb-4 text-sm text-center sm:text-left">{section.label}</h2>];
    const featuresList = [];
    section.data.forEach((feature, index) => {
      const featureText = new Converter().makeHtml(feature).replace(/<\/?p[^>]*>/g, '').replace(/<\/?code[^>]*>/g, '');
      featuresList.push(
        <div key={index} className="mb-2">
          <span className="text-prussian-blue-600 bg-prussian-blue-200 w-4 h-4 mr-2 rounded-full inline-flex items-center justify-center">
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" className="w-3 h-3" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </span>
          <span dangerouslySetInnerHTML={{ __html: featureText }}></span>
        </div>
      )
    });
    sectionEles.push(
      <nav key={index} className="flex flex-col sm:items-start sm:text-left text-center items-center -mb-1">{...featuresList}</nav>
    );
    const sectionContainer = <div key={section} className="p-4 lg:w-1/4 sm:w-1/2 w-full">{...sectionEles}</div>;
    mainContainer.push(sectionContainer);
  });

  return renderToStaticMarkup(
    <div className="flex flex-wrap -m-4">
      {...mainContainer}
    </div>
  );
}
