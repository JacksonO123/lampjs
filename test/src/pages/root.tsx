import { createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const checked = createState(true);

  setTimeout(() => {
    checked(false);
  }, 1000);

  return (
    <div class="root">
      <input type="checkbox" checked={checked()} />
    </div>
  );
};

export default Root;
