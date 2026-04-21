import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import slide1 from "@/assets/hero-slide-1.jpg";
import slide2 from "@/assets/hero-slide-2.jpg";
import slide3 from "@/assets/hero-slide-3.jpg";
import slide4 from "@/assets/hero-slide-4.jpg";

const SLIDES = [slide1, slide2, slide3, slide4];
const SLIDE_DURATION = 7000; // ms per slide

export function HeroCinematic() {
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Trigger entrance reveal on mount
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-background">
      {/* CAROUSEL — Ken Burns + crossfade */}
      <div className="absolute inset-0">
        {SLIDES.map((src, i) => {
          const isActive = i === active;
          return (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ opacity: isActive ? 1 : 0 }}
              aria-hidden={!isActive}
            >
              <img
                src={src}
                alt=""
                width={1920}
                height={1080}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  animation: isActive
                    ? `kenburns ${SLIDE_DURATION + 1500}ms ease-out forwards`
                    : "none",
                }}
              />
            </div>
          );
        })}
        {/* Light overlay for legibility (light theme) */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-[1600px] h-full px-6 lg:px-10 flex flex-col items-center justify-end pb-32 text-center">
        {/* Kicker — letter-spacing reveal */}
        <p
          className="text-[11px] uppercase text-muted-foreground mb-6 transition-all duration-[1400ms] ease-out"
          style={{
            opacity: revealed ? 1 : 0,
            letterSpacing: revealed ? "0.5em" : "0.2em",
            paddingLeft: revealed ? "0.5em" : "0.2em",
            transitionDelay: "200ms",
          }}
        >
          Sem custo · Sem compromisso
        </p>

        {/* Headline — mask reveal (curtain down) */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.95] text-foreground overflow-hidden">
          <span
            className="inline-block italic font-extralight transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: revealed ? "translateY(0)" : "translateY(110%)",
              transitionDelay: "500ms",
            }}
          >
            Delivery
          </span>
        </h1>

        {/* Animated divider line — draws from center */}
        <div
          className="mt-8 h-px bg-foreground/40 transition-all duration-[900ms] ease-out"
          style={{
            width: revealed ? "4rem" : "0rem",
            transitionDelay: "1100ms",
          }}
        />

        {/* Sub-text */}
        <p
          className="mt-8 max-w-xl text-base md:text-lg text-foreground/75 leading-relaxed transition-all duration-[900ms] ease-out"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "1400ms",
          }}
        >
          Gostou de um modelo? Nós levamos o carro até sua casa ou trabalho para um test-drive.
        </p>

        {/* CTAs */}
        <div
          className="mt-12 flex flex-wrap gap-4 justify-center transition-all duration-[900ms] ease-out"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "1700ms",
          }}
        >
          <Link
            to="/delivery"
            className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors"
          >
            Quero meu test-drive
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/estoque"
            className="inline-flex items-center gap-3 border border-foreground/30 text-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-foreground hover:text-background transition-colors"
          >
            Ver estoque
          </Link>
        </div>

        {/* Progress indicators — refined cinematic bars */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 transition-opacity duration-700"
          style={{ opacity: revealed ? 1 : 0, transitionDelay: "2000ms" }}
        >
          {SLIDES.map((_, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className="relative h-px w-10 bg-foreground/20 overflow-hidden cursor-pointer"
              >
                <span
                  className="absolute inset-y-0 left-0 bg-foreground"
                  style={{
                    width: isActive ? "100%" : "0%",
                    transition: isActive
                      ? `width ${SLIDE_DURATION}ms linear`
                      : "width 300ms ease-out",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Ken Burns keyframes */}
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -1%); }
        }
      `}</style>
    </section>
  );
}
