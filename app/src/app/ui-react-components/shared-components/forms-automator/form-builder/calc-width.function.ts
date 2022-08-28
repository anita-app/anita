// Converts a col size in the range of 1-12 to the equivalente TailwindCSS width class
// We can't use string concatenation here because it will break the build
// See optimizing for production at https://tailwindcss.com/docs/optimizing-for-production
export function calcWidth (width: string): string {
  switch (width) {
    case '1':
      return 'w-full lg:w-1/12'
    case '2':
      return 'w-full lg:w-2/12'
    case '3':
      return 'w-full lg:w-3/12'
    case '4':
      return 'w-full lg:w-4/12'
    case '5':
      return 'w-full lg:w-5/12'
    case '6':
      return 'w-full lg:w-6/12'
    case '7':
      return 'w-full lg:w-7/12'
    case '8':
      return 'w-full lg:w-8/12'
    case '9':
      return 'w-full lg:w-9/12'
    case '10':
      return 'w-full lg:w-10/12'
    case '11':
      return 'w-full lg:w-11/12'
    case '12':
      return 'w-full lg:w-12/12'
    default:
      return 'w-full'
  }
}
