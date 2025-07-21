import { createClient } from '@/utils/supabase/server';

export default async function HomePage() {
  const supabase = await createClient(); // ✅ Await the promise

  const {
    data: { user },
  } = await supabase.auth.getUser(); // ✅ Now `auth` works

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Welcome to Team Journals</h1>
      {user ? (
        <p>Logged in as: {user.email}</p>
      ) : (
        <p>Not logged in.</p>
      )}
    </main>
  );
}
