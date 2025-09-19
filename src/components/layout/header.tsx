'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Menu, LayoutDashboard, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';

const navLinks = [
  { href: '/jobs', label: 'Vagas' },
  { href: '/employer', label: 'Para Empresas' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userProfile, loading, signOut } = useAuth();
  const userInitial = user?.displayName?.charAt(0) ?? '';

  const getDashboardLink = () => {
    if (userProfile?.accountType === 'employer') {
        return '/employer/dashboard';
    }
    return '/candidate/dashboard';
  }

  const getProfileLink = () => {
    if (userProfile?.accountType === 'employer') {
        // Employer profile page doesn't exist yet, so we default to dashboard
        return '/employer/dashboard';
    }
    return '/candidate/profile';
  }


  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ '--header-height': '4rem' } as React.CSSProperties}
    >
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">Trampaí</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <Skeleton className="h-10 w-24 rounded-md" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}><LayoutDashboard className='mr-2'/>Painel</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href={getProfileLink()}><User className='mr-2'/>Meu Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className='mr-2'/>Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Briefcase className="h-6 w-6 text-primary" />
                  <span className="font-headline text-xl font-bold">Trampaí</span>
                </Link>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-2 border-t pt-6">
                 {user ? (
                   <>
                    <Link href={getDashboardLink()} className='px-3 py-2 text-base font-medium' onClick={() => setIsMobileMenuOpen(false)}>Painel</Link>
                    <Link href={getProfileLink()} className='px-3 py-2 text-base font-medium' onClick={() => setIsMobileMenuOpen(false)}>Meu Perfil</Link>
                    <Button variant="ghost" onClick={() => {signOut(); setIsMobileMenuOpen(false);}}>Sair</Button>
                   </>
                 ) : (
                   <>
                    <Button variant="ghost" asChild>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Entrar</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Cadastrar</Link>
                    </Button>
                   </>
                 )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
