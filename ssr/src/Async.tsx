const Async = async () => {
  const data = await fetch<{ hello: 'world' }>('http://localhost:3001');
  const res = await data.json();
  console.log(res);

  return <span>in async</span>;
};

export default Async;
