// Converts a col size in the range of 1-12 to the equivalente TailwindCSS width class
export function calcWidth(width: string): string {
  return `w-full lg:w-${width}/12`;
}