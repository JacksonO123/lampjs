# LampJs

LampJs is a lightweight js framework. Documentation coming soon.

<br>

## Create LampJs project

To create a new LampJs project run

```sh
pnpm create lampjs-app
```

## To note

LampJs uses a variation of signals that is pure javascript, no compiler used. LampJs has interesting support for some usual syntax you may expect from frameworks like React or SolidJs such as being able to loop over a state and having it update reactivly (hmm). The purpose of this framework is to create an easy and lightweight way of interacing with a simple state model for simple apps. I mostly use it as a bootstrap for creating a demo with `SimulationJS`.

For doing things like looping over a reactive array, you need to use the `reactive` api. This api works but it kinda defeats the purpose of fine grain reactivity. Hard to get around this without a compiler.

_By Jackson Otto_
