export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // We remove the centering flexbox and max-width constraints here.
    // This simply provides the background and allows the 'children' (Login/Register pages)
    // to manage their own full-screen layouts (like the split-screen design).
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}