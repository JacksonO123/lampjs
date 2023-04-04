import { ChangeEvent, createEffect, createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const disabled = createState(false, (disabled) => {
    const text = createState("test");
    const changeText = (e: ChangeEvent<HTMLInputElement>) => {
      text(e.currentTarget.value);
    };

    return [
      <div>
        <textarea
          disabled={disabled}
          onChange={changeText}
          value={text}
        ></textarea>
        {text().el()}
      </div>,
      [text],
    ];
  });

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
      {(() => 2)()}
      <span>A powerful, lightweight JS framework</span>
      <button onClick={handleClick}>Toggle</button>
      {disabled().el()}
    </div>
  );
};

export default Root;
