import { memo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "@/hooks/use-theme";

interface CodeBlockProps {
  title?: string;
  language?: string;
  code: string;
  className?: string;
  theme?: "light" | "dark";
  highlightCode: boolean;
}

export const CodeBlock = memo(
  ({
    title = "Code",
    language = "text",
    code,
    className,
    highlightCode,
  }: CodeBlockProps) => {
    const [copied, setCopied] = useState(false);
    const { theme, resolvedTheme } = useTheme();

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    };

    return (
      <Card
        className={cn(
          "overflow-hidden p-0 gap-0 my-4 shadow-none border border-secondary/10",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between bg-muted/50 py-2 px-4">
          <CardTitle className="text-sm font-medium uppercase">
            {title}
            {/* {language && (
            <span className="ml-2 text-xs text-muted-foreground">
              {language}
            </span>
          )} */}
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
        <CardContent className="max-md:p-4 p-0 bg-muted/10">
          <div className="overflow-x-auto py-4">
            {highlightCode ? (
              <Highlight
                theme={
                  {
                    dark: themes.vsDark,
                    light: themes.vsLight,
                  }[theme == "system" ? resolvedTheme : theme]
                }
                code={code}
                language={language as any}
              >
                {({
                  className: prismClassName,
                  style,
                  tokens,
                  getLineProps,
                  getTokenProps,
                }) => (
                  <pre
                    className={cn(
                      "overflow-x-auto py-4 font-mono text-sm bg-transparent!",
                      // Override Prism's background with your card background
                      "", // Your original background
                      prismClassName
                    )}
                    style={{
                      ...style,
                    }}
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            ) : (
              <pre>{code}</pre>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);
