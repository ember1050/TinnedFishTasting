"use client";

import { useActionState } from "react";
import {
  updateUsername,
  updateEmail,
  updatePassword,
  uploadAvatar,
} from "@/app/actions/profile";

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

  const box = "rounded-lg border p-5";
  const input = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";
  const btn =
    "rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50";

  return (
    <div className="space-y-6">
      <form action={aAction} className={box}>
        <h2 className="font-semibold mb-2">Profile picture</h2>
        <input type="file" name="avatar" accept="image/png,image/jpeg,image/webp" className="text-sm" />
        <div className="mt-3">
          <button className={btn} disabled={aPending}>{aPending ? "Uploading…" : "Upload"}</button>
        </div>
        <Msg s={aState} />
      </form>

      <form action={uAction} className={box}>
        <h2 className="font-semibold mb-2">Username</h2>
        <input name="display_name" defaultValue={displayName} className={input} />
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
