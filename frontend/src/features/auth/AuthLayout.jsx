
import { Link } from "react-router-dom";

function AuthLayout({
  children,
  title,
  accent,
  description,
  navText,
  navLabel,
  navHref,
  visualTitle,
  visualDescription,
}) {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-[#f7f6f2] text-[#171716] lg:grid-cols-2">

      {/* LEFT — FORM */}
      <section className="relative flex min-h-screen items-center justify-center px-6 py-28 sm:px-12 lg:px-16 xl:px-24">

        {/* Brand */}
        <Link
          to="/login"
          className="absolute left-7 top-7 flex items-center gap-2 text-xl font-semibold tracking-tight sm:left-10 sm:top-9"
        >
          <span className="flex h-8 w-8 items-center justify-center bg-[#171716] text-sm text-white">
            f.
          </span>
          forma
        </Link>

        {/* Coral atmosphere */}
        <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#e77b6d]/10 blur-[130px]" />

        <div className="relative z-10 w-full max-w-[420px]">

          <h1 className="text-5xl font-medium leading-[1.08] tracking-[-0.055em] sm:text-6xl">
            {title}
            <br />
            <span className="text-[#d9786b]">{accent}</span>
          </h1>

          <p className="mt-5 max-w-[370px] text-sm leading-7 text-neutral-500">
            {description}
          </p>

          {children}

          {/* Account navigation */}
          <div className="mt-6 border-t border-neutral-200 pt-5 text-center">
            <p className="text-sm text-neutral-500">
              {navText}{" "}
              <Link
                to={navHref}
                className="font-semibold text-neutral-950 underline decoration-[#e77b6d] underline-offset-4 transition-colors hover:text-[#d9786b]"
              >
                {navLabel}
              </Link>
            </p>
          </div>

          {/* Copyright */}
          <p className="mt-6 text-center text-[10px] text-neutral-400">
            © 2026 Forma. All rights reserved.
          </p>
        </div>
      </section>

      {/* RIGHT — VISUAL */}
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#171716] text-white lg:flex lg:flex-col lg:justify-center">

        {/* Grid background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:48px_48px]"
        />

        {/* Coral atmosphere — no outlined circle */}
        <div className="absolute -left-24 top-[30%] h-96 w-96 rounded-full bg-[#e77b6d]/25 blur-[120px]" />

        {/* Grid-aligned composition */}
        <div className="relative mx-auto flex w-full max-w-[768px] flex-col justify-center px-12 xl:px-16">

          {/* First card */}
          <div className="relative ml-[48px] w-[336px] max-w-[85%] border border-white/15 bg-[#242423]/90 p-8">
            <span className="text-[11px] tracking-wide text-neutral-500">
              01 / THE THOUGHT
            </span>

            <h2 className="mt-7 text-4xl font-medium tracking-tight">
              Imagine.
            </h2>

            <p className="mt-3 text-sm text-neutral-400">
              Every idea begins somewhere.
            </p>
          </div>

          {/* Second card */}
          <div className="relative ml-auto mr-[24px] mt-12 w-[336px] max-w-[85%] border border-white/15 bg-[#242423]/90 p-8">
            <span className="text-[11px] tracking-wide text-neutral-500">
              02 / THE PROCESS
            </span>

            <h2 className="mt-7 text-4xl font-medium tracking-tight">
              Create.
            </h2>

            <p className="mt-3 text-sm text-neutral-400">
              Give your thoughts a shape.
            </p>
          </div>

          {/* Main statement */}
          <div className="relative ml-[24px] mt-20 border-l-2 border-[#e77b6d] py-2 pl-7">
            <p className="text-[11px] tracking-[0.2em] text-neutral-400">
              {visualTitle}
            </p>

            <p className="mt-4 text-5xl font-medium leading-[1.15] tracking-[-0.045em] xl:text-6xl">
              {visualDescription}
            </p>
          </div>

        </div>
      </aside>
    </main>
  );
}

export default AuthLayout;
