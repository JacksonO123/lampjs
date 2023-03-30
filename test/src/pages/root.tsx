import { ChangeEvent, createEffect, createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const disabled = createState(false);
  const text = createState("");

  const handleClick = () => {
    disabled((prev) => !prev);
  };

  const changeText = (e: ChangeEvent<HTMLInputElement>) => {
    text(e.currentTarget.value);
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
      <textarea disabled={disabled} onChange={changeText}>
        test
      </textarea>
      {text().el()}
    </div>
  );
};

export default Root;
