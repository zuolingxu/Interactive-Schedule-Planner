<template>
  <vue-particles id="tsparticles" :options="particlesOptions" />
</template>

<script>
export default {
  name: 'ParticleBackground',
  data() {
    return {
      particlesOptions: {
        fullScreen: { enable: false },
        background: {
          color: '#000000'
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab'
            },
            onClick: {
              enable: true,
              mode: 'push'
            }
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4
            },
            push: {
              quantity: 4
            }
          }
        },
        particles: {
          color: { value: '#ffffff' },
          links: {
            color: '#ffffff',
            distance: 150,
            enable: true,
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 1,
            // random: true,
            // outModes: 'bounce'
            direction: 'none',
            random: false,
            straight: false,
            outModes: { default: 'out' }
          },
          number: {
            value: 100, // 粒子数量
            density: {
              enable: true,
              area: 800
            }
          },
          opacity: {
            value: 0.5,
            random: false
          },
          shape: {
            type: 'circle' // 粒子形状为圆形
          },
          size: {
            value: { min: 1, max: 3 }, // 粒子大小范围
            random: true
          }
        },
        detectRetina: true
      }
    }
  }
}
</script>

<style scoped>
#tsparticles {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
}
</style>