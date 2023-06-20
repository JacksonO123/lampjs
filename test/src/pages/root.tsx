import { ChangeEvent, createEffect, createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const text = createState("");
  const nums = createState<number[]>([]);
  const elRef = createState<any>(null);

  createEffect(() => {
    console.log(elRef().value);
  }, [elRef()]);

  const handleClick = () => {
    nums((prev) => [...prev, 1]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    text(e.currentTarget.value);
  };

  return (
    <div class="root">
      <img src="/lamp.svg" alt="" />
      <h1>LampJs</h1>
      <span>A powerful, lightweight JS framework</span>
      <button onClick={handleClick}>Count is {nums()}</button>
      <input onChange={handleChange} value={text()} />
      <div class="test" ref={elRef}></div>
    </div>
  );
};

export default Root;
