import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

export async function branchThread(thread: string, message: string) {
  toast.loading("Attempting to branch thread...");

  const response = await fetch('/branch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      thread,
      message,
    })
  });

  const res = await response.json();

  if (!response.ok) {
    toast.error(res.message);
    return;
  }

  goto(`/chat/${res.branched}`);
}