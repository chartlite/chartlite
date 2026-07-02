import Hero from '@/components/site/Hero';
import Gallery from '@/components/site/Gallery';
import Frameworks from '@/components/site/Frameworks';
import Theming from '@/components/site/Theming';
import Agents from '@/components/site/Agents';
import Install from '@/components/site/Install';

export default function Home() {
  return (
    <>
      <Hero />
      <Gallery />
      <Frameworks />
      <Theming />
      <Agents />
      <Install />
    </>
  );
}
