import { ChangeEvent, createState } from "@jacksonotto/lampjs";
import Letter from "../components/letter";
import "./root.css";

const Root = () => {
  let nums: number[] = [];
  const text = createState("", (val) => {
    const updateNumsIndex = (val: number, index: number) => {
      nums[index] = val;
      console.log(nums);
    };

    console.log(nums);

    return (
      <div>
        {val.split("").map((c, i) => (
          <Letter
            letter={c}
            startNum={nums[i]}
            updateNum={(val) => updateNumsIndex(val, i)}
          />
        ))}
      </div>
    );
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (value.length > nums.length) {
      nums = [...nums, ...Array(value.length - nums.length).fill(0)];
    } else if (value.length < nums.length) {
      nums = nums.slice(0, value.length);
    }
    text(value);
  };

  return (
    <div class="root">
      <input onChange={handleChange} />
      {text().el()}
    </div>
  );
};

export default Root;
