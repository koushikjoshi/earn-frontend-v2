import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/prisma';

export default async function getAllUsers(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { ...req.body },
      include: {
        Submission: { include: { listing: { include: { sponsor: true } } } },
        PoW: true,
      },
    });

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: `Unable to fetch users: ${error.message}` });
  }
}
