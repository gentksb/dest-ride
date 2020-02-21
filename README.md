# destride

はやめブラストギア完結につき、プロジェクト凍結

## Todo

- 状態管理にVuexストア利用
- フロントを作る
- PWAプラグイン追加

## Project setup

```bash
npm ci
cd ./functions/
npm ci
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
