# 누리도시락 주문관리 시스템 (nuri_system)

## 개요
누리식당(누리도시락)이 복수 병원을 대상으로 도시락을 공급하는 B2B 주문관리 시스템.
주간 식단 관리, 업체별(병원별) 식수 신청/관리, 월간 정산까지 지원.

## 기술 스택
- Backend  : Node.js + Express
- Frontend : React (union_system과 동일하게 JS 기반, 필요 시 TS 혼용)
- DB       : MySQL 8.0
- 배포     : 카페24 이지업(Rocky Linux 9) + Docker + GitHub Actions
- 인증     : JWT (Access Token 2h + Refresh Token 7d)
- 로그     : Winston (winston-daily-rotate-file)

## union_system과의 차이점
- DB: MySQL 5.7 → 8.0 (x86-64-v2 지원 서버 확인 후 진행)
- 배포 트리거: push마다 자동배포 대신, 수동으로 수정사항을 모아 금요일에 push하는 방식 채택
- 식단/식수 데이터: 항목별 정규화 대신 "요일별 로우 + 자유 text" 타협안으로 설계 (사용자 자유도 우선)

## 화면 구성
1. 업체관리   : 업체정보 CRUD + 사용자 계정 발급/관리
2. 식단관리   : 주간 식단 등록/수정 (요일별 자유 텍스트)
3. 식수신청   : 업체 담당자용 - 요일별 식수 수량 입력
4. 식수관리   : 관리자용 - 전체 업체 식수 현황 파악
5. 통계관리   : 월별/일자별/요일별 통계
6. 정산관리   : 단가 등록 + 월간 정산(청구금액 확정) + 입금 확인
