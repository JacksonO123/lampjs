import { VercelRequest, VercelResponse } from '@vercel/node';

const test = (_req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({
    working: true
  });
};

export default test;
