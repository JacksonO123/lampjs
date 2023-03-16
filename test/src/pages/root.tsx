import { createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const show = createState(true, (val) => {
    return <span>{val ? "showing" : ""}</span>;
  });

  const handleShow = () => {
    show((prev) => !prev);
  };

  return (
    <div class="root">
      <img src="/lamp.svg" alt="" />
      <h1>LampJs</h1>
      <span>A powerful, lightweight JS framework</span>
      <button onClick={handleShow}>Toggle show</button>
      {show().el()}
    </div>
  );
};

export default Root;
