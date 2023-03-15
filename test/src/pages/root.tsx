import { createState, createEffect, createAsyncCall } from 'lampjs';

const Root = () => {
  type testRes = {
    working: boolean;
  };

  const testBuilder = (res: testRes | null) => <div>working: {res?.working ? 'working' : 'not working'}</div>;

  const async = createAsyncCall.get<testRes>('/api/test');
  const test = createState<testRes | null>(null, testBuilder);

  async((val) => {
    test(val.data);
  });

  createEffect(() => {
    console.log(test().value);
  }, [test]);

  return <div>{test().el}</div>;
};

export default Root;
