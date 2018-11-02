import highlight from 'highlight.js/lib/highlight';
import 'highlight.js/styles/solarized-dark.css';
// assumption: package `highlight.js` is installed
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import lua from 'highlight.js/lib/languages/lua';
import shell from 'highlight.js/lib/languages/shell';

window.hljs = highlight;
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('shell', shell);
