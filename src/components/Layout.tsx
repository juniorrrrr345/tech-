'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export default function Layout({ children, showBackButton = false }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="layout">
      <header className="header">
        {showBackButton && (
          <button onClick={() => router.back()} className="back-button">
            ← Retour
          </button>
        )}
        <Link href="/">
          <h1 className="logo">TECH+ Paris</h1>
        </Link>
      </header>
      <main className="main">{children}</main>

      <style jsx>{`
        .layout {
          background: #0a1a2f;
          color: white;
          min-height: 100vh;
        }
        .header {
          background: #152842;
          padding: 16px 20px;
          text-align: center;
          position: relative;
          border-bottom: 1px solid #2a3f5f;
        }
        .back-button {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: 1px solid #4da6ff;
          color: #4da6ff;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .back-button:hover {
          background: #4da6ff;
          color: white;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4da6ff;
          margin: 0;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .logo:hover {
          color: #66b3ff;
        }
        .main {
          padding: 0;
        }
        @media (max-width: 768px) {
          .header {
            padding: 12px 16px;
          }
          .logo {
            font-size: 20px;
          }
          .back-button {
            left: 16px;
            padding: 6px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}