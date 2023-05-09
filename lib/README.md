# LampJs

LampJs is a lightweight js framework. Documentation coming soon.

<br>

## Create LampJs project

To create a new LampJs project run

```sh
pnpm create lampjs-app
```

## To note

LampJs uses a variation of signals that is pure javascript, no compiler used. This also means that it is difficult to detect when a property passed to the JSX factory is from a stateful object, and to get that state. I am looking into possible solutions to this but at the moment rendering properties from stateful objects will not be reactive, they will need to be split into different state variables, or you must implement a builder system of your own. I am hesitant to implement builder functionality seen in v1 of LampJs because it goes against the idea of fine grain reactivity. It introduces a render cycle for the JSX relating to that state object. Do not worry about creating a lot of state, the `createState` function is lightweight.

_By Jackson Otto_
