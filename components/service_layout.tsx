// 전체적인 구조를 담당(페이지 구조를 담당)
import Head from 'next/head';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const ServiceLayout = function ({ title = 'Excuse ME', children }: Props) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      {children}
    </div>
  );
};
