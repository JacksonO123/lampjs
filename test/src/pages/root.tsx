import { createEffect, createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const disabled = createState(false);

  const handleClick = () => {
    disabled((prev) => !prev);
  };

  createEffect(() => {
    console.log(disabled().value);
  }, [disabled]);

  return (
    <div class="root">
      <img src="/lamp.svg" alt="" />
      <h1>LampJs</h1>
      <span>A powerful, lightweight JS framework</span>
      <button onClick={handleClick}>Toggle</button>
      <textarea disabled={disabled}>test</textarea>
    </div>
  );
};

export default Root;
