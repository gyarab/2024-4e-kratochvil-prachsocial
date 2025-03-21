import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import Navbar from "./navbar";
import MenuBar from "./MenuBar";

/**
* Hlavni layout aplikace
* 
* 1. Kontroluje zda je uzivatel prihlasen
* 2. Poskytuje session context vsem komponentam
* 3. Definuje zakladni strukturu aplikace (navbar, sidebar, content)
* 4. Obsahuje spodni navigacni menu (pro mobilni zarizeni)
*/
export default async function Layout({
 children,
}: {
 children: React.ReactNode;
}) {
 // Overeni prihlaseni
 const session = await validateRequest();
 
 // Presmerovani na login pokud neni uzivatel prihlasen
 if (!session.user) redirect("/login");
 
 return (
   <SessionProvider value={session}>
     <div className="flex min-h-screen flex-col">
       {/* Horni navigacni lista */}
       <Navbar />
       
       <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
         {/* Bocni menu (viditelne na vetsich obrazovkach) */}
         <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
         
         {/* Hlavni obsah */}
         {children}
       </div>
       
       {/* Spodni navigace (mobilni zobrazeni) */}
       <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
     </div>
   </SessionProvider>
 );
}