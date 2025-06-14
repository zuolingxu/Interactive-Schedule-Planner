<template>
  <vue-particles id="tsparticles" :options="particlesOptions" @particlesLoaded="onParticlesLoaded" />
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
              quantity: 4 // 每次点击增加的粒子数
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
            direction: 'none',
            random: false,
            straight: false,
            outModes: { default: 'out' }
          },
          number: {
            value: 100,
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
            type: 'circle'
          },
          size: {
            value: { min: 1, max: 3 },
            random: true
          }
        },
        detectRetina: true
      },
      particlesInstance: null,
      animationInterval: null,
      baseMaxParticles: 100, // 基础最大粒子数
      currentMaxParticles: 100, // 当前最大粒子数(会随点击增加)
      minParticles: 30 // 最小粒子数
    }
  },
  methods: {
    onParticlesLoaded(instance) {
      this.particlesInstance = instance;
      this.startParticleAnimation();
      
      // 监听粒子数量变化(用于检测点击增加)
      instance.particles.onCountChange((count) => {
        if (count > this.currentMaxParticles) {
          this.currentMaxParticles = count;
        }
      });
    },
    startParticleAnimation() {
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
      }
      
      let direction = -1;
      let currentParticles = this.currentMaxParticles;
      
      this.animationInterval = setInterval(() => {
        // 更新粒子数量
        currentParticles += direction * 2;
        
        // 确保不低于最小值，不高于当前最大值
        if (currentParticles <= this.minParticles) {
          currentParticles = this.minParticles;
          direction = 1;
        } else if (currentParticles >= this.currentMaxParticles) {
          currentParticles = this.currentMaxParticles;
          direction = -1;
          
          // 如果当前最大值比基础值大，则缓慢恢复到基础值
          if (this.currentMaxParticles > this.baseMaxParticles) {
            this.currentMaxParticles = Math.max(
              this.baseMaxParticles,
              this.currentMaxParticles - 1
            );
          }
        }
        
        if (this.particlesInstance) {
          this.particlesInstance.particles.setQuantity(currentParticles);
        }
      }, 100);
    }
  },
  beforeDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
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