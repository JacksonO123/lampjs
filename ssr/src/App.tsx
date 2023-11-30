// import { ServerSuspense } from '@jacksonotto/lampjs-ssr';
// import Async from './Async';
import Test from './Test';
import './test.css';

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
      <body class="make-blue">
        in body pt2.3
        <br />
        <Test onClick={handleClick} />
        {/* <ServerSuspense */}
        {/*   fallback={<span>waiting</span>} */}
        {/*   waitServer */}
        {/*   suspenseId="test" */}
        {/* > */}
        {/*   <Async /> */}
        {/* </ServerSuspense> */}
      </body>
    </html>
  );
};

export default App;
