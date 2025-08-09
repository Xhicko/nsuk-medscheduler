import './globals.css';
import { Inter } from 'next/font/google'
import { getUserFromCookie } from '@/lib/auth'
import  AuthProvider from '@/components/custom/AuthProvider'
import { Toaster } from 'react-hot-toast';

 const inter = Inter({
   subsets: ['latin'],
   variable: '--font-inter', 
})
 
 export default async function RootLayout({ children }) {
     // 1) On the server, read the Supabase cookie once:
   const { user, error } = await getUserFromCookie()

   return (
     <html lang="en" className={inter.variable} suppressHydrationWarning>
       <head>
         {/* DNS prefetch for faster connections */}
         <link rel="dns-prefetch" href="//fonts.googleapis.com" />
         <link rel="dns-prefetch" href="//fonts.gstatic.com" />
         
         {/* Preload critical routes for admin panel */}
         <link rel="prefetch" href="/admin/dashboard" />
         <link rel="prefetch" href="/admin/students" />
         
         {/* Preconnect to API endpoints */}
         <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
       </head>
       <body>
         {/*
          2) Pass the server‐side `initialUser` + `initialError` into AuthProvider.
             AuthProvider (in /components/custom/AuthProvider.jsx) will:
             - create a browser‐side Supabase client (that also reads the same cookie)
             - in a useEffect: call supabase.auth.getSession() → fill Zustand
             - wire up onAuthStateChange
        */}
         <AuthProvider initialUser={user} initialError={error}>
               <Toaster
                  toastOptions={{
                     style: {
                        background: '#000000',
                        color: '#FFFFFF',
                        fontFamily: 'sans-serif',
                        fontSize: '12px',
                     },
                     duration: 5000,
                     position: 'top-right',
                  }}
               />
              {/*
            3) We still need to “finish hydrating” on the client by
               a) calling fetchUser() so that if the cookie changed between SSR and CSR, we pick it up
               b) subscribing to any future onAuthStateChange events
          */}
          {children}
         </AuthProvider>
       </body>
     </html>
   )
 }
 