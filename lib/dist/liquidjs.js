export const render = () => { };
export const mount = (root, el) => {
    if (!root)
        return;
    root.appendChild(el);
};
