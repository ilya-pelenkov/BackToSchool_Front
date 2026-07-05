# Back To School

Software for interactive information kiosks in schools.

## Project Setup

### Install

```bash
$ npm install
```

### Запуск в development режиме

```bash
$ npm run dev
```

### Запуск в development режиме с поддержкой hot-reload main процесса

При каждом изменении в main, приложение перезагружается

```bash
$ npm run dev:w
```

### Сборка приложения

```bash
# For windows x64
$ npm run build:win64

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

После сборки готовое для установки приложение можно найти в директории /dist проекта

### Логирование

Логи сохраняются в локальный файл, директория зависит от ОС

на Linux: ~/.config/{app name}/logs/main.log

на macOS: ~/Library/Logs/{app name}/main.log

на Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\main.log
