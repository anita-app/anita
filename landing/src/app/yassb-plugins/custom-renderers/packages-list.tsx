import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Renderer, RendererProps } from 'yassb-web';

interface PackageList {
  [packageName: string]: {
    licenses: string;
    repository: string;
    publisher: string;
    url: string;
    email: string;
    path: string;
    licenseFile: string;
  }
}

/**
 * Generates a list of features to be displayed on the landing page.
 * @remarks uses Showdown to parse MD elemento to HTML. Removes <p> and </p> tags to show text inline. It does so with `replace` as otherwise is not supported by showdown.
 * @see https://github.com/showdownjs/showdown/issues/573 (on removing `p` tags).
 */
export const packagesList: Renderer = ({ source }: RendererProps<PackageList>) => {
  const liContainer = []
  for (const packageName in source) {
    const packageData = source[packageName];
    if (!packageData.publisher)
      liContainer.push(<li key={packageName}><a href={packageData.repository} target="_blank">{packageName}</a></li>);
    else
      if (!packageData.url)
        liContainer.push(<li key={packageName}><a href={packageData.repository} target="_blank">{packageName}</a>, by {packageData.publisher}</li>);
      else
        liContainer.push(<li key={packageName}><a href={packageData.repository} target="_blank">{packageName}</a>, by <a href={packageData.url} target="_blank">{packageData.publisher}</a></li>);

  };

  return renderToStaticMarkup(
    <ul>
      {...liContainer}
    </ul>
  );
}

function makeAuthor(packageData: PackageList[0]): string {
  if (!packageData.url)
    return packageData.publisher;

  return ``;
}