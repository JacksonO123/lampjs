import { Link } from '@jacksonotto/lampjs-ssr';
import Counter from '../components/Counter';
import '../layouts/Layout.css';

const App = () => {
  return (
    <div class="root">
      <img
        src="/lamp.svg"
        alt="LampJs Icon"
        width="40"
        height="40"
      />
      <h1>LampJs SSR 2</h1>
      <span>A powerful, lightweight JS framework</span>
      <Counter />
      <Link href="/about">about</Link>
    </div>
  );
};

export default App;
