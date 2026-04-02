import { PasswordService } from "../../../../application/services/PasswordService";
import prisma from "../../prisma/db";
import {Role} from "../../../../generated/prisma/enums";



async function main() {
    const passwordService = new PasswordService(Number(process.env.PASSWORD_SALT_ROUNDS) || 12);
    const hashedPassword = await passwordService.hash("adminPassword123");

    const rawUser = await prisma.user.upsert({
        where: {email: "admin@gmail.com"},
        update: {},
        create: {
            email: "admin@gmail.com",
            password: hashedPassword,
            role: Role.ADMIN,
        }
    });

    const rawUserProfile = await prisma.userProfile.upsert({
        where: {userId: rawUser.id},
        update: {},
        create: {
            userId: rawUser.id,
            firstName: "John",
            lastName: "Lopez",
            dateOfBirth: new Date("August 25, 2003"),
            contactNumber: "0999999999"
        }
    });

    await prisma.userAddress.upsert({
        where: {userProfileId: rawUserProfile.id},
        update: {},
        create: {
            userProfileId: rawUserProfile.id,
            homeAddress: "Test Address",
            barangay: "San Francisco",
            municipality: "California",
            province: "Somewhere",
            region: "CA"
        }
    });
}

main().then(async () => {
    await prisma.$disconnect();
}).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
})