import type { NextApiRequest, NextApiResponse } from 'next';

import { CommentSubmissionTemplate } from '@/components/emails/commentSubmissionTemplate';
import { prisma } from '@/prisma';
import { getUnsubEmails } from '@/utils/airtable';
import resendMail from '@/utils/resend';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, submissionId } = req.body;
  try {
    const unsubscribedEmails = await getUnsubEmails();
    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },
      include: {
        user: true,
        listing: true,
      },
    });
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (
      submission &&
      !unsubscribedEmails.includes(submission.user.email as string)
    ) {
      await resendMail.emails.send({
        from: `Kash from Superteam <${process.env.RESEND_EMAIL}>`,
        to: [submission?.user.email as string],
        subject: 'Comment Received on Your Superteam Earn Submission',
        react: CommentSubmissionTemplate({
          name: submission?.user.firstName as string,
          bountyName: submission?.listing.title as string,
          personName: user?.firstName as string,
          link: `https://earn.superteam.fun/listings/bounties/${submission?.listing.slug}/submission/${submission?.id}/?utm_source=superteamearn&utm_medium=email&utm_campaign=notifications`,
        }),
      });
    }

    return res.status(200).json({ message: 'Ok' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
