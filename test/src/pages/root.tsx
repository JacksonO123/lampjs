import { createState, For } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const arr = createState([0]);

  const addItem = () => {
    arr((prev) => [...prev, prev[prev.length - 1] + 1]);
  };

  return (
    <div class="root">
      <button onClick={addItem}>Add</button>
      <For each={arr()}>{(item) => item}</For>
    </div>
  );
};

export default Root;
