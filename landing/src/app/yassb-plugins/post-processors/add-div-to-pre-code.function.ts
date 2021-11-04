export function addDivToPreCode(content: string): string {
  content = content.replace(/<pre>\s*\n*<code>/g, '<div class="code-block"><pre class="d"><code>')
  content = content.replace(/<\/code>\s*\n*<\/pre>/g, '</code><!-- --></pre></div>')
  return content;
}