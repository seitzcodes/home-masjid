import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side (Form) */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 lg:w-1/2">
        {children}
      </div>
      
      {/* Right side (Image) */}
      <div className="relative hidden w-0 flex-1 lg:block lg:w-1/2">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/Home Masjid Login.png"
          alt="Home Masjid Login Background"
          fill
          priority
        />
      </div>
    </div>
  );
}
