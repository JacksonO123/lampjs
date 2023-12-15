type LayoutProps = {
  children: JSX.Element | JSX.Element[];
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta
          name="description"
          content="A powerful lightweight JavaScript framework"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/lamp.svg"
        />
        <title>LampJs</title>
      </head>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
