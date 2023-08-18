import { createEffect, createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const elRef = createState<HTMLDivElement | null>(null);

  createEffect(() => {
    console.log(elRef().value);
  }, [elRef()]);

  return (
    <div class="root">
      <div ref={elRef()}>content</div>
    </div>
  );
};

export default Root;
