import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  title?: string;
  language?: string;
  code: string;
  className?: string;
}

export function CodeBlock({
  title = "Code",
  language,
  code,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn("overflow-hidden p-0 gap-0 my-4", className)}>
      <CardHeader className="flex flex-row items-center justify-between bg-muted/50 py-2 px-4">
        <CardTitle className="text-sm font-medium uppercase">
          {title}
          {language && (
            <span className="ml-2 text-xs text-muted-foreground">
              {language}
            </span>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={copyToClipboard}
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0!">
        <pre className="overflow-x-auto bg-muted/20 p-4 font-mono text-sm text-gray-300">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
