import { ChangeEvent, createState, reactive } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const text = createState("");
  const nums = createState<number[]>([]);

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
      {reactive(
        (val: number[], text: string) => {
          const res = (
            <div>
              {text}
              {val.map((_, index) => (
                <span>{index}</span>
              ))}
            </div>
          );
          console.log(res);
          return res;
        },
        [nums(), text()]
      )}
    </div>
  );
};

export default Root;
