import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Expertise from './components/Expertise';
import Contact from './components/Contact';
import ErrorBoundary from './components/ErrorBoundary';

function SectionFallback() {
  return (
    <div className="min-h-[30vh] flex items-center justify-center">
      <p className="text-text-muted text-sm font-mono">Section failed to load</p>
    </div>
  );
}

export default function App() {
  return (
    <main className="relative">
      {/* Ambient grid overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="relative z-10">
        <ErrorBoundary fallbackComponent={<SectionFallback />}>
          <Navbar />
        </ErrorBoundary>
        <ErrorBoundary fallbackComponent={<SectionFallback />}>
          <Hero />
        </ErrorBoundary>
        <ErrorBoundary fallbackComponent={<SectionFallback />}>
          <About />
        </ErrorBoundary>
        <ErrorBoundary fallbackComponent={<SectionFallback />}>
          <Projects />
        </ErrorBoundary>
        <ErrorBoundary fallbackComponent={<SectionFallback />}>
          <Expertise />
        </ErrorBoundary>
        <ErrorBoundary fallbackComponent={<SectionFallback />}>
          <Contact />
        </ErrorBoundary>
      </div>
    </main>
  );
}
