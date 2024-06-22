import { SignUp } from '@clerk/nextjs';
import React from 'react';

export default function page() {
  return (
    <main className="items-center justify-center min-h-screen flex flex-col gap-y-4">
      <SignUp />
    </main>
  );
}
