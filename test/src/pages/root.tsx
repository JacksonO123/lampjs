import { createState, reactive } from "@jacksonotto/lampjs";
import Test from "../components/Test";
import "./root.css";

const Root = () => {
  const num = createState(0);

  const addItem = () => {
    num((prev) => prev + 1);
  };

  return (
    <div class="root">
      <button onClick={addItem}>Add</button>
      <Test list={num} />
      {reactive(
        (val: number) => (
          <div></div>
        ),
        [num()]
      )}
    </div>
  );
};

export default Root;
