export const mount = (root: HTMLElement | null, el: JSX.Element) => {
  if (!root) return;

  root.appendChild(el);
};

export const createState = <T>(value: T) => {
  let node = document.createElement('span');
  node.innerHTML = value + '';
  let currentValue = value;
  return (newValue?: T | ((val: T) => T)) => {
    if (newValue) {
      if (typeof newValue === 'function') {
        const updateCb = newValue as (val: T) => T;
        currentValue = updateCb(currentValue);
      } else {
        currentValue = newValue;
      }
      const newNode = document.createElement('span');
      newNode.innerHTML = currentValue + '';
      node.replaceWith(newNode);
      node = newNode;
      return {
        el: node,
        value: currentValue
      };
    }
    return {
      el: node,
      value: currentValue
    };
  };
};
