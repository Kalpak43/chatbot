import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group [&_li]:relative [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:inset-0 [&_li]:before:rounded-[inherit] [&_li]:before:bg-linear-to-t [&_li]:before:from-black/40 [&_li]:before:to-transparent"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
