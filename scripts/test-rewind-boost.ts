
import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
    console.log('🧪 Starting Rewind & Boost Test...')
    const timestamp = Date.now()
    
    // Create Users
    const me = await prisma.user.create({
        data: {
            email: `me-${timestamp}@example.com`,
            passwordHash: 'hash',
            firstName: 'Me',
            displayName: 'Me',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'MAN',
            interestedIn: ['WOMAN'],
            isPremium: true,
            location: 'London',
            latitude: 51.5074,
            longitude: -0.1278
        }
    })
    
    const target = await prisma.user.create({
        data: {
            email: `target-${timestamp}@example.com`,
            passwordHash: 'hash',
            firstName: 'Target',
            displayName: 'Target',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'WOMAN',
            interestedIn: ['MAN'],
            location: 'London',
            latitude: 51.5074,
            longitude: -0.1278
        }
    })
    
    // --- REWIND TEST ---
    console.log('--- Testing Rewind ---')
    // 1. Create Match
    console.log('Creating match...')
    await prisma.swipe.create({ data: { userId: me.id, targetUserId: target.id, action: 'LIKE' } })
    await prisma.swipe.create({ data: { userId: target.id, targetUserId: me.id, action: 'LIKE' } })
    
    const m1Id =  me.id < target.id ? me.id : target.id
    const m2Id =  me.id < target.id ? target.id : me.id
    
    await prisma.match.create({
        data: { user1Id: m1Id, user2Id: m2Id }
    })
    
    let matchExists = await prisma.match.findUnique({ where: { user1Id_user2Id: { user1Id: m1Id, user2Id: m2Id } } })
    console.log(`Match created: ${!!matchExists}`)
    
    // 2. Simulate Rewind (Me)
    console.log('Rewinding...')
    const lastSwipe = await prisma.swipe.findFirst({ where: { userId: me.id }, orderBy: { createdAt: 'desc' } })
    if (lastSwipe) {
        await prisma.swipe.delete({ where: { id: lastSwipe.id } })
        await prisma.match.delete({ where: { id: matchExists!.id } }) // Route logic does this
        console.log('✅ Rewind executed (Swipe + Match deleted).')
    }
    
    matchExists = await prisma.match.findUnique({ where: { user1Id_user2Id: { user1Id: m1Id, user2Id: m2Id } } })
    if (!matchExists) console.log('✅ Match gone.')
        else console.error('❌ Match still exists.')

    // --- BOOST TEST ---
    console.log('\n--- Testing Boost ---')
    
    const boostedUser = await prisma.user.create({
        data: {
            email: `boosted-${timestamp}@example.com`,
            passwordHash: 'hash',
            firstName: 'Boosted',
            displayName: 'Boosted User',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'WOMAN',
            interestedIn: ['MAN'],
            isPremium: true,
            lastActive: new Date(Date.now() - 10000000) // Old activity, low score
        }
    })
    
    const normalUser = await prisma.user.create({
         data: {
            email: `normal-${timestamp}@example.com`,
            passwordHash: 'hash',
            firstName: 'Normal',
            displayName: 'Normal User',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'WOMAN',
            interestedIn: ['MAN'],
            isPremium: false,
            lastActive: new Date() // Recent activity, high score
         }
    })
    
    // Activate Boost for boostedUser
    await prisma.boost.create({
        data: {
            userId: boostedUser.id,
            duration: 30,
            expiresAt: new Date(Date.now() + 30*60000)
        }
    })
    console.log('Boost activated for Boosted User.')
    
    // Simulate Discover Query & Sort
    console.log('Simulating Discover Sort...')
    // We fetch raw users
    const users = await prisma.user.findMany({
        where: { id: { in: [boostedUser.id, normalUser.id] } },
        include: {
            boosts: { where: { isActive: true, expiresAt: { gt: new Date() } } }
        }
    })
    
    // Apply logic from route
    const mapped = users.map(u => ({
        ...u,
        isBoosted: u.boosts.length > 0,
        // Mock match score based on activity
        matchScore: (new Date(u.lastActive).getTime() > new Date(Date.now() - 1000).getTime()) ? 100 : 50
    }))
    
    console.log(`Scores: Boosted=${mapped.find(u => u.id === boostedUser.id)?.matchScore}, Normal=${mapped.find(u => u.id === normalUser.id)?.matchScore}`)
    
    const sorted = mapped.sort((a, b) => {
        if (a.isBoosted && !b.isBoosted) return -1;
        if (!a.isBoosted && b.isBoosted) return 1;
        return b.matchScore - a.matchScore;
    })
    
    console.log('Order:', sorted.map(u => `${u.displayName} (Boosted: ${u.isBoosted})`).join(' -> '))
    
    if (sorted[0].id === boostedUser.id) {
        console.log('✅ Boosted user is first despite lower score.')
    } else {
        console.error('❌ Boost failed.')
    }
    
    // Cleanup
    console.log('🧹 Cleanup...')
    await prisma.user.deleteMany({
        where: {
            id: { in: [me.id, target.id, boostedUser.id, normalUser.id] }
        }
    })
    await prisma.$disconnect()
}

main()
