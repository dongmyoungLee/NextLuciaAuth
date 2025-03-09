import {Lucia} from "lucia";
import {BetterSqlite3Adapter} from "@lucia-auth/adapter-sqlite";
import db from "./db";
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";

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
