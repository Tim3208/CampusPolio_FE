# FE 역제안 API 계약안

작성 2026-11-22 · 상태 **제안(미확정)** · 대상 독자: 백엔드 담당자

백엔드와 아직 정하지 못한 계약을 프론트엔드가 먼저 정해 제안하는 문서다. 프론트엔드는 이 안을 기준으로 화면과 Mock을 구현하고, 백엔드는 항목별로 **수락 / 수정 / 거절**만 회신하면 된다. 회신 양식은 [8절](#8-회신-양식)에 있다.

- 확정 전까지 저장소의 [api.md](../../api.md)는 서버가 제공한 명세 그대로 둔다. 이 문서의 내용은 회신을 받은 항목부터 `api.md`와 코드에 반영한다.
- 팀 정책은 [BE 전달 요구사항](backend-requirements.md), FE 작업 순서는 [API 교체 TODO](backend-rework-todo.md)를 따른다. 항목 ID(`AUTH-01` 등)는 TODO와 같다.

## 근거로 삼은 자료

| 표시 | 뜻 | 기준 |
|---|---|---|
| **실측** | 운영 서버에 로그인 없이 조회 요청만 보내 확인한 결과 | `https://api.campuspolio.cloud`, 2026-11-22 |
| **소스** | 백엔드 공개 저장소의 코드를 읽은 결과 | `pokowoo/CampusPolio`의 `feature/eks-cicd`, 커밋 `c119f98` (2026-11-09) |
| **명세** | Swagger 문서 | `/v3/api-docs`, 2026-11-22 수신본. 저장소 `api.md`와 23개 경로·30개 operation·72개 schema가 모두 같다 |

운영 서버가 위 커밋과 같은 버전인지는 확인하지 못했다. 로그인이 필요한 동작은 실측하지 못했으므로 **소스** 항목은 백엔드가 맞는지 확인해 주어야 한다. 다른 사용자의 데이터에 닿을 수 있는 요청은 보내지 않았다.

## 1. 요약

작업량은 S(설정·몇 줄), M(기존 API 수정), L(신규 기능)이다.

| 우선 | ID | 제안 한 줄 | 작업량 |
|---|---|---|---|
| P0 | [S-01~03](#2-현재-서버에서-먼저-확인할-동작) | 공개 API의 비로그인 `403`, 빈 본문 `403`, 세션 기반 컨트롤러를 먼저 고친다 | S~M |
| P0 | [COMMON-01](#common-01--오류-응답) | 오류 본문에 `code`를 추가한다 | S |
| P0 | [AUTH-01](#auth-01--로그인-유지와-본인-식별) | 본인 식별은 쿠키만 사용하고 인증 실패는 `401` JSON으로 통일한다 | S |
| P0 | [ACCESS-01](#access-01--공개비공개-조회-권한) | 비공개·DRAFT는 OWNER/MEMBER만, 그 외는 `404` | M |
| P1 | [PROJ-01](#proj-01--임시저장과-발행) | 저장은 전체 저장, 발행 시 서버가 제목·썸네일·본문 길이를 검증한다 | M |
| P1 | [PROJ-02](#proj-02--태그) | 태그 정규화 규칙을 서버와 화면이 똑같이 적용한다 | S |
| P1 | [PROJ-03](#proj-03--파일과-이미지) | S3 직접 업로드와 만료되지 않는 열람 주소를 제공한다 | L |
| P1 | [LIST-01](#list-01--목록) | 내 프로젝트를 페이지 응답으로 바꾸고 요약·태그·공개 여부를 포함한다 | M |
| P1 | [PORT-01](#port-01--포트폴리오-저장) | 포트폴리오 정보·구성·순서·공개를 한 번에 저장한다 | M |
| P1 | [PROFILE-01](#profile-01--프로필) | 첫 저장에서 모든 항목을 받고 닉네임 중복을 구분한다 | S~M |
| P1 | [AUTH-02](#auth-02--대학-이메일-인증) | 발송 응답에 만료·재발송 시각을 넣는다 | S |
| P1 | [ACCOUNT-01](#account-01--탈퇴와-복구) | 로그인 응답으로 신규·복구를 구분하고 탈퇴 시 토큰을 폐기한다 | M |
| P2 | [PROJ-04](#proj-04--팀원공개-전환삭제) | 팀원 추가·제거, 공개 전환, 프로젝트 삭제 API를 추가한다 | L |
| P2 | [LIMIT-01](#limit-01--호출-제한) | 제한 초과는 `429`와 `Retry-After`로 알린다 | M |
| P2 | [INTEGRATION-01](#integration-01--경로-버전) | `/api/v1` 전환 시 2주간 두 경로를 함께 제공한다 | S |

## 2. 현재 서버에서 먼저 확인할 동작

제안 이전에, 지금 서버가 팀 정책이나 명세와 다르게 동작하는 부분이다. 연동을 시작하려면 S-01~S-03이 먼저 해결돼야 한다.

| ID | 현재 동작 | 근거 | 요청 |
|---|---|---|---|
| **S-01** | `GET /api/home`, `GET /api/projects`, `GET /api/projects/{id}`가 비로그인 상태에서 `403`을 반환한다. 팀 정책상 공개 조회다. | 실측. `SecurityConfig`의 `permitAll`에 `GET /api/portfolios/*`만 있다 | 세 경로를 `permitAll`에 추가 |
| **S-02** | 인증이 없거나 access 토큰이 만료되면 본문이 빈 `403`을 반환한다. 화면은 로그인 필요와 권한 없음을 구분할 수 없고 재발급 시점도 알 수 없다. | 실측. `AuthenticationEntryPoint` 미설정 | 인증 실패는 `401` + [COMMON-01](#common-01--오류-응답) 본문 |
| **S-03** | 프로젝트 생성·수정·발행, 파일 업로드, 내 프로젝트 목록이 `HttpSession`의 `LOGIN_USER_ID`를 읽는다. JWT 전환 뒤 이 값을 저장하는 코드가 없어 로그인해도 항상 `401`이 된다. | 소스. `ProjectController`, `ProjectFileController`, `UserProjectController` | 다른 컨트롤러처럼 `@AuthenticatedUser`로 교체 |
| **S-04** | Swagger에 `userId`가 필수 query로 표시되지만 실제로는 쿠키의 JWT에서 사용자 ID를 얻는다. | 소스. `@AuthenticatedUser` 인자가 문서에 노출됨 | 해당 인자에 `@Parameter(hidden = true)` |
| **S-05** | 프로젝트 상세가 DRAFT·비공개도 요청자와 무관하게 반환하고 조회수를 올린다. 파일 목록·파일 삭제·AI 리뷰에는 프로젝트 소유 검사가 없다. | 소스. `ProjectQueryServiceImpl`, `ProjectFileService`, `ProjectReviewService` | [ACCESS-01](#access-01--공개비공개-조회-권한)의 권한 표 적용 |
| **S-06** | 발행 시 썸네일과 본문 30자 검증이 없다. `PROJECT_CONTENT_TOO_SHORT`, `PROJECT_THUMBNAIL_REQUIRED` 코드는 정의만 돼 있다. | 소스. `ProjectService.publishProject` | [PROJ-01](#proj-01--임시저장과-발행) |
| **S-07** | 프로젝트·프로필 수정이 보내지 않은 필드를 `null`로 덮어쓴다. 제목이나 닉네임 없이 보내면 DB 제약 오류로 `500`이 된다. 태그를 생략하면 기존 태그가 모두 지워진다. | 소스. `Project.update`, `UserProfile.update`, `saveTags` | [PROJ-01](#proj-01--임시저장과-발행), [PROFILE-01](#profile-01--프로필) |
| **S-08** | 업로드 용량 설정이 없어 Spring 기본값(파일당 1MB)이 적용될 수 있다. 형식 검사도 없다. | 소스. `application-prod.yml`에 multipart 설정 없음. 환경변수 설정 여부는 미확인 | [PROJ-03](#proj-03--파일과-이미지) |
| **S-09** | 탈퇴해도 refresh 토큰과 쿠키가 남는다. 탈퇴 후 기간과 관계없이 다시 로그인하면 항상 복구된다. | 소스. `UserController.withdraw`, `AuthService.handleDeletedUser` | [ACCOUNT-01](#account-01--탈퇴와-복구) |
| **S-10** | 허용 목록에 없는 `Origin`으로 요청하면 `403 Invalid CORS request`다. 허용 목록은 localhost와 `campus-polio.vercel.app`뿐이다. | 실측, 소스 | Vercel 미리보기 주소(`*.vercel.app` 패턴)에서 쓰기 요청이 통과하는지 함께 확인 |
| **S-11** | 검색 키워드는 제목만 찾고, 태그 여러 개는 하나라도 맞으면 포함한다. `isLiked`는 항상 `false`다. 잘못된 `page`/`size`는 `500`이 된다. | 소스. `ProjectSpecification`, `ProjectQueryServiceImpl` | [LIST-01](#list-01--목록) |
| **S-12** | 명세 설명이 구현과 다르다. 대학 인증 메일은 실제 SMTP로 발송하는데 설명은 "서버 로그 출력"이고, `/users/me`·프로필 설명에 "세션" 문구가 남아 있다. 정렬 설명의 `POPULAR`는 enum에 없다. | 소스, 명세 | 설명 수정 |

## 3. 공통 규칙

### COMMON-01 · 오류 응답

현재 본문은 `{"success": false, "message": "..."}`뿐이라 화면이 문구로만 원인을 구분해야 한다. 이미 있는 `ErrorCode` enum 이름을 `code`로 내려 주면 된다.

```json
{
  "success": false,
  "code": "PROJECT_CONTENT_TOO_SHORT",
  "message": "프로젝트 내용은 최소 30자 이상이어야 합니다.",
  "fieldErrors": [{ "field": "content", "code": "PROJECT_CONTENT_TOO_SHORT", "message": "..." }],
  "retryAfterSeconds": null
}
```

- `code`는 모든 오류에 필수다. `fieldErrors`는 입력 검증 실패(`400`)에서만, `retryAfterSeconds`는 `429`에서만 채운다.
- Bean Validation 실패는 첫 오류만 반환하지 않고 모든 필드를 `fieldErrors`에 담는다. 최상위 `code`는 `VALIDATION_FAILED`다.
- HTTP 상태: 인증 없음 `401`, 권한 없음 `403`, 없음·열람 불가 `404`, 중복 `409`, 제한 초과 `429`, 서버 오류 `500`.
- Swagger의 오류 응답은 성공 schema가 아니라 `ErrorResponse`를 참조한다.
- FE 동작: `code`로 분기하고, `code`가 없으면 HTTP 상태로만 분기한다. 그래서 백엔드 반영 전에도 화면은 동작한다.

### COMMON-02 · 목록 응답

페이지가 있는 목록은 모두 같은 모양을 쓴다. `page`는 0부터, `size`는 1~50만 허용하고 범위를 벗어나면 `400 VALIDATION_FAILED`다.

```json
{ "success": true, "data": { "content": [], "page": 0, "size": 9, "totalElements": 0, "totalPages": 0 } }
```

### COMMON-03 · 성공 응답과 형식

- 본문이 없는 성공도 `200`과 `{"success": true, "data": null}`로 응답한다. 이미 구현된 `DELETE /api/users/me`의 `204`만 예외로 둔다.
- 날짜는 `2026-11-22T10:30:00+09:00`처럼 시간대를 포함한 ISO-8601로 보낸다. 현재는 시간대 없는 `LocalDateTime`이라 화면이 KST로 가정해야 한다.
- 이미지 주소 필드명은 응답에서 `thumbnailUrl`로 통일한다. 현재 `MyProjectResponse`와 `ProjectUpdateRequest`만 `thumbnail`이다.

## 4. 영역별 제안

### AUTH-01 · 로그인 유지와 본인 식별

현재 구현(소스): 쿠키 `accessToken`(15분)·`refreshToken`(14일), `HttpOnly; Secure; SameSite=None; Path=/`, Domain 미지정. 재발급 시 이전 refresh 토큰을 폐기하고 새 쌍을 발급한다. 화면은 Next의 `/api/*` rewrite를 통해 호출하므로 쿠키는 프론트 도메인에 저장된다.

| 항목 | 제안 |
|---|---|
| 본인 식별 | 쿠키의 JWT만 사용한다. `userId` query는 받지 않으며 명세에서 제거한다(S-04). FE는 지금처럼 보내지 않는다. 대학 인증 3개 API에서 FE가 보내던 `userId`도 제거한다. |
| 인증 실패 | 보호 API는 `401 UNAUTHORIZED`. 선택 사항으로 access 쿠키가 아예 없으면 `AUTH_REQUIRED`, 만료·위조면 `ACCESS_TOKEN_EXPIRED`로 나누면 FE가 불필요한 재발급 호출을 생략할 수 있다. |
| 재발급 | `POST /api/auth/refresh`, 본문 없음. 성공 `200` + 새 쿠키 + `LoginResponse`. refresh 쿠키가 없거나 만료·폐기됐으면 `401 REFRESH_TOKEN_INVALID`. |
| 로그아웃 | `POST /api/auth/logout`은 쿠키 유무와 관계없이 항상 `200`이고 두 쿠키를 삭제한다(현재 구현과 같음). |
| 쿠키 속성 | 화면이 rewrite로만 호출하므로 `SameSite=Lax`로 낮추기를 권한다. CSRF 방어가 꺼져 있어 `None`이면 다른 사이트에서 보낸 요청에도 쿠키가 실린다. |
| 로그인 응답 | `LoginResponse`와 `UserMeResponse`에 `hasProfile`, `nickname`, `profileImage`를 추가한다. 헤더 표시와 프로필 작성 유도에 쓰며, 프로필 없음을 `GET /api/profile`의 `404`로 판단하지 않아도 된다. |

```json
{ "success": true, "data": { "id": 12, "email": "user@gmail.com", "universityVerified": false,
  "hasProfile": true, "nickname": "campus-dev", "profileImage": null, "accountStatus": "ACTIVE" } }
```

`accountStatus`는 [ACCOUNT-01](#account-01--탈퇴와-복구)에서 설명한다.

FE가 이 계약으로 구현할 동작:

1. 보호 요청이 `401`이면 재발급을 한 번 호출한다. 동시에 실패한 요청은 같은 재발급 결과를 공유한다.
2. 재발급이 `200`이면 원래 요청을 한 번만 다시 보낸다. `401`은 요청이 처리되기 전에 거절된 것이므로 쓰기 요청도 다시 보낸다.
3. 재발급이 `401`이면 원래 요청을 한 번 더 시도한다. 다른 탭이 먼저 갱신해 새 쿠키가 생겼을 수 있기 때문이다. 그래도 `401`이면 로그아웃 상태로 전환하고 로그인 화면으로 보낸다.
4. 재발급이 `5xx`거나 응답이 없으면 로그인 상태를 지우지 않고 "잠시 후 다시 시도" 안내를 보여 준다.

### AUTH-02 · 대학 이메일 인증

현재 구현(소스): `.ac.kr`로 끝나는 주소만 허용, 6자리 코드, 만료 5분, 재발송은 발송과 같은 동작, 횟수 제한 없음. 인증 기록은 이메일 기준이라 사용자와 묶이지 않는다.

| API | 제안 |
|---|---|
| `POST /api/auth/email/send`, `/resend` | 요청 `{ "email": "..." }`. 응답 `data`에 `expiresAt`, `resendAvailableAt`(발송 후 60초)을 추가한다. 화면은 이 값으로만 타이머를 표시한다. |
| `POST /api/auth/email/verify` | 요청 `{ "email": "...", "code": "123456" }`. 성공 후 FE는 `GET /api/users/me`를 다시 조회한다. |

- 오류 `400`: `EMAIL_NOT_UNIVERSITY_DOMAIN`, `EMAIL_VERIFICATION_NOT_FOUND`, `EMAIL_VERIFICATION_EXPIRED`, `EMAIL_VERIFICATION_CODE_MISMATCH`, `EMAIL_ALREADY_VERIFIED`(모두 기존 코드). 재발송 대기 중이거나 횟수 초과면 `429 RATE_LIMITED`.
- 인증 기록을 발송을 요청한 사용자와 묶는다. 지금은 다른 사용자가 같은 주소로 받은 코드로도 인증된다.
- 하나의 대학 이메일은 한 계정에만 쓰도록 하고 이미 쓰였으면 `409 EMAIL_ALREADY_USED`를 반환하기를 권한다. 팀 정책에 없는 내용이므로 [6절](#6-팀-결정이-필요한-정책)에서 결정한다.

### ACCESS-01 · 공개·비공개 조회 권한

| 대상 | 비로그인 | 로그인한 타인 | MEMBER | OWNER |
|---|---|---|---|---|
| 발행 + 공개 프로젝트 상세·파일 목록 | 가능 | 가능 | 가능 | 가능 |
| DRAFT 또는 비공개 프로젝트 상세·파일 목록 | `404` | `404` | 가능 | 가능 |
| 프로젝트 수정·발행·파일 업로드·파일 삭제 | `401` | `403` | `403` | 가능 |
| AI 리뷰 실행 | `401` | `403` | 가능 | 가능 |
| 공개 포트폴리오 상세 | 가능 | 가능 | – | 가능 |
| 비공개 포트폴리오 상세 | `404` | `404` | – | 가능 |

- 비로그인 사용자가 비공개 주소를 열면 `401`이 아니라 `404 PROJECT_NOT_FOUND`를 반환한다. 존재 여부를 숨기는 정책과 일치하고, FE는 비로그인일 때 `404` 화면에 로그인 버튼을 함께 보여 준다.
- DRAFT도 MEMBER가 열람할 수 있다.
- 조회수는 발행 + 공개 상태의 조회에서만 올린다.
- 소프트 삭제된 프로젝트·포트폴리오·계정은 모든 조회에서 `404`이고 목록에서 제외한다.
- `ProjectDetailResponse`에 다음을 추가한다. 화면이 편집 버튼 표시와 DRAFT 이어쓰기를 판단하는 데 필요하다.

```json
{ "status": "DRAFT", "isPublic": false, "myRole": "OWNER", "updatedAt": "2026-11-22T10:30:00+09:00", "publishedAt": null }
```

`myRole`은 `OWNER` / `MEMBER` / `null`(비로그인 또는 타인)이다. `users[]`에는 `name` 대신 `nickname`과 `profileImage`를 내려 준다. 이름은 선택 항목이라 지금은 `"알 수 없음"` 같은 대체 문구가 데이터로 내려온다.

### PROJ-01 · 임시저장과 발행

| API | 제안 |
|---|---|
| `POST /api/projects` | 변경 없음. 로그인만 필요하고 대학 인증은 요구하지 않는다. `{ "title", "description" }` → `{ "projectId" }`. |
| `PATCH /api/projects/{projectId}` | **전체 저장**으로 정의한다. FE는 항상 `title`, `description`, `content`, `thumbnailUrl`, `tags`를 모두 보낸다. `title`은 필수(1~255자), 나머지는 `null`이면 비운다. 현재 구현과 같은 동작이며 S-07의 `500`만 `400`으로 바꾸면 된다. 대학 인증 없이도 OWNER면 가능하다. |
| `POST /api/projects/{projectId}/publish` | 본문은 `PATCH`와 같다. 저장과 발행을 한 번에 처리하고 아래 검증을 서버가 한다. 이미 발행된 프로젝트에 호출하면 내용만 저장하고 `200`을 반환한다. |

발행 검증과 오류:

| 조건 | 오류 |
|---|---|
| OWNER가 아님 | `403 PROJECT_FORBIDDEN` |
| 대학 인증 전 | `403 PROJECT_PUBLISH_FORBIDDEN` |
| 제목 없음 | `400 PROJECT_TITLE_REQUIRED` |
| 썸네일 없음 | `400 PROJECT_THUMBNAIL_REQUIRED` |
| 본문 30자 미만 / 50,000자 초과 | `400 PROJECT_CONTENT_TOO_SHORT` / `PROJECT_CONTENT_TOO_LONG`(신규) |

- 본문 길이는 Markdown 원문을 앞뒤 공백 제거 후 유니코드 문자 수로 센다. FE도 같은 방식으로 센다.
- 이미 발행된 프로젝트를 `PATCH`로 수정할 때도 같은 검증을 적용한다. 발행 조건을 깨는 저장은 거절한다.
- 발행 응답은 `{ "projectId", "status": "PUBLISHED", "isPublic": true, "publishedAt" }`를 반환한다.

### PROJ-02 · 태그

서버와 화면이 같은 순서로 정규화한다.

1. 앞뒤 공백 제거 → 소문자 변환.
2. 연속된 공백을 하이픈 하나로 변환, 연속된 하이픈을 하나로 축약, 앞뒤 하이픈 제거.
3. 허용 문자는 한글(가~힣), 영문 소문자, 숫자, 하이픈이다. 그 외 문자가 있으면 `400 PROJECT_TAG_INVALID`(신규).
4. 정규화 결과는 1~10자. 벗어나면 `400 PROJECT_TAG_INVALID`.
5. 정규화 후 같은 태그는 오류 없이 하나로 합친다. 합친 뒤 10개를 넘으면 `400 PROJECT_TAG_LIMIT_EXCEEDED`.

- 오류의 `fieldErrors[].field`는 `tags[2]`처럼 위치를 포함한다.
- 검색의 `tags` query도 같은 규칙으로 정규화한 뒤 비교한다.
- 한글 허용은 FE 추천이다. 팀 정책의 "특수문자 불허"에 한글이 포함되는지는 [6절](#6-팀-결정이-필요한-정책)에서 확인한다.

### PROJ-03 · 파일과 이미지

현재 구현(소스): 서버가 multipart를 받아 S3에 올리고, 10분짜리 서명 URL을 `fileUrl`로 반환한다. 이 URL을 본문에 넣으면 10분 뒤 이미지가 깨진다. 화면의 요청은 Vercel rewrite를 거치므로 100MB 파일을 서버 경유로 올리기 어렵다. 팀 정책의 "서명 URL 발급" 방식에 맞춰 다음 3단계를 제안한다.

**1) 업로드 주소 발급** `POST /api/projects/{projectId}/files/presign` (OWNER)

```json
{ "fileName": "main.png", "contentType": "image/png", "fileSize": 482113, "purpose": "CONTENT_IMAGE" }
```

```json
{ "success": true, "data": { "fileId": 91, "uploadUrl": "https://...s3...", "method": "PUT",
  "headers": { "Content-Type": "image/png" }, "expiresAt": "2026-11-22T10:35:00+09:00" } }
```

**2) 브라우저가 `uploadUrl`로 S3에 직접 `PUT`** 한다. 버킷 CORS에 프론트 도메인의 `PUT`을 허용해야 한다.

**3) 업로드 완료 확인** `POST /api/projects/{projectId}/files/{fileId}/complete` (OWNER). 서버가 실제 크기와 MIME을 확인한 뒤 파일을 프로젝트에 연결한다.

```json
{ "success": true, "data": { "fileId": 91, "originalName": "main.png", "contentType": "image/png",
  "fileSize": 482113, "purpose": "CONTENT_IMAGE", "viewUrl": "/api/files/91" } }
```

**열람** `GET /api/files/{fileId}` → 권한 확인 후 5분짜리 서명 URL로 `302` 이동한다. 권한은 [ACCESS-01](#access-01--공개비공개-조회-권한)의 프로젝트 열람 규칙을 따른다. 본문과 썸네일에는 만료되는 URL 대신 `/api/files/{fileId}`를 저장한다.

| 항목 | 제안 |
|---|---|
| `purpose` | `THUMBNAIL`, `CONTENT_IMAGE`. AI 리뷰용 코드 파일은 [6절](#6-팀-결정이-필요한-정책) 결정 후 `REVIEW_SOURCE`를 추가한다. |
| 형식·용량 | PNG·JPG, 파일당 100MB(104,857,600바이트) 이하. 발급 단계에서 선언값을, 완료 단계에서 실제 값을 검사한다. |
| 오류 | `400 INVALID_FILE_TYPE`, `400 FILE_SIZE_EXCEEDED`(기존 코드), `404 PROJECT_FILE_NOT_FOUND`, 완료 시 S3에 객체가 없으면 `400 FILE_UPLOAD_INCOMPLETE`(신규) |
| 목록 | `GET /api/projects/{projectId}/files` 응답에 `purpose`, `viewUrl`을 추가한다. 편집을 다시 열 때 첨부를 복원하는 데 쓴다. |
| 삭제 | `DELETE /api/projects/files/{fileId}` (OWNER). 경로는 유지한다. |
| 미연결 정리 | 발급 후 24시간 안에 완료 확인이 없는 파일을 정리한다. "연결"의 기준은 완료 확인이다. |
| 기존 API | `POST /api/projects/{projectId}/files`(multipart)는 전환 기간에 유지하고, FE 전환이 끝나면 제거한다. |

### PROJ-04 · 팀원·공개 전환·삭제

모두 신규 API이며 OWNER만 호출할 수 있다. OWNER가 아니면 `403 PROJECT_FORBIDDEN`이다.

| API | 요청 → 응답 | 오류 |
|---|---|---|
| `GET /api/users/search?nickname=ca&size=10` | 닉네임 앞부분 일치, 2자 이상. 본인과 탈퇴 계정 제외 → `[{ "userId", "nickname", "profileImage" }]` | `400 VALIDATION_FAILED` |
| `POST /api/projects/{projectId}/members` | `{ "userId": 34 }` → 갱신된 `users[]`. 수락 절차 없이 바로 MEMBER가 된다. | `404 USER_NOT_FOUND`, `409 PROJECT_MEMBER_DUPLICATED`, `400 PROJECT_MEMBER_LIMIT_EXCEEDED`(10명) |
| `DELETE /api/projects/{projectId}/members/{userId}` | → 갱신된 `users[]`. OWNER 자신은 제거할 수 없다. | `400 PROJECT_OWNER_NOT_REMOVABLE` |
| `DELETE /api/projects/{projectId}/members/me` | MEMBER가 스스로 나간다. OWNER 전용 규칙의 예외다. | `400 PROJECT_OWNER_NOT_REMOVABLE` |
| `PATCH /api/projects/{projectId}/visibility` | `{ "isPublic": false }` → `{ "projectId", "isPublic", "autoPrivatePortfolioIds": [3] }` | DRAFT면 `400 PROJECT_NOT_PUBLISHED` |
| `DELETE /api/projects/{projectId}` | 소프트 삭제 → `{ "projectId", "autoPrivatePortfolioIds": [] }` | `404 PROJECT_NOT_FOUND` |

- 초대 수락 절차를 두지 않은 이유는 알림 기능이 아직 없어 초대를 전달할 수단이 없기 때문이다. 대신 MEMBER가 스스로 나갈 수 있게 한다.
- `autoPrivatePortfolioIds`는 이 변경으로 공개 프로젝트가 0개가 되어 자동 비공개가 된 포트폴리오다. FE가 결과 안내에 쓴다.

### LIST-01 · 목록

**내 프로젝트** `GET /api/users/me/projects` — 현재는 query 없는 배열이고 `tags`·`description`이 없다.

| query | 기본값 | 설명 |
|---|---|---|
| `page`, `size` | `0`, `9` | [COMMON-02](#common-02--목록-응답) |
| `status` | 전체 | `DRAFT` / `PUBLISHED` |
| `role` | 전체 | `OWNER` / `MEMBER` |
| `keyword` | 없음 | 제목·요약 부분 일치 |

```json
{ "projectId": 7, "title": "캠퍼스 지도", "description": "요약", "thumbnailUrl": "/api/files/91",
  "tags": ["react", "지도"], "status": "PUBLISHED", "isPublic": true, "role": "OWNER",
  "updatedAt": "2026-11-20T09:00:00+09:00", "publishedAt": "2026-11-01T12:00:00+09:00" }
```

정렬은 `updatedAt` 내림차순이다. 포트폴리오 제작 화면은 `status=PUBLISHED&size=50`으로 같은 API를 쓴다. FE는 이미 배열과 페이지 응답을 모두 처리하므로 서버가 바뀌는 시점에 화면이 깨지지 않는다.

**공개 검색** `GET /api/projects`

| 항목 | 현재 | 제안 |
|---|---|---|
| `size` | 기본 9, 상한 없음 | 기본 9, 최대 50 |
| `keyword` | 제목만 | 제목 + 요약 |
| `tags` | 하나라도 포함(OR) | 선택한 태그 모두 포함(AND) |
| `filterType` | `LATEST`, `VIEW_COUNT` | 그대로. 설명의 `POPULAR` 문구만 삭제 |
| `LATEST` 기준 | `createdAt`(DRAFT 생성 시각) | `publishedAt`(최초 발행 시각). 컬럼 추가 필요 |

**내 포트폴리오** `GET /api/users/me/portfolios` — 변경 없음(기본 6). 응답 항목에 [PORT-01](#port-01--포트폴리오-저장)의 `autoPrivateReason`만 추가한다.

좋아요 API는 서버에 없으므로 FE는 좋아요 버튼을 연결하지 않고 `likeCount` 표시만 유지한다.

### PORT-01 · 포트폴리오 저장

현재는 생성 → 정보 수정 → 프로젝트 구성 → 순서 → 공개를 다섯 번 호출한다. 중간에 실패하면 일부만 저장되고, 다시 시도하면 포트폴리오가 중복 생성된다.

| API | 제안 |
|---|---|
| `POST /api/portfolios` | 아래 본문 전체를 받는다. `title`만 필수이고 나머지는 선택이다. 한 트랜잭션으로 처리한다. |
| `PUT /api/portfolios/{portfolioId}` (신규) | 같은 본문으로 전체를 교체한다. `projectIds`의 순서가 표시 순서다. |
| `GET /api/users/me/portfolios/{portfolioId}` (신규) | 소유자용 관리 조회. 비공개·DRAFT 프로젝트도 포함한다. |
| 기존 `PATCH` 4종 | 전환 기간에 유지하고 FE 전환 후 제거한다. |

```json
{ "title": "2026 포트폴리오", "description": "소개", "thumbnailUrl": null, "isPublic": true, "projectIds": [7, 3, 12] }
```

```json
{ "success": true, "data": { "portfolioId": 5, "slug": "2026-포트폴리오", "title": "2026 포트폴리오",
  "description": "소개", "thumbnailUrl": null, "isPublic": true, "autoPrivateReason": null,
  "updatedAt": "2026-11-22T10:30:00+09:00",
  "projects": [{ "projectId": 7, "title": "캠퍼스 지도", "thumbnailUrl": "/api/files/91",
    "status": "PUBLISHED", "isPublic": true, "visible": true, "displayOrder": 0 }] } }
```

| 조건 | 오류 |
|---|---|
| 대학 인증 전 | `403 UNIVERSITY_VERIFICATION_REQUIRED` |
| 소유자가 아님 | `403 PORTFOLIO_FORBIDDEN` |
| 내가 OWNER/MEMBER가 아닌 프로젝트 포함 | `403 PROJECT_FORBIDDEN` |
| 발행되지 않은 프로젝트 포함 | `400 PORTFOLIO_PROJECT_NOT_PUBLISHED`(신규) |
| `projectIds` 중복 / 50개 초과 | `400 PORTFOLIO_PROJECT_DUPLICATED` / `PORTFOLIO_PROJECT_LIMIT_EXCEEDED` |
| 공개인데 공개 프로젝트가 0개 | `400 PORTFOLIO_PUBLIC_PROJECT_REQUIRED` |

- `visible`은 공개 상세에 노출되는지(발행 + 공개 + 미삭제)를 뜻한다.
- 공개 프로젝트가 0개가 되면 원인(비공개 전환, 삭제, 연결 해제)과 관계없이 포트폴리오를 자동 비공개로 바꾸고 `autoPrivateReason: "NO_VISIBLE_PROJECT"`를 남긴다. 소유자가 다시 공개하면 `null`로 되돌린다.
- 응답 유실로 인한 중복 생성은 FE가 재시도 전에 내 포트폴리오 목록을 다시 조회해 막는다. 서버가 `Idempotency-Key` 헤더를 지원하면 더 확실하지만 필수는 아니다.

### PROFILE-01 · 프로필

| API | 제안 |
|---|---|
| `POST /api/profile` | `nickname`(필수), `name`, `bio`, `major`, `grade`, `profileImage`를 모두 받는다. 지금은 `nickname`·`bio`만 받아 첫 저장에 두 번 호출해야 한다. |
| `PATCH /api/profile` | **전체 저장**으로 정의한다. FE는 항상 모든 필드를 보낸다. `nickname`은 필수, 나머지는 `null`이면 비운다. 현재 구현과 같다. |
| `GET /api/profile/nickname-availability?nickname=` (신규, 선택) | → `{ "available": true }`. 없으면 FE는 저장 시 `409`로만 안내한다. |

| 필드 | 규칙 |
|---|---|
| `nickname` | 2~20자, 한글·영문·숫자·밑줄. 앞뒤 공백 제거 후 대소문자 구분 없이 고유 |
| `grade` | 1~6 정수 또는 `null`(미선택). 명세에 nullable로 표시 |
| `name` / `major` / `bio` | 최대 30 / 50 / 500자, `null` 허용 |

오류: 닉네임 중복 `409 NICKNAME_DUPLICATED`(신규), 프로필이 이미 있음 `409 PROFILE_ALREADY_EXISTS`, 프로필 없음 `404 PROFILE_NOT_FOUND`. 두 `409`를 `code`로 구분하므로 FE는 닉네임 중복일 때만 입력란에 오류를 표시한다.

### ACCOUNT-01 · 탈퇴와 복구

| 항목 | 제안 |
|---|---|
| `DELETE /api/users/me` | `204`. 해당 사용자의 refresh 토큰을 모두 폐기하고 두 쿠키를 삭제한다. |
| 30일 이내 재로그인 | 계정을 복구하고 `accountStatus: "RESTORED"`를 반환한다. |
| 30일 초과 재로그인 | 새 계정을 만들고 `accountStatus: "NEW"`를 반환한다. `google_id`·`email` 고유 제약 때문에 이전 계정의 두 값을 비식별 처리해야 한다. |
| 그 외 로그인 | 최초 가입은 `"NEW"`, 기존 계정은 `"ACTIVE"` |

FE는 `RESTORED`일 때 "계정이 복구되었습니다" 안내를 띄우고 내 목록을 새로 조회한다. `NEW`일 때는 프로필 작성으로 안내한다. 소유권·닉네임·파일 보존 규칙은 [6절](#6-팀-결정이-필요한-정책)의 추천안을 따른다.

### LIMIT-01 · 호출 제한

- 제한 초과는 `429 RATE_LIMITED`이고, `Retry-After` 헤더(초)와 본문 `retryAfterSeconds`에 같은 값을 넣는다.
- 여러 제한이 겹치면 더 엄격한 쪽을 적용한다. 검색은 1분 120회로 확정하기를 권한다.
- "S3 서명 URL 발급 10분 10회"는 업로드 주소 발급에만 적용한다. 열람(`GET /api/files/{fileId}`)까지 세면 이미지가 많은 상세 화면 한 번으로 초과한다. 본문 이미지를 여러 장 올리는 작성 흐름을 고려해 10분 30회를 권한다.
- 화면의 요청은 Vercel rewrite를 거쳐 서버에 도착한다. 비로그인 제한을 접속 IP로 세면 모든 방문자가 같은 IP로 집계되므로 `X-Forwarded-For`의 원래 주소를 사용해야 한다.
- FE 동작: `429`를 받으면 남은 시간을 안내하고 자동으로 다시 보내지 않는다.

### INTEGRATION-01 · 경로 버전

`/api/v1` 전환은 이 계약안의 P0·P1이 확정된 뒤에 하고, 전환 후 2주간 `/api`와 `/api/v1`을 함께 제공하기를 권한다. FE는 경로 접두사를 한 곳에서 관리하도록 준비한다.

## 5. 오류 코드

신규 코드만 정리한다. 나머지는 서버의 기존 `ErrorCode` 이름을 그대로 쓴다.

| code | 상태 | 쓰이는 곳 |
|---|---|---|
| `VALIDATION_FAILED` | 400 | 입력 검증 실패의 최상위 코드 |
| `AUTH_REQUIRED`, `ACCESS_TOKEN_EXPIRED` | 401 | AUTH-01 (선택) |
| `REFRESH_TOKEN_INVALID` | 401 | AUTH-01 |
| `EMAIL_ALREADY_USED` | 409 | AUTH-02 |
| `PROJECT_CONTENT_TOO_LONG` | 400 | PROJ-01 |
| `PROJECT_TAG_INVALID` | 400 | PROJ-02 |
| `FILE_UPLOAD_INCOMPLETE` | 400 | PROJ-03 |
| `PROJECT_MEMBER_DUPLICATED` | 409 | PROJ-04 |
| `PROJECT_MEMBER_LIMIT_EXCEEDED`, `PROJECT_OWNER_NOT_REMOVABLE` | 400 | PROJ-04 |
| `PORTFOLIO_PROJECT_NOT_PUBLISHED` | 400 | PORT-01 |
| `NICKNAME_DUPLICATED` | 409 | PROFILE-01 |
| `RATE_LIMITED` | 429 | LIMIT-01 |

## 6. 팀 결정이 필요한 정책

API 모양이 아니라 서비스 정책이라 백엔드 단독으로 정할 수 없는 항목이다. 결정 전까지 FE는 추천안으로 화면을 준비한다.

| ID | 질문 | FE 추천 |
|---|---|---|
| **D-01** | AI 리뷰는 프로젝트 첨부 중 코드 파일(java, js, ts, py 등)을 분석한다. 그런데 팀 정책은 PNG·JPG만 허용하므로 리뷰할 파일이 없다. | 리뷰 전용 첨부(`purpose: REVIEW_SOURCE`, 코드 확장자, 파일당 1MB, 프로젝트당 20개)를 따로 둔다. 결정 전까지 FE는 AI 리뷰 진입을 숨긴다. |
| **D-02** | 태그에 한글을 허용하는가. | 허용한다. |
| **D-03** | 한 대학 이메일로 여러 계정을 인증할 수 있는가. | 한 계정만 허용한다. |
| **D-04** | 탈퇴로 소유권을 넘긴 뒤 30일 안에 복귀하면 소유권은 어떻게 되는가. | 넘어간 프로젝트는 새 OWNER를 유지하고 복귀자는 MEMBER로 다시 참여한다. 함께 소프트 삭제됐던 프로젝트만 OWNER로 복구한다. |
| **D-05** | 복구 기간에 닉네임을 다른 사람이 쓸 수 있는가. | 30일간 예약해 쓸 수 없게 한다. |
| **D-06** | 탈퇴로 소프트 삭제된 프로젝트의 파일·북마크는 언제 지우는가. | 30일간 보존하고 기간이 지나면 예약 작업으로 지운다. 직접 삭제한 프로젝트만 즉시 지운다. |
| **D-07** | 팀원 추가에 상대의 수락이 필요한가. | 필요 없다. 알림 기능이 생기면 다시 정한다. |
| **D-08** | 포트폴리오에 DRAFT 프로젝트를 연결할 수 있는가. | 발행된 프로젝트만 연결한다. 비공개 프로젝트는 연결할 수 있지만 공개 상세에 보이지 않는다. |

## 7. FE 진행 방식

- 이 문서의 요청·응답 모양으로 Mock과 스토리를 만들고 화면을 먼저 구현한다. 실제 서버 검증과는 구분해 기록한다.
- 서버가 아직 지원하지 않는 필드(`code`, `myRole`, `hasProfile` 등)는 없을 때도 화면이 동작하도록 선택 필드로 다룬다.
- 서버 조회(SSR)에서는 재발급을 하지 않는다. 서버에서 `401`을 받으면 브라우저가 재발급한 뒤 화면을 새로 조회한다.
- S-01~S-03이 해결되기 전에는 실서버에서 홈·검색·상세와 프로젝트 작성 흐름을 검증할 수 없다.

## 8. 회신 양식

아래 표를 복사해 항목별로 채워 회신하면 된다. "수정"이면 바꾸려는 내용만 적는다.

| ID             | 수락 / 수정 / 거절 | 수정 내용 또는 사유 | 반영 예정일 |
| -------------- | ------------ | ----------- | ------ |
| S-01 ~ S-03    |              |             |        |
| S-04 ~ S-12    |              |             |        |
| COMMON-01      |              |             |        |
| COMMON-02 · 03 |              |             |        |
| AUTH-01        |              |             |        |
| AUTH-02        |              |             |        |
| ACCESS-01      |              |             |        |
| PROJ-01        |              |             |        |
| PROJ-02        |              |             |        |
| PROJ-03        |              |             |        |
| PROJ-04        |              |             |        |
| LIST-01        |              |             |        |
| PORT-01        |              |             |        |
| PROFILE-01     |              |             |        |
| ACCOUNT-01     |              |             |        |
| LIMIT-01       |              |             |        |
| INTEGRATION-01 |              |             |        |
| D-01 ~ D-08    |              |             |        |
