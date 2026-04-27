import { Show, SignInButton, SignUpButton } from "@clerk/react";
import { motion } from "framer-motion";

function LandingPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-500 flex items-center justify-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[size:6rem_4rem]"></div>
      <section>
        <header className="mb-5">
          <motion.h1
            className="text-6xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-red-50 via-red-100 to-gray-200 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 4 }}
          >
            Welcome to GenBookZ
          </motion.h1>
          <p className="max-w-[600px] text-sm text-gray-300 md:text-md xl:text-2xl">
            Your online book store
          </p>
        </header>

        <Show when="signed-out">
          <SignInButton
            mode="modal"
            fallbackRedirectUrl="/"
            forceRedirectUrl="/"
          >
            <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-yellow-900 to-red-100 rounded-full hover:from-red-100 hover:to-yellow-900 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Sign Up
            </button>
          </SignInButton>
        </Show>
      </section>
    </main>
  );
}

export default LandingPage;
