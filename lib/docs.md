# LampJs Documentation

LampJs is a lightweight framework meant to simplify the process of building a highly efficient and performant reactive frontend.

## When to use LampJs

LampJs is made for developers who want a lightweight, efficient, performance focused, and flexible framework.

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
    - Contains router element
  - `main.tsx`
    - Main entry point for the app
- `index.html`
  - Root html page for the application
  - LampJs is a spa framework

## Components

Components in LampJs are similar to components in React or SolidJs. It is a function that returns JSX.

Example:

```tsx
const Counter = () => {
  const count = createState(0);

  return <button onClick={() => count((prev) => prev + 1)}>Count is {num()}</button>;
};
```

Components can be asynchronous, meaning that they return a `Promise`. This is a new feature that is catering towards the **_upcoming_** ssr functionality.

Waiting for promises to complete before mounting them is not supported by the `createElement` out of the box to keep the mounting process as efficient as possible. To mount an async component, use the `Suspense` component.

Example:

```tsx
const Async = async () => {
  // component must wait for fetch
  const res = await fetch('some_endpoint');

  return <span>from async</span>;
};

const Root = () => {
  return (
    <div class="root">
      <Suspense fallback={<span>not here</span>}>
        <Async />
      </Suspense>
    </div>
  );
};
```

In this case the promise is a component that returns JSX, so the value can just be set to the component. Other times the promise will return data in which case you must specify how to render the result in the `Suspense`

```ts
// Suspense props type
type SuspenseProps<T> = {
  // what to render while waiting
  fallback: Element | Element[];
  // a way to handle promise result with custom logic
  decoder?: (res: ResponseData<T>) => any;
  // specify how to render result
  render?: (value: T) => Element | Element[];
  // async component or promise
  children: T | Element;
};
```

Example:

```tsx
const Root = () => {
  // create promise with fetch
  // response is string instead of an object
  // this type cannot be parsed by json parser
  const res: FetchResponse<string> = fetch('http://localhost:3001');

  return (
    <div class="root">
      <Suspense
        fallback={<span>waiting</span>}
        // use the text decoder to decode the result
        decoder={(res) => res.text()}
        // specify a way to render the result
        render={(value) => <span>The value is: {value}</span>}
      >
        {val}
      </Suspense>
    </div>
  );
};
```

## State

For simplicity and the fact that not much else is needed, there is only one utility function for managing state: `createState`.

The `createState` function returns a function that returns a "state object" with all the necessary tools to manage the state and effects yourself if you need to. Most of the state object utilities are abstracted on by other features of the framework meaning you will only need to interact with the `value` property on state objects.

When calling the function returned by `createState` in the JSX (for example in the counter): `{num()}`, LampJs will make a reactive node on the page that updates when the state updates.

To get the current value of the state in the javascript, call the function and get the value property

```typescript
const state = createState(0);
// createState<T>(T) -> State<T>
// State<T> -> (T | ((T) => void) | undefined) -> Reactive<T>
// Reactive<T> : { ..., value: T }
const currentState = state().value;
```

To update a state variable, call the function with a new value, or use the callback to use the current value easier.

```typescript
const state = createState(0);

// set state to 1
state(1);

// increment state
state(state().value + 1);

// increment state again
state((prev) => prev + 1);
```

LampJs state is based on signals to be as efficient as possible. The function is lightweight so don't feel bad if you use it a lot.

The `createState` function in LampJs is not bound to a component, meaning that you can initialize state wherever you want. You can create a state variable in a new file and export it, and it can be imported into any component you want, this is the pattern of creating a context.

The `reactiveElement` api can be used to render a chunk of JSX, or a value, when a state variable changes.

Example:

```tsx
const obj = createState({
  name: 'John',
  age: '21'
});

return (
  <div>
    <span>
      {reactiveElement((obj) => obj.name, [obj()])}
      <br />
      {reactiveElement((obj) => obj.age, [obj()])}
    </span>
  </div>
);
```

This example only works using `reactiveElement` because LampJs does not use a compiler, this is only transpiled from JSX to js and that is all. This means that by taking a property from the value of a reactive state, LampJs will not be able to tell that it should watch for changes, because it won't see the use of the signal. You must use `reactiveElement` to watch for updates on the signal and return the property you want.

The `reactiveElement` function takes two parameters, the first is a callback, and the second is the list of state variables to re-render when they change. The parameters of the callback are the list of the state variables in the order they were provided (type safety is preserved).

The `reactiveElement` api will always return an html element or text node with the up to date value. But in some cases you may want to use reactive variables within new value. To make this easier, you can use the `reactive` api.

Example:

```tsx
const borderRadius = createState(5);

const borderStyle = reactive((radius) => ({ borderRadius: radius }), [borderRadius()]);

return (
  <div style={borderStyle()}>
    <h1>Content</h1>
  </div>
);
```

This is similar to the `reactiveElement` api, but it returns a signal for the return value.

Similar to `reactiveElement`, `reactive` function takes two parameters, the first is a callback, and the second is the list of state variables to update the value with when they change. The parameters of the callback are the list of the state variables in the order they were provided (type safety is preserved). The return can be whatever value you want.

To make iterating a reactive array easier, you can use the `For` element. The `each` property is the array state variable, and the `children` of the component is a function that is ran for each item in the array to render it. The elements are rendered in a list in the parent component. You must provide a callback as the child of the component to tell the framework how to render each element. The callback has two parameters, the first is the item as a state variable generated by LampJs, and the other is the index that is also a state variable generated by LampJs.

Example:

```tsx
const arr = createState([1, 2, 3]);

return (
  <For each={arr()}>
    {(item, index, cleanup) => (
      <div>
        <span>
          {item()} - {index()}
        </span>
        <span>something else</span>
      </div>
    )}
  </For>
);
```

There is a possibility for a memory leak when using the `For` component, so here is how it happens and how to avoid it. This leak is created when you create a signal within the callback for the `For` componenet, and us it in a property of the JSX within the callback. The leak occurs when items are added, then removed. This is a memory leak because the reactive property utilities insert references to callbacks into the signal, preventing garbage collection on the signal once the item of the `For` list is popped. To prevent this, the references to effects inserted into the signal must be removed to enable garbage collection. This is no fun, so a utility cleanup function is provided in the `For` component to make this trivial.

example using cleanup:

```tsx
const arr = createState([1, 2, 3]);

return (
  <For each={arr()}>
    {(item, index, cleanup) => {
      // create signal using reactive api
      const className = reactive((num) => `item ${num}`, [item()]);

      // queue numState to be terminated when this item in the list is removed
      cleanup(className());

      return (
        <div>
          {/* use signal in JSX property */}
          <span class={className()}>
            {item()} - {index()}
          </span>
          <span>something else</span>
        </div>
      );
    }}
  </For>
);
```

To make rendering conditional content easier, you can use the `If` component.

Example:

```tsx
const bool = createState(true);

return (
  <If
    condition={bool()}
    then={<span>Showing!</span>}
    else={<span>Not showing :(</span>}
  />
);
```

The `If` component has three properties, the `condition` prop is the state variable to track, the `then` prop is the content to show when the value is true, and the `else` prop is what to show when the content is false.

Use Switch Case to make having multiple conditions easy

Example:

```tsx
const num = createState(10);

return (
  <div class="root">
    <Switch condition={num()}>
      <Case value={1}>
        <h1>Value is 1</h1>
      </Case>
      <Case value={5}>
        <h1>Value is 5</h1>
      </Case>
      <Case value={10}>
        <h1>Value is 10</h1>
      </Case>
      <Case isDefault>
        <h1>None of the above</h1>
      </Case>
    </Switch>
  </div>
);
```

## Router

A framework wouldn't be complete without a router. The structure of routes can be described using `Router`, and `Route` components.

Example:

```tsx
const PageRouter = () => {
  return (
    <Router>
      <Route path="/">
        {/* page data for this route */}
        <h1>root</h1>
        <Link href="/test">Test</Link>

        {/* nested routes */}
        <Route path="/te*">
          {/*
            no page data is provided, ony nested routes,
            so this page would be 404 error
          */}

          {/* nested routes */}
          <Route path="/test">
            <h1>Test</h1>
          </Route>
          <Route path="/tent">
            <h1>Tent</h1>
          </Route>
        </Route>
        <Route path="/tp">
          <h1>Tp</h1>
        </Route>
      </Route>
    </Router>
  );
};

export default PageRouter;
```

This structure would match paths in this structure:

- `/`
  - `/te*`
    - `*` matches any text, when following some text, it narrows down the match, in this case, it matches all paths that start with `/te`
    - `/test`
    - `/tent`
  - `/tp`

The Router element does not replace the whole screen content, only the place where it is located. That means that you can have the Router element nested within your component tree to update a smaller section of the page.

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

Typesafety is handled mostly in the framework, There are only a few types you will have to manage yourself.

```typescript
// Reactive<T> type
export declare class Reactive<T> {
  ... (other properties that are not important to know)
  value: T;
}

// State<T> type
type State<T> = (newState?: T | ((val: T) => T) | undefined) => Reactive<T>;

// createState<T> type
export declare const createState: <T>(value: T) => State<T>;
```

A state variable for a string would look like this:

```typescript
type MyType = State<string>;

const state = createState('thing');
//    ^ State<string>
```

This type is primarily useful for taking state variables as properties to a component, and would look like this to use.

```tsx
type ComponentProps<T> = {
  prop: State<T>;
};

<Component prop={state} />;
```

You are also able to use the `Reactive` class type to specify a reactive variable, the difference is you must call the state function for it to be valid:

```tsx
type ComponentProps<T> = {
  prop: Reactive<T>;
};

<Component prop={state()} />;
```

The difference between the two is where in the `State` method, you pass the function to the state so it can be updated using that api, in the `Reactive` one, you would be required to use the lower level state apis.

If you are developing a library that takes state variables, prefer to use `Reactive` rather than `State` for consistency.

LampJs also provides a way to enhance typesafety of fetch requests using the `FetchResponse<T>` type.

```ts
type FetchResponse<T> = Promise<ResponseData<T>>;

interface ResponseData<T> extends Response {
  json(): Promise<T>;
}
```

`ResponseData<T>` is a type that overrides the json decoding type on the fetch Response type so that decoding the result will give the type without unmanageable typing.

**Import Aliases**

Import aliases specified by adding them in the `aliases.ts` file in the root project directory. This file exports an object where the key is the new alias and the value is the relative path to the directory. Before the alias is computed a `@` is placed before so a key that is "test" would be aliased as "@test".

The `@` alias is available by default pointing to the `src` directory
