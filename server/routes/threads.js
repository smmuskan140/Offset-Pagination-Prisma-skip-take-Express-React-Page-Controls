import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

const PAGE_SIZE = 10;

router.get("/", async (req, res, next) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;
    const skip = (page - 1) * PAGE_SIZE;

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.thread.count(),
    ]);

    res.json({
      threads,
      total,
      hasMore: skip + threads.length < total,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
