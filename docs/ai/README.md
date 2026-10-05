# 설계 및 작업 문서 안내

이 폴더는 작업별 계획, 설계 시안, 판단 근거와 검증 결과를 관리한다. 저장소 공통 규칙은 [AGENTS.md](../../AGENTS.md), 실행 방법은 [README.md](../../README.md), API 계약은 [api.md](../../api.md)를 따른다.

## UI/UX 1차 작업

목표는 ‘홈 → 프로젝트 탐색 → 상세 열람’을 데스크톱과 모바일에서 일관되게 사용하는 것이다. 공통 스타일·헤더와 마이페이지 모바일 틀을 포함하며, 상세 범위와 완료 기준은 [GitHub 이슈 #18](https://github.com/Tim3208/CampusPolio_FE/issues/18)에 기록되어 있다.

### 디자인 기준 선택 상태

**확정 — 2026-10-04 사용자 결정.** 최종 HTML 디자인을 색·타이포그래피·간격·상태·반응형 배치의 우선 기준으로 채택했다. 스케치의 주석은 화면 흐름과 동작을 보완한다. 홈·탐색·상세·공통 헤더·마이페이지 틀에 적용하며, 기존 API·인증·프로필·편집기·포트폴리오 계약을 보존한다. 구현 및 개발 검증 기록은 2026-10-05 KST이며 개발 제출 시점의 독립 QA는 아직 실행 전이다.

| 자료 | 역할 | 현재 상태 |
|---|---|---|
| [uiux-phase1-sketch.html](uiux-phase1-sketch.html) | 화면 흐름·정보 순서·상태별 배치를 보여주는 스케치 | 확정된 흐름·동작 보조 기준 |
| [uiux-phase1-design.html](uiux-phase1-design.html) | 색상·글꼴·컴포넌트·화면 상태를 구체화한 시안 | 확정된 시각 우선 기준 |
| [uiux-phase1-design-spec.md](uiux-phase1-design-spec.md) | 시안의 토큰·컴포넌트·반응형·판단 근거 | 확정 설계와 현재 구현·제약 기록 |
| [Campus Polio Figma](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=0-1) | 기존 화면 디자인과 일부 플로우 | HTML 시안과 대조할 기존 자료 |
| [이슈 #18의 작업 계획](https://github.com/Tim3208/CampusPolio_FE/issues/18) | 1차 범위·작업 순서·완료 기준 | 범위 참조; 시각 우선순위는 최종 HTML |

기준안 선택과 별개로, 공통 토큰·라이브러리·코드 배치는 2026-10-04에 사용자가 결정했다. 승인 당시 원문은 [디자인 명세 8절](uiux-phase1-design-spec.md#8-공통-구현-사항-결정)에 기록되어 있다. 8절의 미적용·미구현·남은 일은 당시 상태이고, 현재 적용·구현·개발 확인은 [디자인 명세 12절](uiux-phase1-design-spec.md#12-구현-변경-이력)과 [구현 기록](uiux-phase1-implementation.md)의 2026-10-05 이력에서 확인한다. `--ring`, 승인된 새 Button 크기, Sheet/Dropdown/Skeleton, Markdown SSR 및 대상 화면에 반영했다. 전역 primary·기존 Button 크기·dark 값·기존 프로필 controls/색은 보존했다. 홈 하단 picsum studio-desk 예시 사진은 사용자가 임시 사용을 선택했다. DEV-04는 사용자 결정에 따라 shared MarkdownImage의 초기·이후 실패 처리를 수리하고 상세에서 shared MarkdownViewer를 SSR 소비하도록 복원했다. 위젯의 중복 본문 렌더러·이미지 조각은 제거하고 대표 이미지 처리는 보존했다. 7절 승인 배치 표와 8절 사용자 결정 기록은 원본 텍스트와 2026-10-04 승인일을 복원·보존하며 2026-10-05 변경 이력은 별도로 기록한다. 이전 DEV-03 관찰·FAIL·errata는 역사 근거다.

기존 Figma의 주요 대조 노드:

- [홈 75:349](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=75-349)
- [프로젝트 탐색 75:976](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=75-976)
- [프로젝트 상세 75:802](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=75-802)
- [마이페이지 75:1219](https://www.figma.com/design/hWgpBU1pri3aJg9JkVoE6L/Campus-Polio?node-id=75-1219)

[구현·개발 검증 기록](uiux-phase1-implementation.md)에 파일 대응, 실제 검증 결과, 의도적인 차이와 미해결 항목을 기록했다. 독립 QA와 실제 backend/OAuth 검증은 완료로 표시하지 않는다. 작성·수정·포트폴리오 제작 화면의 시각 재설계와 지원 본문 제작은 이번 범위에 포함하지 않는다.

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
