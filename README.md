# destride

## Project setup

```bash
npm install
cd ./functions/
npm install
```

### Compiles and hot-reloads for development

```bash
npm run serve
```

### Compiles and minifies for production

```bash
npm run build
```

### Lints and fixes files

```bash
npm run lint
```

### local test

```bash
cd ./functions/
firebase functions:config:get > .runtimeconfig.json
cd ../
firebase serve
```

### deploy

```bash
firebase deploy
```
