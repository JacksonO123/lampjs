import { Color, Cube, randomColor, Simulation, Vector3 } from 'simulationjs';

const Root = () => {
  setTimeout(() => {
    const canvas = new Simulation('canvas');
    canvas.setBgColor(new Color(0, 0, 0));
    canvas.fitElement();

    const cube = new Cube(
      new Vector3(0, 0, 300),
      100,
      100,
      100,
      randomColor(),
      new Vector3(0, 0, 0),
      true,
      true
    );
    canvas.add(cube);
    cube.rotate(new Vector3(0, 360, 0), 4);
  }, 500);

  return <canvas id="canvas" />;
};

export default Root;
