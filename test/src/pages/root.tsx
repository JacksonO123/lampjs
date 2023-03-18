import { createState } from "@jacksonotto/lampjs";
import "./root.css";

const Root = () => {
  const show = createState(true, (val) => {
    const num = createState(0, (val) => {
      const thing = createState(10);

      setTimeout(() => {
        console.log("run");
        thing(100);
      }, 1000);

      return (
        <h1>
          {val}
          {thing().el()}
        </h1>
      );
    });

    const handleClick = () => {
      num((prev) => prev + 1);
    };

    return (
      <span>
        {val ? (
          <div>
            <button onClick={handleClick}>another</button>
            Count is {num().el()}
          </div>
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
