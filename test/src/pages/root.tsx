import { ChangeEvent, createEffect, createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const text = createState("", (val) => {
    const num = createState(0);

    const handleClick = () => {
      num((prev) => prev + 1);
    };

    return (
      <div>
        {val.split("").map((c) => (
          <button onClick={handleClick}>
            {c} {num().el()}
          </button>
        ))}
      </div>
    );
  });

  createEffect(() => {
    console.log(text().value);
  }, [text]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    text(value);
  };

  return (
    <div class="root">
      <input onChange={handleChange} />
      {text().el()}
    </div>
  );
};

export default Root;
