import { createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  // const test = createState({ something: true });
  const test = createState("no");

  // setTimeout(() => {
  //   test((prev) => {
  //     prev.something = false;
  //     console.log(prev);
  //     return prev;
  //   });
  // }, 1000);

  setTimeout(() => {
    test("ok");
  }, 1000);

  return (
    <div class="root">
      <img src="/lamp.svg" alt="" />
      <h1>LampJs</h1>
      <span>A powerful, lightweight JS framework</span>
      <span>test</span>
      {test()}
    </div>
  );
};

export default Root;
