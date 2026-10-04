# 설계 및 작업 문서 안내

이 폴더는 작업별 계획, 설계 시안, 판단 근거와 검증 결과를 관리한다. 저장소 공통 규칙은 [AGENTS.md](../../AGENTS.md), 실행 방법은 [README.md](../../README.md), API 계약은 [api.md](../../api.md)를 따른다.

## UI/UX 1차 작업

목표는 ‘홈 → 프로젝트 탐색 → 상세 열람’을 데스크톱과 모바일에서 일관되게 사용하는 것이다. 공통 스타일·헤더와 마이페이지 모바일 틀을 포함하며, 상세 범위와 완료 기준은 [GitHub 이슈 #18](https://github.com/Tim3208/CampusPolio_FE/issues/18)에 기록되어 있다.

### 디자인 기준 선택 상태

**미정 — 2026-10-04 사용자 확인.** 아래 두 HTML 문서를 기존 Figma보다 우선할지 아직 선택하지 않았다. UI 구현에 들어가기 전에 사용자에게 기준안을 확인한다. 파일 이름, 본문의 ‘확정’·‘마감’ 표현, 파일 생성 순서만으로 우선순위를 결정하지 않는다.

| 자료 | 역할 | 현재 상태 |
|---|---|---|
| [uiux-phase1-sketch.html](uiux-phase1-sketch.html) | 화면 흐름·정보 순서·상태별 배치를 보여주는 스케치 | 기준안 선택 전 참고 자료 |
| [uiux-phase1-design.html](uiux-phase1-design.html) | 색상·글꼴·컴포넌트·화면 상태를 구체화한 시안 | 기준안 선택 전 참고 자료 |
| [uiux-phase1-design-spec.md](uiux-phase1-design-spec.md) | 시안의 토큰·컴포넌트·반응형·판단 근거 | 설계값 보존; 구현 적용은 기준안 선택 후 |
| [Campus Polio Figma](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=0-1) | 기존 화면 디자인과 일부 플로우 | HTML 시안과 대조할 기존 자료 |
| [이슈 #18의 작업 계획](https://github.com/Tim3208/CampusPolio_FE/issues/18) | 1차 범위·작업 순서·완료 기준 | 범위 참조; 디자인 우선순위는 본 문서의 미정 상태를 함께 확인 |

기준안 선택과 별개로, 공통 토큰·라이브러리·코드 배치는 2026-10-04에 사용자가 결정했다. 내용은 [디자인 명세 8절](uiux-phase1-design-spec.md#8-공통-구현-사항-결정)에 기록되어 있다. 이 중 `--ring` 토큰 변경과 `react-markdown`·`remark-gfm` 설치는 코드에 반영했고, 화면 구현은 기준안 선택 후 진행한다.

기존 Figma의 주요 대조 노드:

- [홈 75:349](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=75-349)
- [프로젝트 탐색 75:976](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=75-976)
- [프로젝트 상세 75:802](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=75-802)
- [마이페이지 75:1219](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=75-1219)

기준을 선택할 때는 채택한 자료·대상 화면·의도적인 차이·모바일 해석·확인 날짜를 이 문서 또는 연결된 작업 문서에 기록한다. 다른 화면은 미정으로 남아 있다면 그 범위도 명시한다.

### 자료 해석

- HTML 시안은 제품 코드와 별도의 설계 자료다. 예시 프로젝트·인명·이미지·수치·링크를 실제 데이터나 구현 완료의 근거로 사용하지 않는다.
- 시안의 상태 표현과 동작은 실제 화면에서 구현하고 검증해야 한다. 저장·공개·권한 등 API 계약은 시안만으로 결정하지 않는다.
- 기존 FSD 안에서 화면을 구현하고, 자료의 차이를 발견하면 선택한 기준과 이유를 남긴다.

## 보조 디자인 스킬

[design-taste-frontend](../../.claude/skills/design-taste-frontend/SKILL.md)는 로컬에 추가된 보조 스킬이다. 관련 작업에 한해 적용 범위를 읽고 사용한다. 스킬은 사용자에게 확인할 디자인 기준안을 선택하는 근거를 대신하지 않는다. 원문과 [라이선스](../../.claude/skills/design-taste-frontend/LICENSE)를 함께 유지한다.

## 문서 추가 및 갱신

- 새 작업 문서에는 목적, 대상 화면/파일, 선택한 기준, 완료 조건, 검증 결과 또는 미검증 항목을 적는다.
- 새 자료를 추가하면 이 목차에 링크와 상태를 기록한다.
- 계획·시안·구현 결과를 구분하고, 실제 완료 여부는 코드와 검증 결과로 확인한다.
- 공통 작업 규칙은 이 폴더에 복제하지 않고 [AGENTS.md](../../AGENTS.md)로 연결한다.
