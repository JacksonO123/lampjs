export const mount = (root, el) => {
    if (!root)
        return;
    root.appendChild(el);
};
export const createState = (value) => {
    let node = document.createElement('span');
    node.innerHTML = value + '';
    let currentValue = value;
    return (newValue) => {
        if (newValue) {
            if (typeof newValue === 'function') {
                const updateCb = newValue;
                currentValue = updateCb(currentValue);
            }
            else {
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
