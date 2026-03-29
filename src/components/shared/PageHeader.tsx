interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={["mb-8", className].filter(Boolean).join(" ")}>
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-base text-white/60 sm:text-lg">{description}</p>
    </div>
  );
}
