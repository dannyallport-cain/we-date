import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { question: 'asc' }
      ]
    })

    // Group by category
    const groupedPrompts = prompts.reduce((acc, prompt) => {
      const category = prompt.category || 'General'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(prompt)
      return acc
    }, {} as Record<string, typeof prompts>)

    return NextResponse.json({ prompts: groupedPrompts })
  } catch (error) {
    console.error('Get prompts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
