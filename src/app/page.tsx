import Link from "next/link";
import UploadTestButton from "~/components/upload-button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-center text-white sm:text-[5rem]">
          JaKaMa CMPG-323 Group Project
        </h1>
        <div className="flex flex-row w-full justify-center gap-x-4">
          
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/swagger"
          >
            <h3 className="text-2xl font-bold">📚 API Docs →</h3>
            <div className="text-lg">
              Need the secret map to our API treasure? Click here to sail away to the Swagger page, where all the documentation magic happens!
            </div>
          </Link>

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/login"
          >
            <h3 className="text-2xl font-bold">🔒 Login →</h3>
            <div className="text-lg">
              Ready to set sail? Click here to log in and start your adventure!
            </div>
          </Link>

          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/faq"
          >
            <h3 className="text-2xl font-bold">❓ FAQ →</h3>
            <div className="text-lg">
              Have any questions? Click here to see our FAQ page!
            </div>
          </Link>

        </div>
      </div>
    </main>
  );
}
