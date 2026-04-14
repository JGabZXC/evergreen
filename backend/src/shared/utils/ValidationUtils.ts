import {Role} from "../../generated/prisma/enums";

export class ValidationUtils {
    private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    static isEmail(email: string): boolean {
        if(!email) return false;
        return this.EMAIL_REGEX.test(email);
    }

    static isValidRole(role: string) {
        return Object.values(Role).includes(role as Role)
    }

    static isValidDate(dateString: string) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    static isValidNumber(number: string): boolean {
        return number.trim() !== '' && !isNaN(Number(number));
    }
}