const Test = () => {
  const handleClick = () => {
    console.log('clicked');
  };

  return <button onClick={handleClick}>hi</button>;
};

export default Test;
