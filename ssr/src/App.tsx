// import { ServerSuspense } from '../pkg';
import { ServerRouter } from '../pkg';
// import Test from './Test';
// import Async from './Async';
import { Route } from '@jacksonotto/lampjs';

const App = () => {
  // const handleClick = () => {
  //   console.log('clicked');
  // };

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
        <ServerRouter>
          <Route path="/">
            <h1>home</h1>
            in body pt2.3
            {/* <br /> */}
            {/* <Test onClick={handleClick} /> */}
            {/* <ServerSuspense */}
            {/*   fallback={<span>waiting</span>} */}
            {/*   waitServer */}
            {/*   suspenseId="test" */}
            {/* > */}
            {/*   <Async /> */}
            {/* </ServerSuspense> */}
          </Route>
          <Route path="/more">
            <h1>more things</h1>
          </Route>
        </ServerRouter>
      </body>
    </html>
  );
};

export default App;
