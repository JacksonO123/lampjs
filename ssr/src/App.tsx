import Test from './Test';
import Async from './Async';
import { ServerSuspense } from '../pkg';

const App = () => {
  const handleClick = () => {
    console.log('clicked');
  };

  return (
    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>test</title>
      </head>
      <body>
        in body pt2.3
        <br />
        <Test onClick={handleClick} />
        <ServerSuspense fallback={<span>waiting</span>}>
          <Async />
        </ServerSuspense>
      </body>
    </html>
  );
};

export default App;
