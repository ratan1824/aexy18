import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Aexy",
  description: "Login or create an account to start learning.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {children}
    </main>
  );
}

    