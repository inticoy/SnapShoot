import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SnapShoot · 개인정보처리방침',
  description: 'SnapShoot 개인정보처리방침'
};

export default function PrivacyPage() {
  return (
    <main className="policy-shell">
      <h1>SnapShoot 개인정보처리방침</h1>
      <p className="policy-updated">최종 수정일: 2025년 11월 14일</p>

      <section>
        <h2>1. 수집하는 정보</h2>
        <p>
          <strong>SnapShoot은 어떠한 개인정보도 수집하지 않습니다.</strong>
        </p>
        <ul>
          <li>회원가입 불필요</li>
          <li>로그인 정보 미수집</li>
          <li>이메일 주소 미수집</li>
          <li>결제 정보 미수집</li>
        </ul>
      </section>

      <section>
        <h2>2. 게임 데이터</h2>
        <p>게임 기록은 브라우저 로컬 스토리지에만 저장되며 외부 서버로 전송되지 않습니다.</p>
      </section>

      <section>
        <h2>3. 쿠키 및 추적 기술</h2>
        <p>광고 추적, 분석 도구, 쿠키를 사용하지 않습니다.</p>
      </section>

      <section>
        <h2>4. 제3자 공유</h2>
        <p>수집하는 정보가 없으므로 제3자와 공유되는 데이터도 없습니다.</p>
      </section>

      <section>
        <h2>5. 데이터 보안</h2>
        <p>게임 데이터는 사용자 기기에만 저장되며, 브라우저 데이터를 삭제하면 모든 기록이 삭제됩니다.</p>
      </section>

      <section>
        <h2>6. 어린이 개인정보</h2>
        <p>모든 연령대가 이용 가능하며 개인정보를 수집하지 않아 별도 규정이 필요하지 않습니다.</p>
      </section>

      <section>
        <h2>7. 개인정보처리방침 변경</h2>
        <p>필요 시 본 방침을 업데이트하며, 변경 사항은 본 페이지에 게시됩니다.</p>
      </section>

      <section>
        <h2>8. 문의</h2>
        <p>문의 사항은 GitHub Issues를 통해 연락해 주세요.</p>
      </section>
    </main>
  );
}
