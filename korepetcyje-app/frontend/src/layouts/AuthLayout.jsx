export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        {children}
      </div>
    </div>
  );
}
