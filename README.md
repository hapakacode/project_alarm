# Ringing Alarm
순수 JS 를 사용하여 만든 웹사이트 기반의 알람 시스템. 

## 브라우저 허용 범위
IE 10 이상, 그외의 모든 브라우저 지원

## 실행 방법 

1. 소스 다운로드 후 해당 위치에서 다음 스크립트 실행 -> package.json에 설정해 놓은 모듈 설치 

   `npm install`
 
2. webpack.config.js 실행하여 dist 폴더 생성 후 번들된 파일 추가 (스킵 가능)

   `npm run build `

3. webpack-dev-server 사용하여 브라우저 열기 (스킵 가능) -> port 설정은 webpack.config.js 내 devServer에서 수정

   `npm run server`

4. build 와 server 합친 스크립트로, npm install 후 바로 실행 가능

    `npm start` 


## 화면 설명 

![screen functions](./img/functions.png)


## 구조 설명

![structure](./img/structure.png)
