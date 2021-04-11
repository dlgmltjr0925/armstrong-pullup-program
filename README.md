# Armstrong pull up program

유튜브 [턱걸이 개수를 늘리기 위한 세계적으로 유명한 풀업 루틴](https://youtu.be/QmXmM2Yf8sk)을 보고 제작한 웹 서비스입니다.

## 실행 방법

### node.js

```bash
git clone https://github.com/dlgmltjr0925/armstrong-pullup-program.git
cd armstrong-pullup-program
yarn && yarn build
yarn start
```

### docker

#### build

- amd64

```bash
yarn docker-build
```

- arm64v8

```bash
yarn docker-build:arm64v8
```

#### run

- arm64v8

```bash
docker run -d --name armstrong \
  -p 3000:3000 \
  -v ${some-dir}/data:/armstrong/data \
  dlgmltjr0925/armstrong-pullup-program:arm64v8-latest
```
