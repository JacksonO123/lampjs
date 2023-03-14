import { createState, createEffect } from 'lampjs';

const Root = () => {
  const text = createState('');

  const handleUpdate = (e: any) => {
    text(e.target.value);
  };

  createEffect(() => {
    console.log('update');
  }, [text]);

  return (
    <div>
      <input
        onChange={handleUpdate}
        value={text().value}
      />
      {text().el}
    </div>
  );
};

export default Root;
