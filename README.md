# Interactive-Schedule-Planner
A highly interactive schedule planning software, the final project of the HCI course at Tongji University

## set-up
在项目目录下执行以下指令，下载可能需要一些时间，请耐心等待
```bash
npm install 
```

假如网络错误，请配置registry为国内镜像源：
```bash
npm config set registry https://registry.npmmirror.com/
npm config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/
```
或直接在用户目录下的.npmrc文件中配置镜像源

## run-electron
使用以下指令运行electron应用：
```bash
npm run start
```

[electron+vue应用配置](https://blog.csdn.net/weixin_44582045/article/details/133927098)(目前到第二步)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```


## 注：简洁启动-by wx
```bash
npm install
npm install vue-router@4
npm run build
npm run dev
```