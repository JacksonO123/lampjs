import { createState } from 'liquidjs';

const Test = () => {
  const num = createState(0);

  const handleClick = () => {
    num((current) => current + 1);
  };

  return (
    <div>
      {num().el}
      <button onClick={handleClick}>hi</button>
    </div>
  );
};

export default Test;
