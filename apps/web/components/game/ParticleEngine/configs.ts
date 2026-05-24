// Particle configs per game phase. Typed as `object` to avoid a direct
// dependency on @tsparticles/engine (which is a peer dep only).
// The shape matches ISourceOptions from @tsparticles/engine v4.

export const particleConfigs: Record<string, object> = {
  lobby: {
    fpsLimit: 60,
    fullScreen: false,
    particles: {
      number: { value: 30 },
      color: { value: '#888782' },
      opacity: { value: { min: 0.05, max: 0.12 } },
      size: { value: { min: 0.5, max: 1.5 } },
      move: { enable: true, speed: 0.2, direction: 'none', random: true },
    },
  },

  scenario: {
    fpsLimit: 60,
    fullScreen: false,
    particles: {
      number: { value: 50 },
      color: { value: ['#888782', '#5A5A56'] },
      opacity: { value: { min: 0.08, max: 0.18 } },
      size: { value: { min: 0.8, max: 2 } },
      move: { enable: true, speed: 0.5, direction: 'top', random: true },
    },
  },

  statement: {
    fpsLimit: 60,
    fullScreen: false,
    particles: {
      number: { value: 80 },
      color: { value: '#888782' },
      opacity: { value: { min: 0.1, max: 0.2 } },
      size: { value: { min: 1, max: 2 } },
      move: { enable: true, speed: 0.8, direction: 'top', random: true },
    },
  },

  voting: {
    fpsLimit: 60,
    fullScreen: false,
    particles: {
      number: { value: 120 },
      color: { value: ['#888782', '#3A3A3A'] },
      opacity: { value: { min: 0.15, max: 0.25 } },
      size: { value: { min: 1, max: 2.5 } },
      move: { enable: true, speed: 1.5, direction: 'none', random: true },
    },
  },

  reveal: {
    fpsLimit: 60,
    fullScreen: false,
    particles: {
      number: { value: 0 },
      color: { value: ['#FF3B30', '#FF6B5C', '#2D7FF9', '#5B9EFF'] },
      opacity: { value: { min: 0.6, max: 0.9 } },
      size: { value: { min: 2, max: 5 } },
      move: { enable: true, speed: 6, direction: 'none', random: true, decay: 0.015 },
    },
    emitters: {
      position: { x: 50, y: 50 },
      rate: { quantity: 300, delay: 0 },
      life: { count: 1, duration: 0.1 },
    },
  },

  debate: {
    fpsLimit: 60,
    fullScreen: false,
    particles: {
      number: { value: 100 },
      color: { value: ['#FF3B30', '#2D7FF9'] },
      opacity: { value: { min: 0.12, max: 0.22 } },
      size: { value: { min: 1, max: 2 } },
      move: { enable: true, speed: 1.2, direction: 'none', random: true },
    },
  },

  conversion: {
    fpsLimit: 60,
    fullScreen: false,
    particles: {
      number: { value: 0 },
      color: { value: ['#FF3B30', '#FF6B5C', '#FFAA99'] },
      opacity: { value: { min: 0.7, max: 1.0 } },
      size: { value: { min: 2, max: 6 } },
      move: { enable: true, speed: 10, direction: 'none', random: true, decay: 0.02 },
    },
    emitters: {
      position: { x: 50, y: 50 },
      rate: { quantity: 400, delay: 0 },
      life: { count: 1, duration: 0.1 },
    },
  },

  win: {
    fpsLimit: 60,
    fullScreen: false,
    particles: {
      number: { value: 0 },
      color: { value: ['#FF3B30', '#D4A04C', '#F8F7F4'] },
      opacity: { value: { min: 0.6, max: 0.9 } },
      size: { value: { min: 3, max: 8 } },
      move: { enable: true, speed: 4, direction: 'top', random: true, decay: 0.008 },
    },
    emitters: [
      { position: { x: 10, y: 0 }, rate: { quantity: 75, delay: 0 }, life: { count: 1, duration: 0.1 } },
      { position: { x: 90, y: 0 }, rate: { quantity: 75, delay: 0 }, life: { count: 1, duration: 0.1 } },
    ],
  },

  loss: {
    fpsLimit: 60,
    fullScreen: false,
    particles: {
      number: { value: 20 },
      color: { value: '#3A3A3A' },
      opacity: { value: { min: 0.04, max: 0.08 } },
      size: { value: { min: 0.5, max: 1 } },
      move: { enable: true, speed: 0.1, direction: 'bottom', random: false },
    },
  },
};
