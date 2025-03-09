import '../globals.css';
import {logout} from "@/actions/auth-action";

export const metadata = {
    title: 'Next Auth',
    description: 'Next.js Authentication',
};
export default function AuthRootLayout({children}) {
    return (
        <>
            <header id="auth-header">
                <p>Welcome back !</p>
                <form action={logout}>
                    <button>Logout</button>
                </form>
            </header>
            {children}
        </>
    );
}