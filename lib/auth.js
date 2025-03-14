import {Lucia} from "lucia";
import {BetterSqlite3Adapter} from "@lucia-auth/adapter-sqlite";
import db from "./db";
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";
import {cookies} from "next/headers";

const adapter = new BetterSqlite3Adapter(db, {
    user: 'users',
    session: 'sessions'
});

const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        // 배포 환경일 땐 쿠키를 https 에서만 작동하도록..
        attributes: {
            secure: process.env.NODE_ENV === 'production'
        }
    }
});

export async function createAuthSession(userId) {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}

export async function verifyAuth() {
    const sessionCookie = cookies().get(lucia.sessionCookieName);

    if (!sessionCookie) {
        return {
            user: null,
            session: null
        }
    }

    const sessionId = sessionCookie.value;

    if (!sessionId) {
        return {
            user: null,
            session: null
        }
    }

    const result = await lucia.validateSession(sessionId);

    try {
        //  새로고침 쿠키 연장
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }

        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }

    } catch {

    }

    return result;
}

export async function destroySession() {
    const { session } = verifyAuth();
    if(!session) {
        return {
            errors : 'Unauthorized'
        }
    }

    // 세션 삭제
    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}