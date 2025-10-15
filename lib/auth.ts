import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

/**
 * Configuration NextAuth.js v5
 *
 * Authentification avec email/password + JWT
 * Conformément au cahier des charges : NextAuth.js v5 + bcrypt
 */

// Étendre les types de session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      plan: "FREEMIUM" | "STANDARD"
      role: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name: string | null
    plan: "FREEMIUM" | "STANDARD"
    role: string | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/dashboard",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validation des credentials
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials)

        if (!parsedCredentials.success) {
          console.error("Invalid credentials format")
          return null
        }

        const { email, password } = parsedCredentials.data

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            plan: true,
            role: true,
            emailVerified: true,
          },
        })

        if (!user || !user.password) {
          console.error("User not found or no password set")
          return null
        }

        // Vérifier le mot de passe
        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
          console.error("Invalid password")
          return null
        }

        // Retourner l'utilisateur (sans le password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Ajouter les infos utilisateur au token JWT
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.plan = user.plan
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Ajouter les infos du token à la session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string | null
        session.user.plan = token.plan as "FREEMIUM" | "STANDARD"
        session.user.role = token.role as string | null
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
})
