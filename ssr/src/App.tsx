import './test.css';
import { Suspense } from '@jacksonotto/lampjs-ssr';
// import Async from './Async';

const App = () => {
  const res = fetch<{ hello: 'world' }>('http://localhost:3001');

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
        <Suspense
          fallback={<span>waiting</span>}
          waitServer
          suspenseId="test"
          decoder={(value) => value.text()}
          render={(val: any) => {
            return <span>before {val}</span>;
          }}
        >
          {res}
          {/* <Async /> */}
        </Suspense>
      </body>
    </html>
  );
};

export default App;
