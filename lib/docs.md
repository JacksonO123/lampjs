# LampJs Documentation

LampJs is a lightweight framework meant to simplify the process of building a highly efficient reactive frontend.

## When to use LampJs

LampJs is made for developers who want a lightweight, efficient, and flexible framework.

## Getting Started

Start by using your package manager of choice to create a lampjs-app template (npm and pnpm examples are shown)

pnpm:

```sh
pnpm create lampjs-app
```

npm:

```sh
npx create-lampjs-app
```

Continue by following the instructions in the cli

## Project Structure

- `public`
  - For assets
- `src`
  - Where the magic happens
  - `contexts`
    - Place to keep global state variables
  - `components`
    - Place to keep all components
  - `pages`
    - For organizing the page components for the app
    - Not for client side routing (shown later)
  - `main.tsx`
    - Main entry point for the app
- `index.html`
  - Root html page for the application
  - LampJs is a spa framework

## Components

Components in LampJs are similar to components in React or SolidJs. It is a function that returns jsx.

Example:

```tsx
const Counter = () => {
  const count = createState(0);

  return (
    <button onClick={() => count((prev) => prev + 1)}>Count is {num()}</button>
  );
};
```

## State

For simplicity and the fact that not much else is needed, there is only one utility function for managing state: `createState`.

The `createState` function returns a function that returns a "state object" with all the necessary tools to manage the state and effects yourself if you need to.

When calling the function returned by `createState` in the UI (for example in the counter): `{num()}`, LampJs will make a reactive node on the page that updates when the state updates.

To get the current value of the state in the javascript, call the function and get the value property

```typescript
const state = createState(0);
const currentState = state().value;
```

LampJs state is based on signals to be as efficient as possible. The function is lightweight so don't feel bad if you use it a lot.

Because LampJs has less of a reliance on a compiler, it is not able to split reactivity into properties of a state variable if it is an object, or indexes if its an array. For that reason there is a reactive api for rendering those types of data. The reactive api is also used for conditional rendering.

Example:

```tsx
const obj = createState({
  name: "John",
  age: "21",
});

return (
  <div>
    {reactive(
      (obj) => (
        <span>
          {obj.name}&nbsp;{obj.age}
        </span>
      ),
      [obj()]
    )}
  </div>
);
```

To make iterating an array reactively easier, you can use the `For` element. The `each` property is the array state variable, and the children of the component is a function that is ran for each item in the array to render it.

**Possible future change:** This is based on the reactive api which depends on having one element node to replace meaning that the list is wrapped in a div (that you can style by putting more attributes on the `For` element) even though you don't specify to wrap it in a div. In the future the `For` element may manage its own children without the need for a wrapper element.

Example:

```tsx
const arr = createState([1, 2, 3]);

return (
  <For each={arr()}>
    {(item) => (
      <div>
        <span>{item}</span>
        <span>something else</span>
      </div>
    )}
  </For>
);
```

The reactive function takes two parameters, the first is a callback, and the second is the list of state variables to re-render when they change. The parameters of the callback are the list of the state variables in the order they were provided (type safety is preserved).

To update a state variable, call the function with a new value, or use the callback to use the current value easier.

Example:

```typescript
const state = createState(0);

// set state to 1
state(1);

// increment state
state(state().value + 1);

// increment state again
state((prev) => prev + 1);
```

The `createState` function in LampJs in unique because it is not bound to a component, meaning that you can initialize state wherever you want. You can create a state variable in a new file and export it, and it can be imported into any component you want, effectively creating a context.

## Router

A framework wouldn't be complete without a router. The LampJs router is similar to the one in vue, import the Router element and provide it with an object describing the route structure.

Example:

```tsx
// define the routes
const routes = [
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/about",
    element: <About />,
  },
];

// use Router element
<Router routes={routes} />;
```

The Router element does not replace the whole screen content, only the place where it is located. That means that you can have the Router element nested within your component tree.

To link to other pages within the site, use the `Link` component. The `a` component will work, but it will make do a whole page reload every time.

## Effects

Effects in LampJs are simple to create. Simply pass the state variable function into the `createEffect` function.

Example:

```typescript
const count = createState(0);

createEffect(() => {
  console.log(count().value);
}, [count()]);
```

In this example every time `count` is updated, the effect will run and the current value of count will be printed.

## Misc

**Mounting the application**

The `mount` function is used to mount a component of your choice to an element of your choice, in the `create-lampjs-template`, the boilerplate uses `document.body` as the root node to mount to, and a `Router` element to mount.

The `onPageMount` function runs once after the dom is rendered initially. This is used when you want to query an element and be sure it has been mounted on the page.

**Render Cycle and Element References**

Each component function is only called once when it is mounted, and again if it gets mounted again. This means that you are free to use vanilla element query apis such as `getElementById` or `querySelectorAll` to query for your dom elements.

**Types**

Typesafety is handled mostly in the framework, the only type you need to manage is the `Reactive` type. This type is generic and represents a state variable of that type.

A state variable for a string would look like this:

```typescript
type MyType = Reactive<string>;
```

This type is primarily useful for taking state variables as properties to a component.