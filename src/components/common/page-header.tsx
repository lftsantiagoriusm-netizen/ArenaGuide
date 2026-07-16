interface PageHeaderProps {
  readonly title: string;
  readonly description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="max-w-2xl space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground text-base leading-7 text-pretty">
        {description}
      </p>
    </header>
  );
}
