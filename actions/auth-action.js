'use server';

import {createUser} from "@/lib/user";
import {hashUserPassword} from "@/lib/hash";
import {redirect} from "next/navigation";

export async function signup(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');


    let errors = {};

    if (!email.includes('@')) {
        errors.email = "이메일 형식 오류";
    }

    if (password.trim().length < 4) {
        errors.password = '비밀번호 길이 짧음';
    }

    if (Object.keys(errors).length > 0) {
        return {
            errors
        }
    }

    // store in it the db.. (create a new user)
    const hashedPassword = hashUserPassword(password);

    try {
        createUser(email, hashedPassword);
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return {
                errors: {
                    email: 'IT seems like an account for the chosen email already exists.'
                }
            }
        }

        throw error;
    }

    redirect('/training');

}