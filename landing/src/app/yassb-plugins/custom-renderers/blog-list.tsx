import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import showdown from 'showdown'
import { FilePathsForPublicFileList, Renderer, RendererProps } from 'yassb-web'
import { sortBlogsByDate } from './sort-blogs-by-date'
import { DateFormatter } from '../custom-directives/date-formatter-directive.class'

export const blogList: Renderer = ({ source, lang, options, frontMatterStore }: RendererProps<Array<FilePathsForPublicFileList>>): string => {
  const divs = [];
  const converter = new showdown.Converter();
  sortBlogsByDate(source, frontMatterStore);

  source.forEach((filePaths, index) => {
    const mT = index === 0 ? '' : ' mt-10';
    const mainDivClass = `w-full lg:w-7/12 ml-auto mr-auto p-10 border-2 rounded-md shadow-md${mT}`
    const date = frontMatterStore[filePaths.absolutePath].date as unknown as Date;
    let previewContent = converter.makeHtml(frontMatterStore[filePaths.absolutePath].excerpt as string);
    // Remove from previewContent the <p> tags that are added by showdown
    previewContent = previewContent.replace(/<\/?p>/g, '');
    if (frontMatterStore[filePaths.absolutePath])
      divs.push(
        <div key={filePaths.absolutePath} className={mainDivClass}>
          <h3>
            <a className="text-lg font-bold" href={filePaths.absoluteUrl}>{frontMatterStore[filePaths.absolutePath].title}</a>
          </h3>
          <p className="text-sm text-gray-700">Published on {new DateFormatter(date.toISOString(), 'YYYY/MM/DD').doFormat()} by {frontMatterStore[filePaths.absolutePath].author}</p>
          <div className="mt-5 row-preview">
            <div className="content-preview text-justify" dangerouslySetInnerHTML={{ __html: previewContent }}></div>
            <div className="background"></div>
          </div>
          <div className="mt-5 text-right">
            <a className="text-gray-700" style={{ fontVariant: "small-caps" }} href={filePaths.absoluteUrl}>Read more</a>
          </div>
        </div>
      );
  });
  return renderToStaticMarkup(
    <div className="mx-auto mt-36 mb-36">
      {...divs}
    </div>
  );
}
