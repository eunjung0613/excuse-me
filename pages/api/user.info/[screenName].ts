// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import memberCtrl from '@/controllers/member.ctr';
import handleError from '@/controllers/error/handle_error';
import checkSupportMethod from '@/controllers/error/check_supprot_methods';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportMethod = ['GET'];
  try {
    checkSupportMethod(supportMethod, method);
    await memberCtrl.fundByScreenName(req, res);
  } catch (err) {
    console.error(err);
    //에러 처리
    handleError(err, res);
  }
}
