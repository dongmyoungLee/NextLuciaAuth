'use server';

import {createUser, getUserByEmail} from "@/lib/user";
import {hashUserPassword, verifyPassword} from "@/lib/hash";
import {redirect} from "next/navigation";
import {createAuthSession, destroySession} from "@/lib/auth";

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
        const id = createUser(email, hashedPassword);
        await createAuthSession(id);
        redirect('/training');
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
}

export async function login(prevState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    const existingUser = getUserByEmail(email);

    if (!existingUser) {
        return {
            errors : {
                email : 'Could not authenticate user'
            }
        }
    }

    const isValidPassword = verifyPassword(existingUser.password, password);

    if (!isValidPassword) {
        return  {
            errors : {
                password : 'Could not authenticate user, please check your credentials.'
            }
        }
    }

    await  createAuthSession(existingUser.id);
    redirect('/training');

}

export async function auth(mode, prevState, formData) {
    if (mode === 'login') {
        return login(prevState, formData);
    }

    return signup(prevState, formData);
}

export async function logout() {
    await destroySession();
    redirect('/');
}