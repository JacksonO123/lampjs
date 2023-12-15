import Layout from '../layouts/Layout';
import './App.css';

const App = () => {
  return (
    <Layout>
      <div class="root">
        <img
          src="/lamp.svg"
          alt="LampJs Icon"
        />
        <h1>LampJs</h1>
        <span>A powerful, lightweight JS framework</span>
        <a
          href="https://npmjs.com/@jacksonotto/lampjs"
          target="_blank"
        >
          LampJs on npm
        </a>
        <a
          href="https://github.com/JacksonO123/lampjs"
          target="_blank"
        >
          LampJs on Github
        </a>
      </div>
    </Layout>
  );
};

export default App;
