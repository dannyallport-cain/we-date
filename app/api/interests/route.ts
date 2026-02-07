import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const interests = await prisma.interest.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Group by category
    const groupedInterests = interests.reduce((acc, interest) => {
      const category = interest.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(interest)
      return acc
    }, {} as Record<string, typeof interests>)

    return NextResponse.json({ interests: groupedInterests })
  } catch (error) {
    console.error('Get interests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
