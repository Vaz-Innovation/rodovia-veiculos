"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import slide1 from "@/assets/hero-slide-1.jpg";
import slide2 from "@/assets/hero-slide-2.jpg";
import slide3 from "@/assets/hero-slide-3.jpg";
import slide4 from "@/assets/hero-slide-4.jpg";

const SLIDES = [slide1, slide2, slide3, slide4];
const SLIDE_DURATION = 4500; // ms per slide

export function HeroCinematic() {
  const [active, setActive] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[100svh] min-h-[560px] md:min-h-[700px] w-full overflow-hidden bg-background">
      {/* CAROUSEL — Ken Burns + crossfade */}
      <div className="absolute inset-0">
        {SLIDES.map((src, i) => {
          const isActive = i === active;
          return (
            <div
              key={src.src}
              className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ opacity: isActive ? 1 : 0 }}
              aria-hidden={!isActive}
            >
              <img
                src={src.src}
                alt=""
                width={1920}
                height={1080}
                className="absolute inset-0 h-full w-full object-cover object-[center_70%] md:object-center"
                style={{
                  animation: isActive
                    ? `kenburns ${SLIDE_DURATION + 900}ms ease-out forwards`
                    : "none",
                }}
              />
            </div>
          );
        })}
        {/* Overlays for legibility */}
        {/* Base gradient — bottom heavy */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-background/30 md:from-background/90 md:via-background/55 md:to-background/20" />
        {/* Radial scrim focused on the text area (lower-center) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 78%, color-mix(in oklab, var(--background) 75%, transparent) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-[1600px] h-full px-6 lg:px-10 flex flex-col items-center justify-end pb-24 md:pb-32 text-center">
        {/* Kicker — letter-spacing reveal */}
        <p className="animate-hero-kicker text-[10px] md:text-[11px] uppercase text-muted-foreground mb-4 md:mb-6">
          Sem custo · Sem compromisso
        </p>

        {/* Headline — mask reveal (curtain down) */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[1.15] text-foreground pb-4">
          <span className="animate-hero-title inline-block italic font-extralight pb-2">
            Delivery
          </span>
        </h1>

        {/* Animated divider line — draws from center */}
        <div className="animate-hero-divider mt-8 h-px w-16 bg-foreground/40" />

        {/* Sub-text */}
        <p className="animate-hero-copy mt-6 md:mt-8 max-w-xl text-sm md:text-lg text-foreground/75 leading-relaxed">
          Gostou de um modelo? Nós levamos o carro até sua casa ou trabalho para um test-drive.
        </p>

        {/* CTAs */}
        <div className="animate-hero-actions mt-8 md:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto">
          <Link
            href="/delivery"
            className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 sm:px-8 py-4 text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:bg-primary/90 transition-colors"
          >
            Quero meu test-drive
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/estoque"
            className="inline-flex items-center justify-center gap-3 border border-foreground/30 text-foreground px-6 sm:px-8 py-4 text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:bg-foreground hover:text-background transition-colors"
          >
            Ver estoque
          </Link>
        </div>

        {/* Progress indicators — refined cinematic bars */}
        <div className="animate-hero-indicators absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3">
          {SLIDES.map((_, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className="relative h-px w-8 md:w-10 bg-foreground/20 overflow-hidden cursor-pointer"
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

        @keyframes heroKicker {
          0% { opacity: 0; letter-spacing: 0.2em; padding-left: 0.2em; transform: translateY(10px); }
          100% { opacity: 1; letter-spacing: 0.4em; padding-left: 0.4em; transform: translateY(0); }
        }

        @keyframes heroTitle {
          0% { opacity: 0; transform: translateY(110%); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroDivider {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        @keyframes heroRise {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-hero-kicker {
          animation: heroKicker 420ms ease-out 60ms both;
        }

        .animate-hero-title {
          animation: heroTitle 520ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both;
        }

        .animate-hero-divider {
          transform-origin: center;
          animation: heroDivider 360ms ease-out 300ms both;
        }

        .animate-hero-copy {
          animation: heroRise 420ms ease-out 380ms both;
        }

        .animate-hero-actions {
          animation: heroRise 420ms ease-out 460ms both;
        }

        .animate-hero-indicators {
          animation: heroRise 360ms ease-out 520ms both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-hero-kicker,
          .animate-hero-title,
          .animate-hero-divider,
          .animate-hero-copy,
          .animate-hero-actions,
          .animate-hero-indicators {
            animation: none;
            opacity: 1;
            transform: none;
            letter-spacing: 0.4em;
            padding-left: 0.4em;
          }
        }
      `}</style>
    </section>
  );
}
