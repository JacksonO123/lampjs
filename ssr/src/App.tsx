import { createState } from '@jacksonotto/lampjs';
import './test.css';
import { ServerFor } from '@jacksonotto/lampjs-ssr';

const App = () => {
  const arr = createState([1, 2, 3, 4]);

  setTimeout(() => {
    arr((prev) => [...prev, 1]);
  }, 1000);

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
      <body class="make-blue">
        <ServerFor each={arr()}>{(item) => <span>{item()}</span>}</ServerFor>
      </body>
    </html>
  );
};

export default App;
