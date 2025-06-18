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

  toast.success("Thread has been branched successfully");

  goto(`/chat/${res.branched}`);
}

export async function modifyMessage(thread: string, model: string, modify: string, message: string) {
  toast.loading("Attempting to requery thread...");

  const response = await fetch('/prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      thread,
      model,
      message,
      modify
    })
  });

  const res = await response.json();

  if (!response.ok) {
    toast.error(res.message);
    return;
  }

  toast.success("Thread has been requeried successfully");
}