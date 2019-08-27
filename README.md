# destride

## Todo

- 状態管理にVuexストア利用
- フロントを作る
- PWAプラグイン追加

## Project setup

```powershell
npm ci
cd ./functions/
npm ci
```

### Compiles and hot-reloads for development

```powershell
npm run serve
```

### Compiles and minifies for production

```powershell
npm run build
```

### Lints and fixes files

```powershell
npm run lint
```

### local test

```powershell
cd ./functions/
firebase functions:config:get | ac .runtimeconfig.json
cd ../
firebase serve
```

### deploy

```powershell
firebase deploy
```
