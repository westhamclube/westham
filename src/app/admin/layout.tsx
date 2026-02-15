import { Suspense } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full" />
      </div>
    }>
      {children}
    </Suspense>
  );
}
