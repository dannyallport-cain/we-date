
import { prisma } from '@/lib/prisma'

export const FREE_LIKES_LIMIT = 20;

export async function checkDailySwipeLimit(userId: string): Promise<{ 
  allowed: boolean; 
  remaining: number; 
  limit: number; 
  isPremium: boolean 
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true }
  })

  if (!user) return { allowed: false, remaining: 0, limit: 0, isPremium: false };

  if (user.isPremium) {
    return { allowed: true, remaining: 9999, limit: -1, isPremium: true }
  }

  // Count likes from today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const swipeCount = await prisma.swipe.count({
    where: {
      userId,
      action: { in: ['LIKE', 'SUPER_LIKE'] },
      createdAt: { gte: today }
    }
  })

  const remaining = Math.max(0, FREE_LIKES_LIMIT - swipeCount)
  
  return {
    allowed: remaining > 0,
    remaining,
    limit: FREE_LIKES_LIMIT,
    isPremium: false
  }
}
