import { reactive, Reactive } from "@jacksonotto/lampjs";

type TestProps = {
  list: Reactive<number>;
};

const Test = ({ list }: TestProps) => {
  return reactive((data: number) => <div>{data}</div>, [list()]);
};

export default Test;
