const { categoryId, childId } = req.query;

const events = await prisma.event.findMany({
  where: {
    calendarId: req.user.parentalAccountId, // ya validado por middleware
    ...(categoryId ? { categoryId } : {}),
    ...(childId ? { childId } : {}),
  },
  include: { category: true, child: true },
});
