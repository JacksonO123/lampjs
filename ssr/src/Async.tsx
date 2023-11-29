import Test from './Test';

const Async = async () => {
  const res = await fetch<{ hello: 'world' }>('http://localhost:3001');
  const data = await res.json();
  console.log(data);

  return (
    <span>
      in async
      <Test onClick={() => console.log('clicked in async')} />
    </span>
  );
};

export default Async;
