import { createEffect, createState } from "@jacksonotto/lampjs";

type LetterProps = {
  letter: string;
  startNum: number;
  updateNum: (val: number) => void;
};

const Letter = ({ letter, startNum, updateNum }: LetterProps) => {
  const num = createState(startNum);

  const handleClick = () => {
    num((prev) => prev + 1);
  };

  createEffect(() => {
    updateNum(num().value);
  }, [num]);

  return (
    <button class="char-box" onClick={handleClick}>
      {letter} {num().el()}
    </button>
  );
};

export default Letter;
