{
  "openapi": "3.1.0",
  "info": {
    "title": "CampusPolio API",
    "description": "CampusPolio 백엔드 API 명세서",
    "version": "v1.0.0"
  },
  "servers": [
    {
      "url": "https://api.campuspolio.cloud",
      "description": "Production Server"
    },
    {
      "url": "http://localhost:8080",
      "description": "Local Server"
    }
  ],
  "tags": [
    {
      "name": "Project Query",
      "description": "프로젝트 조회 API"
    },
    {
      "name": "Profile",
      "description": "프로필 API"
    },
    {
      "name": "Project",
      "description": "프로젝트 API"
    },
    {
      "name": "User",
      "description": "사용자 API"
    },
    {
      "name": "Portfolio",
      "description": "포트폴리오 API"
    },
    {
      "name": "Home",
      "description": "메인 페이지 API"
    },
    {
      "name": "My Project",
      "description": "내 프로젝트 조회 API"
    },
    {
      "name": "Email Auth",
      "description": "학교 이메일 인증 API"
    },
    {
      "name": "Project File",
      "description": "프로젝트 파일 API"
    },
    {
      "name": "Auth",
      "description": "로그인/로그아웃 API"
    },
    {
      "name": "Project Review",
      "description": "AI 코드 리뷰"
    }
  ],
  "paths": {
    "/api/projects": {
      "get": {
        "tags": [
          "Project Query"
        ],
        "summary": "프로젝트 검색",
        "description": "키워드, 태그, 정렬 조건을 이용하여 공개된 프로젝트를 검색합니다.",
        "operationId": "search",
        "parameters": [
          {
            "name": "keyword",
            "in": "query",
            "description": "검색 키워드",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "tags",
            "in": "query",
            "description": "태그 목록",
            "required": false,
            "schema": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          {
            "name": "page",
            "in": "query",
            "description": "페이지 번호 (0부터 시작)",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 0
            }
          },
          {
            "name": "size",
            "in": "query",
            "description": "페이지 크기",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 9
            }
          },
          {
            "name": "filterType",
            "in": "query",
            "description": "정렬 조건 (LATEST, POPULAR)",
            "required": false,
            "schema": {
              "type": "string",
              "default": "LATEST",
              "enum": [
                "LATEST",
                "VIEW_COUNT"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProjectSearchPageResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Project"
        ],
        "summary": "프로젝트 Draft 생성",
        "description": "프로젝트를 Draft 상태로 생성합니다.\n로그인한 사용자만 가능합니다.\n생성한 사용자는 OWNER 권한을 가집니다.\n\n",
        "operationId": "createProject",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ProjectCreateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProjectCreateResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/projects/{projectId}/review": {
      "post": {
        "tags": [
          "Project Review"
        ],
        "summary": "AI 코드 리뷰",
        "operationId": "reviewProject",
        "parameters": [
          {
            "name": "projectId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProjectReviewResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/projects/{projectId}/publish": {
      "post": {
        "tags": [
          "Project"
        ],
        "summary": "프로젝트 발행",
        "description": "Draft 프로젝트를 발행(PUBLISHED) 상태로 변경합니다.\nOWNER만 가능합니다.\n",
        "operationId": "publishProject",
        "parameters": [
          {
            "name": "projectId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ProjectPublishRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseVoid"
                }
              }
            }
          }
        }
      }
    },
    "/api/projects/{projectId}/files": {
      "get": {
        "tags": [
          "Project File"
        ],
        "summary": "프로젝트 파일 조회",
        "operationId": "getFiles",
        "parameters": [
          {
            "name": "projectId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseListProjectFileResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Project File"
        ],
        "summary": "프로젝트 파일 업로드",
        "operationId": "uploadFile",
        "parameters": [
          {
            "name": "projectId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "file": {
                    "type": "string",
                    "format": "binary"
                  }
                },
                "required": [
                  "file"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProjectFileUploadResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/profile": {
      "get": {
        "tags": [
          "Profile"
        ],
        "summary": "내 프로필 조회",
        "description": "로그인 세션에 저장된 사용자 ID를 기준으로 내 프로필을 조회합니다.",
        "operationId": "getMyProfile",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "프로필 조회 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileResponse"
                }
              }
            }
          },
          "404": {
            "description": "사용자 또는 프로필 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileResponse"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Profile"
        ],
        "summary": "프로필 생성",
        "description": "현재 로그인한 사용자의 프로필을 생성합니다. 한 사용자당 하나의 프로필만 생성할 수 있습니다.",
        "operationId": "createProfile",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ProfileCreateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "프로필 생성 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileCreateResponse"
                }
              }
            }
          },
          "400": {
            "description": "잘못된 입력값",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileCreateResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileCreateResponse"
                }
              }
            }
          },
          "409": {
            "description": "이미 프로필 존재",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileCreateResponse"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "Profile"
        ],
        "summary": "프로필 수정",
        "description": "현재 로그인한 사용자의 프로필 정보를 수정합니다.",
        "operationId": "updateProfile",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ProfileUpdateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "프로필 수정 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileUpdateResponse"
                }
              }
            }
          },
          "400": {
            "description": "잘못된 입력값",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileUpdateResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileUpdateResponse"
                }
              }
            }
          },
          "404": {
            "description": "사용자 또는 프로필 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProfileUpdateResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/portfolios": {
      "post": {
        "tags": [
          "Portfolio"
        ],
        "summary": "포트폴리오 생성",
        "description": "현재 로그인한 사용자의 포트폴리오를 생성합니다.\n\n정책:\n- 로그인 필수\n- 대학 인증(universityVerified)이 완료된 사용자만 생성 가능\n- title은 필수\n- slug는 title 기반으로 자동 생성\n- slug 중복 시 -1, -2 형태로 자동 증가\n- 삭제된 slug도 재사용하지 않음\n",
        "operationId": "createPortfolio",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PortfolioCreateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "포트폴리오 생성 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioCreateResponse"
                }
              }
            }
          },
          "400": {
            "description": "잘못된 요청 또는 제목 누락",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioCreateResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioCreateResponse"
                }
              }
            }
          },
          "403": {
            "description": "대학 인증이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioCreateResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/test-login/{userId}": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "테스트 로그인",
        "description": "개발용 로그인 API",
        "operationId": "testLogin",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseVoid"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/logout": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "로그아웃",
        "description": "현재 세션을 만료시켜 로그아웃합니다.",
        "operationId": "logout",
        "responses": {
          "200": {
            "description": "로그아웃 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseVoid"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Google OAuth 로그인",
        "description": "프론트에서 Google 로그인 후 받은 idToken을 서버로 전달합니다.\n서버는 Google 사용자 정보를 검증한 뒤 User를 조회/생성하고 세션에 userId를 저장합니다.\n",
        "operationId": "login",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "로그인 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseLoginResponse"
                }
              }
            }
          },
          "400": {
            "description": "잘못된 요청 또는 이메일 정보 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseLoginResponse"
                }
              }
            }
          },
          "401": {
            "description": "유효하지 않은 Google 토큰",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseLoginResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/email/verify": {
      "post": {
        "tags": [
          "Email Auth"
        ],
        "summary": "이메일 인증번호 검증",
        "description": "이메일과 6자리 인증번호를 검증합니다.\n검증 성공 시 User의 universityVerified 값이 true로 변경됩니다.\n",
        "operationId": "verify",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/EmailVerifyRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "이메일 인증 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseEmailAuthResponse"
                }
              }
            }
          },
          "400": {
            "description": "인증번호 없음, 만료, 불일치",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseEmailAuthResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseEmailAuthResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/email/send": {
      "post": {
        "tags": [
          "Email Auth"
        ],
        "summary": "이메일 인증번호 발송",
        "description": "사용자가 입력한 대학 이메일(.ac.kr)로 인증번호를 발송합니다\n현재 구현에서는 실제 SMTP 발송 대신 서버 로그에 인증번호를 출력합니다.\n대학 이메일(.ac.kr)만 인증할 수 있습니다.\n",
        "operationId": "send",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/EmailSendRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "인증번호 발송 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseEmailAuthResponse"
                }
              }
            }
          },
          "400": {
            "description": "이메일 불일치, 대학 이메일 아님, 이미 인증됨",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseEmailAuthResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseEmailAuthResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/email/resend": {
      "post": {
        "tags": [
          "Email Auth"
        ],
        "summary": "이메일 인증번호 재발송",
        "description": "인증번호를 다시 생성하여 발송합니다. 현재는 서버 로그에 인증번호를 출력합니다.",
        "operationId": "resend",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/EmailSendRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "인증번호 재발송 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseEmailAuthResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/projects/{projectId}": {
      "get": {
        "tags": [
          "Project Query"
        ],
        "summary": "프로젝트 상세 조회",
        "description": "프로젝트 ID를 이용하여 프로젝트 상세 정보를 조회합니다.",
        "operationId": "getProjectDetail",
        "parameters": [
          {
            "name": "projectId",
            "in": "path",
            "description": "조회할 프로젝트 ID",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProjectDetailResponse"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "Project"
        ],
        "summary": "프로젝트 수정",
        "description": "프로젝트를 수정합니다.\nOWNER만 가능합니다.\n",
        "operationId": "updateProject",
        "parameters": [
          {
            "name": "projectId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ProjectUpdateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseProjectUpdateResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/portfolios/{portfolioId}": {
      "delete": {
        "tags": [
          "Portfolio"
        ],
        "summary": "포트폴리오 삭제",
        "description": "포트폴리오를 삭제합니다.\n\n정책:\n- 로그인 필수\n- 본인 포트폴리오만 삭제 가능\n- 포트폴리오는 soft delete 처리\n- 포함된 프로젝트 자체는 삭제하지 않음\n- 포트폴리오-프로젝트 연결만 제거\n- 삭제된 slug는 재사용하지 않음\n",
        "operationId": "deletePortfolio",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "portfolioId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "포트폴리오 삭제 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioDeleteResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioDeleteResponse"
                }
              }
            }
          },
          "403": {
            "description": "포트폴리오 권한 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioDeleteResponse"
                }
              }
            }
          },
          "404": {
            "description": "포트폴리오 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioDeleteResponse"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "Portfolio"
        ],
        "summary": "포트폴리오 정보 수정",
        "description": "포트폴리오의 기본 정보를 수정합니다.\n\n정책:\n- 로그인 필수\n- 본인 포트폴리오만 수정 가능\n- title, description, thumbnailUrl 수정 가능\n- title을 수정해도 slug는 변경하지 않음\n- null로 전달한 필드는 기존 값 유지\n",
        "operationId": "updatePortfolio",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "portfolioId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PortfolioUpdateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "포트폴리오 수정 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioUpdateResponse"
                }
              }
            }
          },
          "400": {
            "description": "잘못된 요청 또는 제목 누락",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioUpdateResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioUpdateResponse"
                }
              }
            }
          },
          "403": {
            "description": "포트폴리오 권한 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioUpdateResponse"
                }
              }
            }
          },
          "404": {
            "description": "포트폴리오 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioUpdateResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/portfolios/{portfolioId}/visibility": {
      "patch": {
        "tags": [
          "Portfolio"
        ],
        "summary": "포트폴리오 공개/비공개 변경",
        "description": "포트폴리오의 공개 여부를 변경합니다.\n\n정책:\n- 로그인 필수\n- 본인 포트폴리오만 변경 가능\n- 공개 전환 시 공개 + 발행 프로젝트가 1개 이상 포함되어야 함\n- 비공개 전환은 언제든 가능\n",
        "operationId": "updateVisibility",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "portfolioId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PortfolioVisibilityUpdateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "포트폴리오 공개 상태 변경 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioVisibilityUpdateResponse"
                }
              }
            }
          },
          "400": {
            "description": "공개 조건 불충족",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioVisibilityUpdateResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioVisibilityUpdateResponse"
                }
              }
            }
          },
          "403": {
            "description": "포트폴리오 권한 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioVisibilityUpdateResponse"
                }
              }
            }
          },
          "404": {
            "description": "포트폴리오 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioVisibilityUpdateResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/portfolios/{portfolioId}/projects": {
      "patch": {
        "tags": [
          "Portfolio"
        ],
        "summary": "포트폴리오 프로젝트 추가/제거",
        "description": "포트폴리오에 프로젝트를 추가하거나 제거합니다.\n\n정책:\n- 로그인 필수\n- 본인 포트폴리오만 수정 가능\n- 본인이 OWNER 또는 MEMBER인 프로젝트만 추가 가능\n- 중복 프로젝트 추가 불가\n- 최대 50개까지 추가 가능\n- 프로젝트 제거 시 포트폴리오와 프로젝트의 연결만 제거\n- 프로젝트 자체는 삭제하지 않음\n",
        "operationId": "updatePortfolioProjects",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "portfolioId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PortfolioProjectUpdateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "포트폴리오 프로젝트 수정 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioProjectUpdateResponse"
                }
              }
            }
          },
          "400": {
            "description": "잘못된 요청, 중복 프로젝트, 최대 개수 초과",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioProjectUpdateResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioProjectUpdateResponse"
                }
              }
            }
          },
          "403": {
            "description": "포트폴리오 또는 프로젝트 권한 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioProjectUpdateResponse"
                }
              }
            }
          },
          "404": {
            "description": "포트폴리오 또는 프로젝트 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioProjectUpdateResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/portfolios/{portfolioId}/order": {
      "patch": {
        "tags": [
          "Portfolio"
        ],
        "summary": "포트폴리오 프로젝트 순서 변경",
        "description": "포트폴리오에 포함된 프로젝트들의 표시 순서를 변경합니다.\n\n정책:\n- 로그인 필수\n- 본인 포트폴리오만 수정 가능\n- 요청한 projectOrder 배열은 현재 포트폴리오에 포함된 프로젝트 ID와 정확히 일치해야 함\n- 누락, 중복, 추가 ID가 있으면 실패\n",
        "operationId": "updateProjectOrder",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "portfolioId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PortfolioOrderUpdateRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "프로젝트 순서 변경 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioOrderUpdateResponse"
                }
              }
            }
          },
          "400": {
            "description": "잘못된 프로젝트 순서 배열",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioOrderUpdateResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioOrderUpdateResponse"
                }
              }
            }
          },
          "403": {
            "description": "포트폴리오 권한 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioOrderUpdateResponse"
                }
              }
            }
          },
          "404": {
            "description": "포트폴리오 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioOrderUpdateResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/users/me": {
      "get": {
        "tags": [
          "User"
        ],
        "summary": "내 정보 조회",
        "description": "로그인 세션에 저장된 사용자 ID를 기준으로 내 정보를 조회합니다.",
        "operationId": "getMe",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "내 정보 조회 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseUserMeResponse"
                }
              }
            }
          },
          "401": {
            "description": "인증 실패",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseUserMeResponse"
                }
              }
            }
          },
          "404": {
            "description": "사용자 없음",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseUserMeResponse"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "User"
        ],
        "summary": "회원 탈퇴",
        "description": "로그인 세션에 저장된 사용자 ID를 기준으로 회원을 탈퇴 처리하고 세션을 무효화합니다.",
        "operationId": "withdraw",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "회원 탈퇴 성공"
          },
          "401": {
            "description": "인증 실패"
          },
          "404": {
            "description": "사용자 없음"
          }
        }
      }
    },
    "/api/users/me/projects": {
      "get": {
        "tags": [
          "My Project"
        ],
        "summary": "내 프로젝트 목록 조회",
        "description": "내가 OWNER 또는 MEMBER로 참여중인\n프로젝트 목록을 조회합니다.\n",
        "operationId": "getMyProjects",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseListMyProjectResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/users/me/portfolios": {
      "get": {
        "tags": [
          "Portfolio"
        ],
        "summary": "내 포트폴리오 목록 조회",
        "description": "현재 로그인한 사용자의 포트폴리오 목록을 조회합니다.\n\n정책:\n- 로그인 필수\n- soft delete된 포트폴리오는 제외\n- 기본 페이지 크기는 6\n- isPublic 파라미터가 없으면 전체 조회\n- isPublic=true이면 공개 포트폴리오만 조회\n- isPublic=false이면 비공개 포트폴리오만 조회\n",
        "operationId": "getMyPortfolios",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 0
            }
          },
          {
            "name": "size",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 6
            }
          },
          {
            "name": "isPublic",
            "in": "query",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "내 포트폴리오 목록 조회 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMyPortfolioListResponse"
                }
              }
            }
          },
          "401": {
            "description": "로그인이 필요함",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseMyPortfolioListResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/portfolios/{slug}": {
      "get": {
        "tags": [
          "Portfolio"
        ],
        "summary": "slug 기반 포트폴리오 조회",
        "description": "slug를 기준으로 포트폴리오를 조회합니다.\n\n정책:\n- 공개 포트폴리오는 비로그인 사용자도 접근 가능\n- 비공개 포트폴리오는 본인만 접근 가능\n- 비공개 포트폴리오에 타인이 접근하면 404 반환\n- 포트폴리오 상세에서는 공개 + 발행 상태의 프로젝트만 노출\n- soft delete된 포트폴리오와 프로젝트는 조회 제외\n",
        "operationId": "getPortfolioBySlug",
        "parameters": [
          {
            "name": "slug",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "포트폴리오 조회 성공",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioDetailResponse"
                }
              }
            }
          },
          "404": {
            "description": "존재하지 않는 포트폴리오 또는 접근할 수 없는 비공개 포트폴리오",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponsePortfolioDetailResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/home": {
      "get": {
        "tags": [
          "Home"
        ],
        "summary": "메인 페이지 조회",
        "description": "메인 페이지에 표시할 주요 프로젝트, 인기 프로젝트, 최신 프로젝트 등의 정보를 조회합니다.",
        "operationId": "getHome",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseHomeResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/projects/files/{fileId}": {
      "delete": {
        "tags": [
          "Project File"
        ],
        "summary": "프로젝트 파일 삭제",
        "operationId": "deleteFile",
        "parameters": [
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ApiResponseVoid"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ProjectCreateRequest": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "maxLength": 255,
            "minLength": 0
          },
          "description": {
            "type": "string",
            "maxLength": 1000,
            "minLength": 0
          }
        },
        "required": [
          "title"
        ]
      },
      "ApiResponseProjectCreateResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/ProjectCreateResponse",
            "description": "응답 데이터"
          }
        }
      },
      "ProjectCreateResponse": {
        "type": "object",
        "properties": {
          "projectId": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "ApiResponseProjectReviewResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/ProjectReviewResponse",
            "description": "응답 데이터"
          }
        }
      },
      "ProjectReviewResponse": {
        "type": "object",
        "properties": {
          "totalScore": {
            "type": "integer",
            "format": "int32"
          },
          "summary": {
            "type": "string"
          },
          "categories": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReviewCategory"
            }
          },
          "criticalIssues": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReviewIssue"
            }
          },
          "warnings": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReviewIssue"
            }
          },
          "strengths": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReviewStrength"
            }
          },
          "interviewQuestions": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "refactoringSuggestions": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/RefactoringSuggestion"
            }
          }
        }
      },
      "RefactoringSuggestion": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "exampleCode": {
            "type": "string"
          }
        }
      },
      "ReviewCategory": {
        "type": "object",
        "properties": {
          "category": {
            "type": "string"
          },
          "score": {
            "type": "integer",
            "format": "int32"
          },
          "comment": {
            "type": "string"
          }
        }
      },
      "ReviewIssue": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "solution": {
            "type": "string"
          }
        }
      },
      "ReviewStrength": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          }
        }
      },
      "ProjectPublishRequest": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "maxLength": 255,
            "minLength": 0
          },
          "description": {
            "type": "string",
            "maxLength": 1000,
            "minLength": 0
          },
          "content": {
            "type": "string",
            "minLength": 1
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "maxItems": 10,
            "minItems": 0
          }
        },
        "required": [
          "content",
          "title"
        ]
      },
      "ApiResponseVoid": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "description": "응답 데이터"
          }
        }
      },
      "ApiResponseProjectFileUploadResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/ProjectFileUploadResponse",
            "description": "응답 데이터"
          }
        }
      },
      "ProjectFileUploadResponse": {
        "type": "object",
        "properties": {
          "fileId": {
            "type": "integer",
            "format": "int64"
          },
          "fileUrl": {
            "type": "string"
          }
        }
      },
      "ProfileCreateRequest": {
        "type": "object",
        "description": "프로필 생성 요청",
        "properties": {
          "nickname": {
            "type": "string",
            "description": "닉네임",
            "example": "길동이",
            "maxLength": 30,
            "minLength": 0
          },
          "bio": {
            "type": "string",
            "description": "자기소개",
            "example": "백엔드 개발자입니다.",
            "maxLength": 500,
            "minLength": 0
          }
        },
        "required": [
          "nickname"
        ]
      },
      "ApiResponseProfileCreateResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/ProfileCreateResponse",
            "description": "응답 데이터"
          }
        }
      },
      "ProfileCreateResponse": {
        "type": "object",
        "description": "프로필 생성 응답",
        "properties": {
          "profileId": {
            "type": "integer",
            "format": "int64",
            "description": "프로필 ID",
            "example": 1
          },
          "message": {
            "type": "string",
            "description": "응답 메시지",
            "example": "프로필 생성 완료"
          }
        }
      },
      "PortfolioCreateRequest": {
        "type": "object",
        "description": "포트폴리오 생성 요청",
        "properties": {
          "title": {
            "type": "string",
            "description": "포트폴리오 제목",
            "example": "공모전 포트폴리오",
            "maxLength": 100,
            "minLength": 0
          }
        },
        "required": [
          "title"
        ]
      },
      "ApiResponsePortfolioCreateResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/PortfolioCreateResponse",
            "description": "응답 데이터"
          }
        }
      },
      "PortfolioCreateResponse": {
        "type": "object",
        "description": "포트폴리오 생성 응답",
        "properties": {
          "portfolioId": {
            "type": "integer",
            "format": "int64",
            "description": "포트폴리오 ID",
            "example": 3
          },
          "slug": {
            "type": "string",
            "description": "포트폴리오 slug",
            "example": "contest-portfolio"
          }
        }
      },
      "LoginRequest": {
        "type": "object",
        "description": "Google OAuth 로그인 요청",
        "properties": {
          "idToken": {
            "type": "string",
            "description": "프론트에서 Google OAuth 로그인 후 받은 Google ID Token",
            "example": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
            "minLength": 1
          }
        },
        "required": [
          "idToken"
        ]
      },
      "ApiResponseLoginResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/LoginResponse",
            "description": "응답 데이터"
          }
        }
      },
      "LoginResponse": {
        "type": "object",
        "description": "로그인 응답",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int64",
            "description": "사용자 ID",
            "example": 1
          },
          "email": {
            "type": "string",
            "description": "사용자 이메일 (Google OAuth 계정 이메일)",
            "example": "user@gmail.com"
          },
          "universityVerified": {
            "type": "boolean",
            "description": "대학 인증 완료 여부 (ac.kr 인증)",
            "example": false
          }
        }
      },
      "EmailVerifyRequest": {
        "type": "object",
        "description": "학교 이메일 인증번호 검증 요청",
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "description": "인증번호를 받은 대학 이메일",
            "example": "user@korea.ac.kr",
            "minLength": 1
          },
          "code": {
            "type": "string",
            "description": "이메일로 발송된 6자리 인증번호",
            "example": 123456,
            "minLength": 1,
            "pattern": "^[0-9]{6}$"
          }
        },
        "required": [
          "code",
          "email"
        ]
      },
      "ApiResponseEmailAuthResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/EmailAuthResponse",
            "description": "응답 데이터"
          }
        }
      },
      "EmailAuthResponse": {
        "type": "object",
        "description": "이메일 인증 응답",
        "properties": {
          "message": {
            "type": "string",
            "description": "응답 메시지",
            "example": "인증번호가 발송되었습니다."
          }
        }
      },
      "EmailSendRequest": {
        "type": "object",
        "description": "학교 이메일 인증번호 발송 요청",
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "description": "인증번호를 발송할 대학 이메일",
            "example": "user@korea.ac.kr",
            "minLength": 1
          }
        },
        "required": [
          "email"
        ]
      },
      "ProjectUpdateRequest": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "maxLength": 255,
            "minLength": 0
          },
          "description": {
            "type": "string",
            "maxLength": 1000,
            "minLength": 0
          },
          "content": {
            "type": "string"
          },
          "thumbnail": {
            "type": "string"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "ApiResponseProjectUpdateResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/ProjectUpdateResponse",
            "description": "응답 데이터"
          }
        }
      },
      "ProjectUpdateResponse": {
        "type": "object",
        "properties": {
          "projectId": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "ProfileUpdateRequest": {
        "type": "object",
        "description": "프로필 수정 요청",
        "properties": {
          "name": {
            "type": "string",
            "description": "이름",
            "example": "홍길동",
            "maxLength": 30,
            "minLength": 0
          },
          "nickname": {
            "type": "string",
            "description": "닉네임",
            "example": "길동이",
            "maxLength": 30,
            "minLength": 0
          },
          "bio": {
            "type": "string",
            "description": "자기소개",
            "example": "백엔드 개발 및 AI 프로젝트를 진행합니다.",
            "maxLength": 500,
            "minLength": 0
          },
          "major": {
            "type": "string",
            "description": "전공",
            "example": "컴퓨터공학과",
            "maxLength": 50,
            "minLength": 0
          },
          "grade": {
            "type": "integer",
            "format": "int32",
            "description": "학년",
            "example": 4,
            "maximum": 6,
            "minimum": 1
          },
          "profileImage": {
            "type": "string",
            "description": "프로필 이미지 URL",
            "example": "https://s3.amazonaws.com/profile.png"
          }
        }
      },
      "ApiResponseProfileUpdateResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/ProfileUpdateResponse",
            "description": "응답 데이터"
          }
        }
      },
      "ProfileUpdateResponse": {
        "type": "object",
        "description": "프로필 수정 응답",
        "properties": {
          "userId": {
            "type": "integer",
            "format": "int64",
            "description": "사용자 ID",
            "example": 1
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "description": "수정 시각",
            "example": "2026-05-05T14:00:00"
          },
          "message": {
            "type": "string",
            "description": "응답 메시지",
            "example": "프로필 수정 완료"
          }
        }
      },
      "PortfolioUpdateRequest": {
        "type": "object",
        "description": "포트폴리오 정보 수정 요청",
        "properties": {
          "title": {
            "type": "string",
            "description": "포트폴리오 제목. null이면 기존 값 유지",
            "example": "수정된 공모전 포트폴리오",
            "maxLength": 100,
            "minLength": 0
          },
          "description": {
            "type": "string",
            "description": "포트폴리오 설명. null이면 기존 값 유지",
            "example": "공모전 프로젝트들을 모아둔 포트폴리오입니다.",
            "maxLength": 500,
            "minLength": 0
          },
          "thumbnailUrl": {
            "type": "string",
            "description": "포트폴리오 썸네일 URL. null이면 기존 값 유지",
            "example": "https://s3.amazonaws.com/portfolio-thumbnail.png",
            "maxLength": 500,
            "minLength": 0
          }
        }
      },
      "ApiResponsePortfolioUpdateResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/PortfolioUpdateResponse",
            "description": "응답 데이터"
          }
        }
      },
      "PortfolioUpdateResponse": {
        "type": "object",
        "description": "포트폴리오 정보 수정 응답",
        "properties": {
          "portfolioId": {
            "type": "integer",
            "format": "int64",
            "description": "포트폴리오 ID",
            "example": 1
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "description": "수정일",
            "example": "2026-05-31T17:30:00"
          },
          "message": {
            "type": "string",
            "description": "응답 메시지",
            "example": "포트폴리오 수정 완료"
          }
        }
      },
      "PortfolioVisibilityUpdateRequest": {
        "type": "object",
        "description": "포트폴리오 공개 여부 변경 요청",
        "properties": {
          "isPublic": {
            "type": "boolean",
            "description": "공개 여부",
            "example": true
          }
        },
        "required": [
          "isPublic"
        ]
      },
      "ApiResponsePortfolioVisibilityUpdateResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/PortfolioVisibilityUpdateResponse",
            "description": "응답 데이터"
          }
        }
      },
      "PortfolioVisibilityUpdateResponse": {
        "type": "object",
        "description": "포트폴리오 공개 여부 변경 응답",
        "properties": {
          "portfolioId": {
            "type": "integer",
            "format": "int64",
            "description": "포트폴리오 ID",
            "example": 1
          },
          "isPublic": {
            "type": "boolean",
            "description": "공개 여부",
            "example": true
          },
          "message": {
            "type": "string",
            "description": "응답 메시지",
            "example": "포트폴리오 공개 상태 변경 완료"
          }
        }
      },
      "PortfolioProjectUpdateRequest": {
        "type": "object",
        "description": "포트폴리오 프로젝트 추가/제거 요청",
        "properties": {
          "add": {
            "type": "array",
            "description": "추가할 프로젝트 ID 목록",
            "example": [1, 2],
            "items": {
              "type": "integer",
              "format": "int64"
            }
          },
          "remove": {
            "type": "array",
            "description": "제거할 프로젝트 ID 목록",
            "example": [3],
            "items": {
              "type": "integer",
              "format": "int64"
            }
          }
        }
      },
      "ApiResponsePortfolioProjectUpdateResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/PortfolioProjectUpdateResponse",
            "description": "응답 데이터"
          }
        }
      },
      "PortfolioProjectUpdateResponse": {
        "type": "object",
        "description": "포트폴리오 프로젝트 추가/제거 응답",
        "properties": {
          "message": {
            "type": "string",
            "description": "응답 메시지",
            "example": "포트폴리오 프로젝트 수정 완료"
          }
        }
      },
      "PortfolioOrderUpdateRequest": {
        "type": "object",
        "description": "포트폴리오 프로젝트 순서 변경 요청",
        "properties": {
          "projectOrder": {
            "type": "array",
            "description": "변경할 프로젝트 ID 순서",
            "example": [2, 1, 3],
            "items": {
              "type": "integer",
              "format": "int64"
            },
            "minItems": 1
          }
        },
        "required": [
          "projectOrder"
        ]
      },
      "ApiResponsePortfolioOrderUpdateResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/PortfolioOrderUpdateResponse",
            "description": "응답 데이터"
          }
        }
      },
      "PortfolioOrderUpdateResponse": {
        "type": "object",
        "description": "포트폴리오 프로젝트 순서 변경 응답",
        "properties": {
          "message": {
            "type": "string",
            "description": "응답 메시지",
            "example": "프로젝트 순서 변경 완료"
          }
        }
      },
      "ApiResponseUserMeResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/UserMeResponse",
            "description": "응답 데이터"
          }
        }
      },
      "UserMeResponse": {
        "type": "object",
        "description": "내 사용자 정보 응답",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int64",
            "description": "사용자 ID",
            "example": 1
          },
          "email": {
            "type": "string",
            "description": "구글 계정 이메일",
            "example": "user@gmail.com"
          },
          "universityVerified": {
            "type": "boolean",
            "description": "대학 인증 완료 여부",
            "example": true
          }
        }
      },
      "ApiResponseListMyProjectResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "type": "array",
            "description": "응답 데이터",
            "items": {
              "$ref": "#/components/schemas/MyProjectResponse"
            }
          }
        }
      },
      "MyProjectResponse": {
        "type": "object",
        "properties": {
          "projectId": {
            "type": "integer",
            "format": "int64"
          },
          "title": {
            "type": "string"
          },
          "thumbnail": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "DRAFT",
              "PUBLISHED"
            ]
          },
          "role": {
            "type": "string",
            "enum": [
              "OWNER",
              "MEMBER"
            ]
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ApiResponseMyPortfolioListResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/MyPortfolioListResponse",
            "description": "응답 데이터"
          }
        }
      },
      "MyPortfolioListResponse": {
        "type": "object",
        "description": "내 포트폴리오 목록 조회 응답",
        "properties": {
          "content": {
            "type": "array",
            "description": "포트폴리오 목록",
            "items": {
              "$ref": "#/components/schemas/MyPortfolioResponse"
            }
          },
          "page": {
            "type": "integer",
            "format": "int32",
            "description": "현재 페이지",
            "example": 0
          },
          "size": {
            "type": "integer",
            "format": "int32",
            "description": "페이지 크기",
            "example": 6
          },
          "totalElements": {
            "type": "integer",
            "format": "int64",
            "description": "전체 데이터 수",
            "example": 10
          },
          "totalPages": {
            "type": "integer",
            "format": "int32",
            "description": "전체 페이지 수",
            "example": 2
          }
        }
      },
      "MyPortfolioResponse": {
        "type": "object",
        "description": "내 포트폴리오 목록 항목 응답",
        "properties": {
          "portfolioId": {
            "type": "integer",
            "format": "int64",
            "description": "포트폴리오 ID",
            "example": 1
          },
          "title": {
            "type": "string",
            "description": "포트폴리오 제목",
            "example": "AI 프로젝트 모음"
          },
          "slug": {
            "type": "string",
            "description": "포트폴리오 slug",
            "example": "ai-projects"
          },
          "description": {
            "type": "string",
            "description": "포트폴리오 설명",
            "example": "AI 관련 프로젝트"
          },
          "thumbnailUrl": {
            "type": "string",
            "description": "썸네일 URL",
            "example": "https://s3.amazonaws.com/xxx.png"
          },
          "isPublic": {
            "type": "boolean",
            "description": "공개 여부",
            "example": false
          },
          "projectCount": {
            "type": "integer",
            "format": "int64",
            "description": "포함된 프로젝트 수",
            "example": 5
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "description": "생성일"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "description": "수정일"
          }
        }
      },
      "ApiResponseProjectSearchPageResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/ProjectSearchPageResponse",
            "description": "응답 데이터"
          }
        }
      },
      "ProjectSearchPageResponse": {
        "type": "object",
        "properties": {
          "content": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ProjectSearchResponse"
            }
          },
          "page": {
            "type": "integer",
            "format": "int32"
          },
          "size": {
            "type": "integer",
            "format": "int32"
          },
          "totalElements": {
            "type": "integer",
            "format": "int64"
          },
          "totalPages": {
            "type": "integer",
            "format": "int32"
          }
        }
      },
      "ProjectSearchResponse": {
        "type": "object",
        "properties": {
          "projectId": {
            "type": "integer",
            "format": "int64"
          },
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "thumbnailUrl": {
            "type": "string"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "users": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ProjectUserResponse"
            }
          },
          "viewCount": {
            "type": "integer",
            "format": "int32"
          },
          "likeCount": {
            "type": "integer",
            "format": "int64"
          },
          "isLiked": {
            "type": "boolean"
          }
        }
      },
      "ProjectUserResponse": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "integer",
            "format": "int64"
          },
          "name": {
            "type": "string"
          },
          "role": {
            "type": "string",
            "enum": [
              "OWNER",
              "MEMBER"
            ]
          }
        }
      },
      "ApiResponseProjectDetailResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/ProjectDetailResponse",
            "description": "응답 데이터"
          }
        }
      },
      "ProjectDetailFileResponse": {
        "type": "object",
        "properties": {
          "fileId": {
            "type": "integer",
            "format": "int64"
          },
          "originalName": {
            "type": "string"
          },
          "fileUrl": {
            "type": "string"
          }
        }
      },
      "ProjectDetailResponse": {
        "type": "object",
        "properties": {
          "projectId": {
            "type": "integer",
            "format": "int64"
          },
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "content": {
            "type": "string"
          },
          "thumbnailUrl": {
            "type": "string"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "users": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ProjectDetailUserResponse"
            }
          },
          "files": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ProjectDetailFileResponse"
            }
          },
          "viewCount": {
            "type": "integer",
            "format": "int32"
          },
          "likeCount": {
            "type": "integer",
            "format": "int64"
          },
          "isLiked": {
            "type": "boolean"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ProjectDetailUserResponse": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "integer",
            "format": "int64"
          },
          "name": {
            "type": "string"
          },
          "role": {
            "type": "string",
            "enum": [
              "OWNER",
              "MEMBER"
            ]
          }
        }
      },
      "ApiResponseListProjectFileResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "type": "array",
            "description": "응답 데이터",
            "items": {
              "$ref": "#/components/schemas/ProjectFileResponse"
            }
          }
        }
      },
      "ProjectFileResponse": {
        "type": "object",
        "properties": {
          "fileId": {
            "type": "integer",
            "format": "int64"
          },
          "originalName": {
            "type": "string"
          },
          "fileUrl": {
            "type": "string"
          },
          "contentType": {
            "type": "string"
          },
          "fileSize": {
            "type": "integer",
            "format": "int64"
          }
        }
      },
      "ApiResponseProfileResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/ProfileResponse",
            "description": "응답 데이터"
          }
        }
      },
      "ProfileResponse": {
        "type": "object",
        "description": "프로필 조회 응답",
        "properties": {
          "profileId": {
            "type": "integer",
            "format": "int64",
            "description": "프로필 ID",
            "example": 1
          },
          "userId": {
            "type": "integer",
            "format": "int64",
            "description": "사용자 ID",
            "example": 1
          },
          "name": {
            "type": "string",
            "description": "이름",
            "example": "홍길동"
          },
          "nickname": {
            "type": "string",
            "description": "닉네임",
            "example": "길동이"
          },
          "bio": {
            "type": "string",
            "description": "자기소개",
            "example": "백엔드 개발 및 AI 프로젝트를 진행합니다."
          },
          "major": {
            "type": "string",
            "description": "전공",
            "example": "컴퓨터공학과"
          },
          "grade": {
            "type": "integer",
            "format": "int32",
            "description": "학년",
            "example": 4
          },
          "profileImage": {
            "type": "string",
            "description": "프로필 이미지 URL",
            "example": "https://s3.amazonaws.com/profile.png"
          }
        }
      },
      "ApiResponsePortfolioDetailResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/PortfolioDetailResponse",
            "description": "응답 데이터"
          }
        }
      },
      "PortfolioDetailProjectResponse": {
        "type": "object",
        "description": "포트폴리오 상세 프로젝트 항목 응답",
        "properties": {
          "projectId": {
            "type": "integer",
            "format": "int64",
            "description": "프로젝트 ID",
            "example": 1
          },
          "title": {
            "type": "string",
            "description": "프로젝트 제목",
            "example": "AI 추천 시스템"
          },
          "description": {
            "type": "string",
            "description": "프로젝트 설명",
            "example": "사용자 행동 기반 추천"
          },
          "thumbnailUrl": {
            "type": "string",
            "description": "썸네일 URL",
            "example": "https://s3.amazonaws.com/project.png"
          },
          "displayOrder": {
            "type": "integer",
            "format": "int32",
            "description": "정렬 순서",
            "example": 0
          }
        }
      },
      "PortfolioDetailResponse": {
        "type": "object",
        "description": "포트폴리오 상세 조회 응답",
        "properties": {
          "portfolioId": {
            "type": "integer",
            "format": "int64",
            "description": "포트폴리오 ID",
            "example": 1
          },
          "title": {
            "type": "string",
            "description": "포트폴리오 제목",
            "example": "팀 포트폴리오"
          },
          "slug": {
            "type": "string",
            "description": "포트폴리오 slug",
            "example": "team-portfolio"
          },
          "description": {
            "type": "string",
            "description": "포트폴리오 설명",
            "example": "팀 프로젝트 모음"
          },
          "thumbnailUrl": {
            "type": "string",
            "description": "썸네일 URL",
            "example": "https://s3.amazonaws.com/portfolio.png"
          },
          "isPublic": {
            "type": "boolean",
            "description": "공개 여부",
            "example": true
          },
          "projects": {
            "type": "array",
            "description": "포트폴리오에 포함된 프로젝트 목록",
            "items": {
              "$ref": "#/components/schemas/PortfolioDetailProjectResponse"
            }
          }
        }
      },
      "ApiResponseHomeResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/HomeResponse",
            "description": "응답 데이터"
          }
        }
      },
      "HomeCategoryResponse": {
        "type": "object",
        "properties": {
          "tag": {
            "type": "string"
          },
          "projects": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/HomeProjectResponse"
            }
          }
        }
      },
      "HomeProjectResponse": {
        "type": "object",
        "properties": {
          "projectId": {
            "type": "integer",
            "format": "int64"
          },
          "title": {
            "type": "string"
          },
          "thumbnailUrl": {
            "type": "string"
          },
          "tag": {
            "type": "string"
          },
          "authorName": {
            "type": "string"
          },
          "likeCount": {
            "type": "integer",
            "format": "int64"
          },
          "viewCount": {
            "type": "integer",
            "format": "int32"
          }
        }
      },
      "HomeResponse": {
        "type": "object",
        "properties": {
          "popularProjects": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/HomeProjectResponse"
            }
          },
          "categories": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/HomeCategoryResponse"
            }
          }
        }
      },
      "ApiResponsePortfolioDeleteResponse": {
        "type": "object",
        "description": "공통 API 응답 형식",
        "properties": {
          "success": {
            "type": "boolean",
            "description": "요청 성공 여부",
            "example": true
          },
          "data": {
            "$ref": "#/components/schemas/PortfolioDeleteResponse",
            "description": "응답 데이터"
          }
        }
      },
      "PortfolioDeleteResponse": {
        "type": "object",
        "description": "포트폴리오 삭제 응답",
        "properties": {
          "message": {
            "type": "string",
            "description": "응답 메시지",
            "example": "포트폴리오 삭제 완료"
          }
        }
      }
    }
  }
}