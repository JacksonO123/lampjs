import './Layout.css';

type LayoutProps = {
  children: JSX.Element | JSX.Element[];
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta
          name="description"
          content="Server side rendering !!!"
        />
        <title>test</title>
      </head>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
