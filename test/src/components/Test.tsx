import { reactive, StateFactory } from "@jacksonotto/lampjs";

type TestProps = {
  list: StateFactory<number>;
};

const Test = ({ list }: TestProps) => {
  return reactive((data: number) => <div>{data}</div>, [list()]);
};

export default Test;
