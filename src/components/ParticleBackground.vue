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
      
      instance.particles.onCountChange = (count) => {
        if (count > this.currentMaxParticles) {
          this.currentMaxParticles = count;
        }
      };
    },
    startParticleAnimation() {
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
      }
      
      let currentParticles = this.currentMaxParticles;
      const decreaseInterval = 1000; // 每次减少的间隔时间(毫秒)
      let isDecreasing = true;
      
      this.animationInterval = setInterval(() => {
        if (isDecreasing) {
          // 每次只减少1个粒子
          if (currentParticles > this.minParticles) {
            currentParticles--;
          } else {
            // 达到最小值后开始增加
            isDecreasing = false;
          }
        } else {
          // 增加到最大值
          if (currentParticles < this.currentMaxParticles) {
            currentParticles++;
          } else {
            // 达到最大值后开始减少
            isDecreasing = true;
            
            // 如果当前最大值比基础值大，则缓慢恢复到基础值
            if (this.currentMaxParticles > this.baseMaxParticles) {
              this.currentMaxParticles = Math.max(
                this.baseMaxParticles,
                this.currentMaxParticles - 1
              );
            }
          }
        }
        
        // 更新粒子数量
        if (this.particlesInstance) {
          this.particlesInstance.options.particles.number.value = currentParticles;
        }
      }, decreaseInterval);
    }
  },
  beforeDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.particlesInstance) {
      this.particlesInstance.destroy();
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