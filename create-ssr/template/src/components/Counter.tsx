import { createState } from '@jacksonotto/lampjs';

const Counter = () => {
  const count = createState(0);
  return <button onClick={() => count((prev) => prev + 1)}>Count is {count()}</button>;
};

export default Counter;
