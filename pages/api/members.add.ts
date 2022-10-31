// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import memberCtrl from '@/controllers/member.ctr';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportMethod = ['POST'];
  try {
    if (supportMethod.indexOf(method!) === -1) {
      //에러 반환
    }
    await memberCtrl.add(req, res);
  } catch (err) {
    console.error(err);
    //에러 처리
  }
}
