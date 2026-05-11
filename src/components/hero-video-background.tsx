"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroVideoBackgroundProps {
  /** Caminho do vídeo em public/ (ex: "/videos/hero-background.mp4") */
  videoSrc?: string;
  /** URL de imagem de fallback/poster para exibir enquanto carrega */
  posterSrc?: string;
  /** Conteúdo personalizado (opcional - substitui o conteúdo padrão) */
  children?: React.ReactNode;
  /** Classes CSS adicionais para o container */
  className?: string;
}

/**
 * Componente de Hero com vídeo de fundo otimizado.
 * 
 * Implementa as seguintes otimizações:
 * - `playsinline`: Evita fullscreen automático em iOS
 * - `muted`: Necessário para autoplay funcionar em todos os navegadores
 * - `loop`: Reprodução contínua sem interrupção
 * - `preload="metadata"`: Carrega apenas metadados inicialmente
 * - Lazy loading via IntersectionObserver: Só carrega quando visível
 * - Poster image: Exibe imagem estática enquanto o vídeo carrega
 * - object-fit: cover: Mantém proporção e cobre toda a área
 * - Fallback graceful: Se vídeo falhar, exibe poster ou overlay
 */
export function HeroVideoBackground({
  videoSrc = "/videos/hero-background.mp4",
  posterSrc,
  children,
  className = "",
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // IntersectionObserver para lazy loading do vídeo
    // Só inicia o carregamento quando o elemento está próximo da viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Inicia carregamento do vídeo
            video.load();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Começa a carregar 50px antes de entrar na viewport
        threshold: 0,
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      // Tenta reproduzir o vídeo
      video.play().catch((err) => {
        // Autoplay pode falhar em alguns navegadores sem interação
        console.warn("[HeroVideo] Autoplay bloqueado:", err.message);
      });
    };

    const handleError = () => {
      setHasError(true);
      console.warn("[HeroVideo] Erro ao carregar vídeo");
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative h-[100svh] min-h-[560px] md:min-h-[700px] w-full overflow-hidden bg-background ${className}`}
    >
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            isVideoLoaded && !hasError ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          // Atributos de acessibilidade
          aria-hidden="true"
          // Desabilita controles e menus de contexto
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
        >
          {/* MP4 é o formato mais compatível */}
          <source src={videoSrc} type="video/mp4" />
          {/* 
            WebM pode ser adicionado como alternativa mais leve:
            <source src="/videos/hero-background.webm" type="video/webm" />
          */}
        </video>

        {/* Poster/Fallback - exibido enquanto vídeo carrega ou se houver erro */}
        {posterSrc && (!isVideoLoaded || hasError) && (
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Overlays para garantir legibilidade do texto */}
        {/* Gradiente base - mais escuro na parte inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-background/30 md:from-background/90 md:via-background/50 md:to-background/20" />
        
        {/* Gradiente radial focado na área de texto (inferior central) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 78%, color-mix(in oklab, var(--background) 70%, transparent) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 mx-auto max-w-[1600px] h-full px-6 lg:px-10 flex flex-col items-center justify-end pb-24 md:pb-32 text-center">
        {children || <DefaultHeroContent />}
      </div>
    </section>
  );
}

/**
 * Conteúdo padrão do Hero - pode ser substituído via prop `children`
 */
function DefaultHeroContent() {
  return (
    <>
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

      {/* Indicador de scroll */}
      <div className="animate-hero-indicators absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-foreground/50">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="h-8 w-px bg-foreground/30 animate-pulse" />
        </div>
      </div>

      {/* Estilos de animação */}
      <style>{`
        @keyframes heroRise {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-hero-actions {
          animation: heroRise 420ms ease-out 300ms both;
        }

        .animate-hero-indicators {
          animation: heroRise 360ms ease-out 450ms both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-hero-actions,
          .animate-hero-indicators {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </>
  );
}
