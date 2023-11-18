import { createState } from '@jacksonotto/lampjs';

type TestProps = {
  onClick: () => void;
};

const Test = ({ onClick }: TestProps) => {
  const state = createState(0);

  const handleClick = () => {
    state((prev) => prev + 1);
    onClick();
  };

  return (
    <div>
      <button onClick={handleClick}>test {state()}</button>
    </div>
  );
};

export default Test;
