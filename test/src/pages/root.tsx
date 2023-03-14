import { createState, createEffect } from 'lampjs';

const Root = () => {
  const text = createState('');

  const handleUpdate = (e: any) => {
    text(e.target.value);
  };

  createEffect(() => {
    console.log('new thing');
  }, [text]);

  return (
    <div>
      <input
        onChange={handleUpdate}
        value={text}
      />
      {text().el}
    </div>
  );
};

export default Root;
