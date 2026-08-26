import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";

const BackgroundParticles: React.FC = () => {
  const init = useCallback(async (engine: Engine) => {
    // load the full tsparticles bundle (includes all shapes and presets)
    await loadFull(engine);
  }, []);

  const particlesOptions = {
    fullScreen: { enable: false },
    fpsLimit: 60,
    particles: {
      number: { value: 60, density: { enable: true, area: 800 } },
      color: { value: "#53d5d0" },
      shape: { type: "circle" },
      opacity: { value: 0.7 },
      size: { value: { min: 1, max: 4 } },
      links: { enable: true, distance: 140, color: "#53d5d0", opacity: 0.15, width: 1 },
      move: { enable: true, speed: 0.8, direction: "none", outModes: "out" },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
        resize: true,
      },
      modes: {
        grab: { distance: 400, links: { opacity: 0.6 } },
        repulse: { distance: 120 },
        push: { quantity: 4 },
      },
    },
    detectRetina: true,
  } as const;

  return (
    <div className="particles-canvas" aria-hidden>
      <Particles id="tsparticles" init={init} options={particlesOptions} />
    </div>
  );
};

export default BackgroundParticles;
