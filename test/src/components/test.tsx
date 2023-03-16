import { ChangeEvent } from '@jacksonotto/lampjs';
import { test } from '../contexts/test';

const Test = () => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    test(e.currentTarget.value);
  };

  return (
    <div>
      <input
        onChange={handleChange}
        value={test}
      />
      {/* {test().el} */}
    </div>
  );
};

export default Test;
