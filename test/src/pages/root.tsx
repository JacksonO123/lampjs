import Test from '../components/test';
import { test } from '../contexts/test';

const Root = () => {
  test('working');

  return (
    <div>
      <Test />
    </div>
  );
};

export default Root;
