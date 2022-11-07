/* eslint-disable react/jsx-props-no-spreading */
// 전체적인 구조를 담당(페이지 구조를 담당)
import { Box, BoxProps } from '@chakra-ui/react';
import Head from 'next/head';
import GNB from './GNB';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const ServiceLayout: React.FC<Props & BoxProps> = function ({ title = 'Excuse ME', children, ...boxProps }) {
  return (
    <Box {...boxProps}>
      <Head>
        <title>{title}</title>
      </Head>
      <GNB />
      {children}
    </Box>
  );
};
