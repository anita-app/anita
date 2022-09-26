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
    const date = frontMatterStore[filePaths.absolutePath].date as unknown as Date;
    let previewContent = converter.makeHtml(frontMatterStore[filePaths.absolutePath].excerpt as string);
    // Remove all html tags
    previewContent = previewContent.replace(/(<([^>]+)>)/gi, '');
    // limit to 200 characters
    previewContent = previewContent.substring(0, 200) + '...';
    if (frontMatterStore[filePaths.absolutePath])
      divs.push(
        <div key={filePaths.absolutePath} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
          <a href={filePaths.absoluteUrl} className="flex-shrink-0">
            <img className="h-48 w-full object-cover" src={`/assets/images/blog/${frontMatterStore[filePaths.absolutePath].image}`} alt="" />
          </a>
          <div className="flex flex-1 flex-col justify-between bg-white p-6">
            <div className="flex-1">
              <p className="text-sm font-medium text-prussian-blue-600">
                <a href={filePaths.absoluteUrl} className="hover:underline">{frontMatterStore[filePaths.absolutePath].type}</a>
              </p>
              <a href={filePaths.absoluteUrl} className="mt-2 block">
                <p className="text-xl font-semibold text-gray-900">{frontMatterStore[filePaths.absolutePath].title}</p>
                <p className="mt-3 text-base text-gray-500">{previewContent}</p>
                <span className="background"></span>
              </a>
            </div>
            <div className="mt-6 flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  <a href={filePaths.absoluteUrl} className="hover:underline">{frontMatterStore[filePaths.absolutePath].author}</a>
                </p>
                <div className="flex space-x-1 text-sm text-gray-500">
                  <time dateTime={date.toISOString().split('T')[0]}>{new DateFormatter(date.toISOString(), 'month DD, YYYY').doFormat()}</time>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  });
  return renderToStaticMarkup(
    <>
      {...divs}
    </>
  );
}
