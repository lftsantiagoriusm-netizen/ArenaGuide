import Link from "next/link";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="grid min-h-[70dvh] place-items-center text-center">
      <div>
        <p className="text-primary text-sm font-medium">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Esta arena no existe</h1>
        <p className="text-muted-foreground mt-3">
          Regresa al inicio para continuar preparando tu próximo combate.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </Container>
  );
}
