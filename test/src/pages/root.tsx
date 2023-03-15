import Test from '../components/test';
import { test } from '../contexts/test';
import { ChangeEvent } from 'lampjs';

const Root = () => {
  test('working');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    test(e.currentTarget.value);
  };

  return (
    <div>
      <Test />
      <input
        onChange={handleChange}
        value={test}
      />
      {test().el()}
      {test().el()}
      {test().el()}
    </div>
  );
};

export default Root;
