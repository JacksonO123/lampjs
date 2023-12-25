import "./Layout.css";

type LayoutProps = {
  children: JSX.Element | JSX.Element[];
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Server side rendering !!!" />
        <link rel="icon" type="image/svg+xml" href="/lamp.svg" />
        <title>LampJs App</title>
      </head>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
