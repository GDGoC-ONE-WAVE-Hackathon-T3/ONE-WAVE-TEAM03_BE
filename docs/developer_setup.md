# 개발자 설정 가이드 (Developer Setup Guide)

이 문서는 **코드 리뷰 트레이닝 플랫폼** 기능을 로컬 또는 운영 환경에서 설정하기 위한 메뉴얼입니다.
GitHub App을 생성하고 `.pem` 키를 사용하는 방식을 기준으로 설명합니다.

## 1. 환경 변수 (Environment Variables)

`.env` 파일에 다음 키들이 설정되어 있어야 합니다:

```bash
# GitHub App 설정
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpV...\n-----END RSA PRIVATE KEY-----"
GITHUB_INSTALLATION_ID= 
# 참고: 현재 코드베이스가 GITHUB_TOKEN(PAT)만 지원한다면, 
# GitHub App에서 발급받은 Installation Token을 임시로 GITHUB_TOKEN에 넣거나
# 코드를 GitHub App 인증 방식으로 업데이트해야 합니다.

# GitHub 레거시 토큰 (기존 방식 사용 시)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx

# AI 설정 (Gemini 사용 필수)
GEMINI_API_KEY=AIzaSy...           # Google Gemini API Key 필수
```

## 2. Gemini API 키 발급 방법

이 프로젝트는 이제 **Google Gemini Pro** 모델을 사용하여 AI 코드 리뷰를 수행합니다.

1.  **Google AI Studio 접속**: [https://aistudio.google.com/](https://aistudio.google.com/)
2.  **API Key 생성**:
    *   화면 좌측 상단 `Get API key` 클릭.
    *   `Create API key` 버튼 클릭.
    *   새 프로젝트에서 생성하거나 기존 Google Cloud 프로젝트를 연결하여 키를 발급받습니다.
3.  **환경 변수 설정**:
    *   발급받은 키를 `.env` 파일의 `GEMINI_API_KEY` 값으로 설정합니다.

## 3. GitHub App 생성 및 설정

Pull Request 이벤트를 수신하고 코멘트를 달기 위해 GitHub App을 생성해야 합니다.

1.  **GitHub App 생성**:
    *   GitHub 프로필 > `Settings` > `Developer settings` > `GitHub Apps` > `New GitHub App`.
    *   **GitHub App Name**: 원하는 이름 (예: `Review-Training-Bot`).
    *   **Homepage URL**: 로컬 개발 시 아무 URL이나 입력 (예: `http://localhost`).
    *   **Webhook**: `Active` 체크.
    *   **Webhook URL**:
        *   **로컬 개발**: `ngrok` 등을 사용하여 로컬 포트를 외부로 노출.
            *   예: `https://abcd-1234.ngrok-free.app/webhook/github-events`
        *   **운영**: 배포된 도메인 URL.
    *   **Webhook Secret**: (선택 사항) 서명 검증을 위해 설정을 권장합니다.

2.  **권한 설정 (Permissions)**:
    *   `Repository permissions` 탭으로 이동.
    *   **Pull Requests**: `Access: Read and write`. (PR 내용을 읽고 코멘트를 달기 위함)
    *   **Metadata**: `Access: Read-only`. (기본값)

3.  **이벤트 구독 (Subscribe to events)**:
    *   `Pull request` 이벤트를 체크합니다.

4.  **Private Key 생성**:
    *   앱 생성 완료 후, `General` 탭 하단 `Private keys`에서 `Generate a private key` 클릭.
    *   `.pem` 파일이 다운로드됩니다. 이 파일의 내용을 환경 변수나 키 파일로 관리합니다.

5.  **App 설치 (Install App)**:
    *   좌측 메뉴 `Install App` 클릭.
    *   봇을 적용할 저장소(Repository) 또는 조직(Organization)을 선택하여 `Install` 클릭.

## 4. 데이터베이스 설정 (Mission 생성)

시스템이 어떤 저장소를 트래킹하고 "정답(Mission)"이 무엇인지 알기 위해 DB 데이터가 필요합니다.

SQL 등을 사용하여 `Mission` 데이터를 삽입하세요.

**SQL 예시:**

```sql
INSERT INTO mission (repoName, title, description, solutionDiff)
VALUES (
  'your-username/nestjs-challenge-1', -- GitHub App이 설치된 저장소 이름 (owner/repo)
  '유저 서비스 수정하기',
  'User Service의 find 로직 버그를 수정하세요.',
  'diff --git a/src/users.service.ts b/src/users.service.ts
index 83a69f..b29c11 100644
--- a/src/users.service.ts
+++ b/src/users.service.ts
@@ -10,7 +10,7 @@
-    return this.users.find(u => u.id == id);
+    return this.users.find(u => u.id === id);'
);
```

## 5. 테스트 흐름 (Testing)

1.  **서버 실행**: `npm run start:dev`
2.  **PR 생성**: 설정한 저장소에서 새로운 Pull Request를 생성합니다.
3.  **로그 확인**: 백엔드 로그에서 `Received GitHub event: pull_request` 메시지 확인.
4.  **피드백 확인**: 잠시 후 봇이 해당 PR에 코멘트를 남기는지 확인합니다.
