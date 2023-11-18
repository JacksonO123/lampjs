import Test from './Test';

const App = () => {
  const handleClick = () => {
    console.log('clicked');
  };

  return (
    <html>
      <head>
        <title>test</title>
      </head>
      <body>
        in body
        <br />
        <Test onClick={handleClick} />
      </body>
    </html>
  );
};

export default App;
