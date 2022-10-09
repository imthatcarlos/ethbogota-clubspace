import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      <body className="selection:bg-indigo-600 selection:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
