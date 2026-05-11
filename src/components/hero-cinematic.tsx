"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroCinematic() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const hasTriedPlay = useRef(false);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || hasTriedPlay.current) return;
    
    hasTriedPlay.current = true;
    
    try {
      video.muted = true;
      await video.play();
      setIsVideoLoaded(true);
    } catch {
      // Em caso de falha, tenta novamente após interação do usuário
      hasTriedPlay.current = false;
      const playOnInteraction = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = true;
        v.play().then(() => {
          setIsVideoLoaded(true);
        }).catch(() => {});
      };
      
      document.addEventListener("touchstart", playOnInteraction, { once: true });
      document.addEventListener("click", playOnInteraction, { once: true });
    }
  }, []);

  // Callback ref para lidar com o vídeo assim que o elemento for montado
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      videoRef.current = node;
      
      // Força os atributos necessários para autoplay em mobile
      node.muted = true;
      node.playsInline = true;
      node.setAttribute("playsinline", "");
      node.setAttribute("webkit-playsinline", "");
      node.setAttribute("x5-playsinline", "");
      
      // Se o vídeo já está pronto (cache do navegador), reproduz imediatamente
      if (node.readyState >= 3) {
        playVideo();
      }
    }
  }, [playVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlayThrough = () => {
      playVideo();
    };

    const handleLoadedData = () => {
      playVideo();
    };

    // Eventos para quando o vídeo está pronto
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("loadeddata", handleLoadedData);

    // Tenta reproduzir imediatamente se já está pronto
    if (video.readyState >= 3) {
      playVideo();
    }

    return () => {
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [playVideo]);

  return (
    <section className="relative h-[100svh] min-h-[560px] md:min-h-[700px] w-full overflow-hidden bg-background">
      {/* VIDEO BACKGROUND */}
      <div className="absolute inset-0 bg-neutral-900">
        {/* 
          Atributos críticos para autoplay em mobile:
          - muted: Obrigatório para autoplay em todos os navegadores
          - playsInline + webkit-playsinline: Evita fullscreen forçado no iOS
          - autoPlay: Tenta iniciar automaticamente
          - poster: Imagem de fallback enquanto carrega
        */}
        <video
          ref={setVideoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          src="/videos/hero-background.mp4"
          muted
          autoPlay
          loop
          playsInline
          webkit-playsinline=""
          x5-playsinline=""
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
        />

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
        {/* CTAs */}
        <div className="animate-hero-actions flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto">
          <Link
            href="/estoque"
            className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 sm:px-8 py-4 text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:bg-primary/90 transition-colors"
          >
            Ver estoque
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/delivery"
            className="inline-flex items-center justify-center gap-3 border border-foreground/30 text-foreground px-6 sm:px-8 py-4 text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:bg-foreground hover:text-background transition-colors"
          >
            Test-drive sem sair de casa
          </Link>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes heroRise {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-hero-actions {
          animation: heroRise 420ms ease-out 460ms both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-hero-actions {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
