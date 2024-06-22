import { SignIn } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="items-center justify-center min-h-screen flex flex-col gap-y-4">
      <SignIn/>
    </main>
  );
}
