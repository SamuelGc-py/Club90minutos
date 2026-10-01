import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const p = await prisma.partido.findMany({ select: { jornada: true }});
    const c = p.reduce((acc: any, x) => {
        acc[x.jornada] = (acc[x.jornada] || 0) + 1;
        return acc;
    }, {});
    console.log(c);
}
check().catch(console.error).finally(() => prisma.$disconnect());
