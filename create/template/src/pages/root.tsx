import { createState, Link } from "@jacksonotto/lampjs";
import Counter from "../components/Counter";
import "./root.css";

const Root = () => {
  const num = createState(0);

  const handleClick = () => {
    num((prev) => prev + 1);
  };

  return (
    <div class="root">
      <img src="/lamp.svg" alt="" />
      <h1>LampJs</h1>
      <span>A powerful, lightweight JS framework</span>
      <Counter />
      <Link href="/about">about</Link>
    </div>
  );
};

export default Root;
