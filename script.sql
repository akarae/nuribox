-- =====================================================================
-- 누리도시락 주문관리 시스템 DDL (최종본)
-- MySQL 8.0 / utf8mb4
--
-- 반영된 협의 사항
--   1) 요일별 컬럼(월요일식단 …) → 로우(row) 구조로 변경 (통계 집계 용이)
--   2) PK를 자연키 복합키 대신 surrogate key(AUTO_INCREMENT) + UNIQUE 제약으로 변경
--   3) 비밀번호는 평문 저장 금지 → bcrypt 해시 저장 (VARCHAR(255)로 해시 저장 공간 확보,
--      실제 해시 처리는 애플리케이션 레이어(bcrypt)에서 수행)
--   4) tb_order는 menu_date(DATE)만 보유, 연/월/주/요일은 조회 시 DATE 함수로 산출
--      (예: YEAR(menu_date), MONTH(menu_date), DAYOFWEEK(menu_date))
--   5) tb_user.role 부활 + company_id를 NULL 허용으로 변경
--      → role='admin' + company_id NULL  : 누리도시락 내부 관리자 계정
--      → role='company' + company_id 지정 : 업체 담당자 계정 (업체당 1개, UNIQUE 제약)
--   6) 단가관리(tb_price)는 보류 — 현재 전업체 동일 단가라 tb_settlement.apply_price에
--      정산 시점 값을 직접 입력. 추후 업체별 단가가 생기면 별도 테이블로 분리 예정.
--   7) weekday / meal_type 값은 공통코드(tb_code)로 관리
--      → group_code = 'WEEKDAY' (월/화/수/목/금), group_code = 'MEAL_TYPE' (조식/중식/석식)
--      → DB 레벨 ENUM 강제 대신 애플리케이션에서 tb_code 조회값으로 드롭다운 구성
--   8) 업체 삭제는 물리삭제 대신 tb_company.status 값으로 논리삭제 처리 예정
--      (CASCADE는 그대로 두되, 실제 운영에서는 status 변경만 사용)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS nuri_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE nuri_db;

-- ---------------------------------------------------------------------
-- 1. 업체정보
-- ---------------------------------------------------------------------
CREATE TABLE tb_company (
  company_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_code    VARCHAR(20)     NOT NULL COMMENT '업체코드 (화면 표시/외부 노출용)',
  company_name    VARCHAR(100)    NOT NULL COMMENT '업체명',
  business_type   VARCHAR(100)             COMMENT '업종',
  manager_name    VARCHAR(50)              COMMENT '담당자',
  phone           VARCHAR(20)              COMMENT '전화번호',
  address         VARCHAR(200)             COMMENT '주소',
  payment_day     TINYINT UNSIGNED         COMMENT '결제일 (1~31)',
  status          VARCHAR(30)     NOT NULL COMMENT '거래상태 (거래중/거래중지/삭제 등 - 논리삭제도 이 값으로 처리)',
  note            TEXT                     COMMENT '비고',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_company_code (company_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='업체정보';

-- ---------------------------------------------------------------------
-- 2. 사용자정보 (업체별 대표 계정 1개 + 내부 관리자 계정)
-- ---------------------------------------------------------------------
CREATE TABLE tb_user (
  user_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  login_id        VARCHAR(50)     NOT NULL COMMENT '로그인 아이디',
  password        VARCHAR(255)    NOT NULL COMMENT 'bcrypt 해시 (평문 저장 금지)',
  role            VARCHAR(20)     NOT NULL DEFAULT 'company' COMMENT 'admin(누리도시락 운영자) / company(업체 담당자)',
  company_id      BIGINT UNSIGNED          COMMENT '소속 업체 (admin 계정은 NULL)',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_company (company_id),        -- 업체당 계정 1개 제약 (NULL은 여러 개 허용되어 admin 다중 생성 가능)
  CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES tb_company (company_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='사용자정보(로그인 계정)';

-- ---------------------------------------------------------------------
-- 3. 식단정보 (전업체 동일 식단, 요일별 로우, 메뉴는 자유 텍스트)
-- ---------------------------------------------------------------------
CREATE TABLE tb_menu (
  menu_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  menu_date       DATE            NOT NULL COMMENT '실제 날짜 (정산/통계 기준)',
  menu_year       SMALLINT UNSIGNED NOT NULL COMMENT '연도 (화면 표시용)',
  menu_month      TINYINT UNSIGNED  NOT NULL COMMENT '월 (화면 표시용)',
  menu_week       TINYINT UNSIGNED  NOT NULL COMMENT '주차 (화면 표시용)',
  weekday         VARCHAR(30)     NOT NULL COMMENT '공통코드 tb_code(group_code=WEEKDAY) 참조값',
  meal_type       VARCHAR(30)     NOT NULL COMMENT '공통코드 tb_code(group_code=MEAL_TYPE) 참조값',
  menu_text       TEXT            NOT NULL COMMENT '자유 입력 메뉴 (여러 줄 텍스트)',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_menu_date_meal (menu_date, meal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='식단정보';

-- ---------------------------------------------------------------------
-- 4. 식수정보 (업체별 일자별 식수 신청)
--    연/월/주/요일은 menu_date로부터 조회 시점에 산출 (중복 저장 제거)
-- ---------------------------------------------------------------------
CREATE TABLE tb_order (
  order_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL,
  menu_date       DATE            NOT NULL COMMENT '실제 날짜 (정산/통계 기준)',
  meal_type       VARCHAR(30)     NOT NULL COMMENT '공통코드 tb_code(group_code=MEAL_TYPE) 참조값',
  order_count     INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '식수 신청 수량',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_order_company_date_meal (company_id, menu_date, meal_type),
  CONSTRAINT fk_order_company FOREIGN KEY (company_id) REFERENCES tb_company (company_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='식수정보';

-- ---------------------------------------------------------------------
-- 5. 월간 정산 (식수 x 단가 집계, 입금여부 관리)
--    단가는 현재 전업체 동일 단가라 정산 시점에 apply_price로 직접 입력
--    (추후 업체별 단가 도입 시 tb_price 테이블 분리 예정)
-- ---------------------------------------------------------------------
CREATE TABLE tb_settlement (
  settlement_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id        BIGINT UNSIGNED NOT NULL,
  settlement_year   SMALLINT UNSIGNED NOT NULL,
  settlement_month  TINYINT UNSIGNED  NOT NULL,
  total_count       INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '해당 월 총 식수',
  apply_price       INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '적용단가 (원)',
  total_amount      INT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '청구금액 (원)',
  paid_yn           CHAR(1)         NOT NULL DEFAULT 'N' COMMENT 'Y/N',
  paid_at           DATETIME                 COMMENT '입금 확인 일시',
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_settlement_company_month (company_id, settlement_year, settlement_month),
  CONSTRAINT fk_settlement_company FOREIGN KEY (company_id) REFERENCES tb_company (company_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='월간 정산';

-- ---------------------------------------------------------------------
-- 6. 공통코드 (업종, 거래상태, 요일, 식사구분 등)
-- ---------------------------------------------------------------------
CREATE TABLE tb_code (
  code_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_code    VARCHAR(30)   NOT NULL COMMENT '코드 그룹 (예: WEEKDAY, MEAL_TYPE, BUSINESS_TYPE, COMPANY_STATUS)',
  code_value    VARCHAR(30)   NOT NULL COMMENT '코드 값',
  code_name     VARCHAR(100)  NOT NULL COMMENT '코드명 (화면 표시)',
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_code_group_value (group_code, code_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='공통코드';
