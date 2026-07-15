"use client";

import { useActionState, useRef, useState } from "react";
import {
  updateUsername,
  updateEmail,
  updatePassword,
  uploadAvatar,
} from "@/app/actions/profile";
import { downscaleImage } from "@/lib/image-client";

type Res = { error?: string; success?: string } | undefined;

function useAct(fn: (fd: FormData) => Promise<Res>) {
  return useActionState(async (_p: Res, fd: FormData) => fn(fd), undefined);
}

function Msg({ s }: { s: Res }) {
  if (!s) return null;
  return s.error ? (
    <p className="text-sm text-red-600 mt-1">{s.error}</p>
  ) : s.success ? (
    <p className="text-sm text-green-600 mt-1">{s.success}</p>
  ) : null;
}

export function ProfileSettings({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  const [aState, aAction, aPending] = useAct(uploadAvatar);
  const [uState, uAction, uPending] = useAct(updateUsername);
  const [eState, eAction, ePending] = useAct(updateEmail);
  const [pState, pAction, pPending] = useAct(updatePassword);

  const avatarRef = useRef<HTMLInputElement>(null);
  const [prepping, setPrepping] = useState(false);
  const [prepError, setPrepError] = useState<string | null>(null);

  async function submitAvatar(e: React.FormEvent) {
    e.preventDefault();
    setPrepError(null);
    const file = avatarRef.current?.files?.[0];
    const fd = new FormData();
    if (!file) {
      aAction(fd);
      return;
    }
    setPrepping(true);
    try {
      const resized = await downscaleImage(file);
      fd.append("avatar", resized, "avatar.webp");
    } catch {
      setPrepError("Couldn't process that image. Try a different one.");
      setPrepping(false);
      return;
    }
    setPrepping(false);
    aAction(fd);
  }

  const box = "rounded-lg border p-5";
  const input = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";
  const btn =
    "rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50";

  return (
    <div className="space-y-6">
      <form onSubmit={submitAvatar} className={box}>
        <h2 className="font-semibold mb-2">Profile picture</h2>
        <input
          ref={avatarRef}
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/webp"
          className="text-sm"
        />
        <p className="mt-1 text-xs text-gray-400">
          Large images are automatically resized and compressed.
        </p>
        <div className="mt-3">
          <button className={btn} disabled={aPending || prepping}>
            {prepping ? "Processing…" : aPending ? "Uploading…" : "Upload"}
          </button>
        </div>
        {prepError ? (
          <p className="text-sm text-red-600 mt-1">{prepError}</p>
        ) : (
          <Msg s={aState} />
        )}
      </form>

      <form action={uAction} className={box}>
        <h2 className="font-semibold mb-2">Username</h2>
        <input name="display_name" defaultValue={displayName} minLength={3} maxLength={30} className={input} />
        <p className="mt-1 text-xs text-gray-400">
          3–30 characters: letters, numbers, spaces, and underscores.
        </p>
        <div className="mt-3"><button className={btn} disabled={uPending}>{uPending ? "Saving…" : "Save username"}</button></div>
        <Msg s={uState} />
      </form>

      <form action={eAction} className={box}>
        <h2 className="font-semibold mb-2">Email</h2>
        <input name="email" type="email" defaultValue={email} className={input} />
        <div className="mt-3"><button className={btn} disabled={ePending}>{ePending ? "Saving…" : "Change email"}</button></div>
        <Msg s={eState} />
      </form>

      <form action={pAction} className={box}>
        <h2 className="font-semibold mb-2">Password</h2>
        <div className="space-y-2">
          <input name="current_password" type="password" autoComplete="current-password" placeholder="Current password" className={input} />
          <input name="password" type="password" autoComplete="new-password" placeholder="New password" className={input} />
          <input name="confirm_password" type="password" autoComplete="new-password" placeholder="Confirm new password" className={input} />
        </div>
        <div className="mt-3"><button className={btn} disabled={pPending}>{pPending ? "Saving…" : "Change password"}</button></div>
        <Msg s={pState} />
      </form>
    </div>
  );
}
