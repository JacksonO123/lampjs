import { createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const num = createState(0);

  const handleClick = () => {
    num((prev) => prev + 1);
  };

  return (
    <div class="root">
      <img src="/lamp.svg" alt="" />
      <h1>LampJs</h1>
      <span>A powerful, lightweight JS framework</span>
      <button onClick={handleClick}>Count is {num()}</button>
    </div>
  );
};

export default Root;
