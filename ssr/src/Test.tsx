type TestProps = {
  onClick: () => void;
};

const Test = ({ onClick }: TestProps) => {
  return (
    <div>
      <button onClick={onClick}>test</button>
    </div>
  );
};

export default Test;
