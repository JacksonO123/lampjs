const Async = async () => {
  const res = await fetch<{ hello: 'world' }>('http://localhost:3001');
  const data = await res.json();
  console.log(data);

  return <div>in async</div>;
};

export default Async;
