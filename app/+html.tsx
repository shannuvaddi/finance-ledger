import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Web-only: the root HTML for every page during static rendering. Runs in Node.js,
// so no DOM/browser APIs here. Colors mirror constants/Colors.ts.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Chanakya — Your finance advisor</title>
        <meta name="description" content="Track, record, and ask about your spending — all in one place." />
        <meta name="theme-color" content="#FAF5F0" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1C1410" media="(prefers-color-scheme: dark)" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalCss = `
:root { color-scheme: light dark; }
body {
  background-color: #FAF5F0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@media (prefers-color-scheme: dark) {
  body { background-color: #1C1410; }
}

/* Pressables (TouchableOpacity renders a focusable div) and tab links */
div[tabindex="0"], a[role="tab"] { transition: filter 120ms ease, opacity 120ms ease; }
@media (hover: hover) {
  div[tabindex="0"]:hover, a[role="tab"]:hover { filter: brightness(0.96); }
  @media (prefers-color-scheme: dark) {
    div[tabindex="0"]:hover, a[role="tab"]:hover { filter: brightness(1.15); }
  }
}

/* Keyboard focus ring in the brand orange; no outline on mouse click */
:focus { outline: none; }
:focus-visible { outline: 2px solid #E65100; outline-offset: 2px; border-radius: 10px; }
input:focus-visible, textarea:focus-visible { outline: none; }

/* Thin, warm scrollbars */
* { scrollbar-width: thin; scrollbar-color: #D9C7B6 transparent; }
@media (prefers-color-scheme: dark) {
  * { scrollbar-color: #4A3626 transparent; }
}
`;
