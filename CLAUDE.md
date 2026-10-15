# conventions

프로젝트 공통 코드 관례를 **ESLint 규칙으로 강제**하는 플러그인 (`@sororiri/conventions`).
규칙 목록·규칙마다의 이유·프로젝트에 붙이는 법·예외 정책은 specmu 의 `conventions` 프로젝트 —
https://specmu.memomu.uk/conventions (AI 는 `specmu tree conventions`).

## 자리

| 경로 | 무엇 |
|---|---|
| `rules/<규칙>.js` | 규칙 하나 = 파일 하나. 빌드 없는 ESM — GitHub 에서 바로 설치해 쓴다 |
| `index.js` | 플러그인과 추천 설정(`configs.recommended`) |
| `test/rules.test.js` | 규칙마다 지킨 예·어긴 예 (ESLint RuleTester). `test/fixtures/` 는 폴더를 보는 규칙의 시험 폴더 |

## 돌리기

```bash
npm install && npm test
```

## 규칙을 더하거나 바꿀 때

- 규칙 파일·테스트(지킨 예와 어긴 예 둘 다)·`index.js` 등록·specmu 의 규칙 페이지를 함께 고친다.
- 오류 메시지는 무엇을 어떻게 고치면 되는지까지 쓴다.
- 쓰는 프로젝트는 태그(`#vX.Y.Z`)로 고정한다 — 규칙을 바꾸면 버전을 올리고 태그를 단다.
- 폴더·다른 파일을 보는 규칙은 ESLint 캐시(`--cache`)와 맞지 않는다 — 쓰는 쪽 lint 는 캐시 없이 돌린다.
