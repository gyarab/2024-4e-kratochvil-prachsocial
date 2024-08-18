import { Metadata } from "next";
import signupImage from "@assets/signup-image.jpg";
import Image from "next/image";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="rounded-2x1 flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-muted-foreground">
              The social full of <span className="italic">Prach</span>
            </p>
          </div>
          <div className="space-y-5">
            <SignUpForm />
            <link href="/login" className="block text-center hover:underline">
              Already have an account? Login in
            </link>
          </div>
        </div>
        <Image
          src={signupImage}
          alt="Signup image"
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
}