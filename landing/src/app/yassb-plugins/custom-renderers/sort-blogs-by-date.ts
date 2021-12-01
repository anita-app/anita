import { FilePathsForPublicFileList, FrontMatterDataStore } from 'yassb-web';

export function sortBlogsByDate(source: FilePathsForPublicFileList[], frontMatterStore: FrontMatterDataStore) {
  source.sort((eleA, eleB) => {
    const dataA = frontMatterStore[eleA.absolutePath];
    const dataB = frontMatterStore[eleB.absolutePath];

    if (dataA.date < dataB.date) {
      return 1;
    } else if (dataA.date > dataB.date) {
      return -1;
    } else {
      return 0;
    }
  });
}

