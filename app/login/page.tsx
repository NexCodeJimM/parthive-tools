import { LoginForm } from "./login-form";

type SearchParams = { from?: string | string[] };

function safeRedirectPath(from: string | string[] | undefined): string {
  if (!from || Array.isArray(from)) {
    return "/";
  }
  if (!from.startsWith("/") || from.startsWith("//")) {
    return "/";
  }
  return from;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.from);

  return <LoginForm redirectTo={redirectTo} />;
}
