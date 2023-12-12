import { Link } from '@jacksonotto/lampjs-ssr';
import '../layouts/Layout.css';

const About = () => {
  return (
    <div class="root">
      <h1>about</h1>
      <Link href="/">home</Link>
    </div>
  );
};

export default About;
