import { createEffect, createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const show = createState(true, (val) => {
    const num = createState(0, (val) => {
      return <h1>{val}</h1>;
    });

    const handleClick = () => {
      num((prev) => prev + 1);
    };

    createEffect(() => {
      console.log(num().value);
    }, [num]);
    return (
      <span>
        {val ? (
          <button onClick={handleClick}>
            Count is {num().el()}
            {num().el()}
          </button>
        ) : (
          ""
        )}
      </span>
    );
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
