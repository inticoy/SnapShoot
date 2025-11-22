import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SnapShoot · 이용약관',
  description: 'SnapShoot 서비스 이용약관'
};

const sections = [
  {
    heading: '1. 서비스 이용',
    body: 'SnapShoot은 무료 웹 기반 게임이며, 게임을 이용함으로써 본 약관에 동의하는 것으로 간주됩니다.'
  },
  {
    heading: '2. 사용자 책임',
    body: '사용자는 합법적이고 윤리적인 방식으로 게임을 이용해야 하며, 부정 조작이나 타인에게 피해를 주는 행위는 금지됩니다.'
  },
  {
    heading: '3. 지적 재산권',
    body: 'SnapShoot의 모든 콘텐츠, 디자인, 코드는 저작권법의 보호를 받으며 무단 복제·배포·수정은 금지됩니다.'
  },
  {
    heading: '4. 면책 조항',
    body: '본 게임은 “있는 그대로” 제공되며, 이용 중 발생하는 손해에 대해 개발자는 책임지지 않습니다.'
  },
  {
    heading: '5. 약관 변경',
    body: '약관은 사전 고지 없이 변경될 수 있으며, 변경 사항은 게시 즉시 효력이 발생합니다.'
  },
  {
    heading: '6. 문의',
    body: '약관 관련 문의는 GitHub Issues를 통해 접수해 주세요.'
  }
];

export default function TermsPage() {
  return (
    <main className="policy-shell">
      <h1>SnapShoot 이용약관</h1>
      <p className="policy-updated">최종 수정일: 2025년 11월 14일</p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </main>
  );
}
