import { createElement } from "@jacksonotto/lampjs";
const Test = () => {
  return /* @__PURE__ */ createElement("div", null, "test");
};
console.log(/* @__PURE__ */ createElement(Test, null));
console.log("working");
