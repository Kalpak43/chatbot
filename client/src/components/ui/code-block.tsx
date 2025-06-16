import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";

interface CodeBlockProps {
  title?: string;
  language?: string;
  code: string;
  className?: string;
  theme?: "light" | "dark";
}

export function CodeBlock({
  title = "Code",
  language = "text",
  code,
  className,
  theme = "dark",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

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
        <div className="overflow-x-auto">
          <Highlight
            theme={theme === "dark" ? themes.vsDark : themes.vsLight}
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
                  "overflow-x-auto py-4 font-mono text-sm",
                  // Override Prism's background with your card background
                  "", // Your original background
                  prismClassName
                )}
                style={{
                  ...style,
                  background: "transparent", // Remove Prism's background
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
        </div>
      </CardContent>
    </Card>
  );
}

// import { useState, useEffect } from "react";
// import { Check, Copy } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { createHighlighter, type Highlighter } from "shiki";

// interface CodeBlockProps {
//   title?: string;
//   language?: string;
//   code: string;
//   className?: string;
// }

// export function CodeBlock({
//   title = "Code",
//   language = "text",
//   code,
//   className,
// }: CodeBlockProps) {
//   const [copied, setCopied] = useState(false);
//   const [highlightedCode, setHighlightedCode] = useState<string>("");
//   const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

//   // Initialize Shiki highlighter
//   useEffect(() => {
//     const initHighlighter = async () => {
//       try {
//         const hl = await createHighlighter({
//           themes: ["github-dark", "github-light"],
//           langs: [
//             "javascript",
//             "typescript",
//             "python",
//             "java",
//             "cpp",
//             "html",
//             "css",
//             "json",
//             "markdown",
//             "bash",
//             "sql",
//             "go",
//             // Add more languages as needed
//           ],
//         });
//         setHighlighter(hl);
//       } catch (error) {
//         console.error("Failed to initialize Shiki highlighter:", error);
//       }
//     };

//     initHighlighter();
//   }, []);

//   // Highlight code when highlighter or code changes
//   useEffect(() => {
//     if (!highlighter || !code) return;

//     try {
//       const highlighted = highlighter.codeToHtml(code, {
//         lang: language,
//         theme: "github-dark", // You can make this dynamic based on theme
//       });
//       setHighlightedCode(highlighted);
//     } catch (error) {
//       console.error("Failed to highlight code:", error);
//       // Fallback to plain text
//       setHighlightedCode(`<pre><code>${code}</code></pre>`);
//     }
//   }, [highlighter, code, language]);

//   const copyToClipboard = async () => {
//     await navigator.clipboard.writeText(code);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <Card className={cn("overflow-hidden p-0 gap-0 my-4 shadow-none! border border-secondary/10", className)}>
//       <CardHeader className="flex flex-row items-center justify-between bg-muted/50 py-2 px-4">
//         <CardTitle className="text-sm font-medium uppercase">
//           {title}
//           {language && (
//             <span className="ml-2 text-xs text-muted-foreground">
//               {language}
//             </span>
//           )}
//         </CardTitle>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8"
//           onClick={copyToClipboard}
//           aria-label="Copy code to clipboard"
//         >
//           {copied ? (
//             <Check className="h-4 w-4" />
//           ) : (
//             <Copy className="h-4 w-4" />
//           )}
//         </Button>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="overflow-x-auto">
//           {highlightedCode ? (
//             <div
//               className="[&_pre]:!bg-transparent [&_pre]:py-4 [&_pre]:m-0 [&_code]:text-sm [&_code]:font-mono"
//               dangerouslySetInnerHTML={{ __html: highlightedCode }}
//             />
//           ) : (
//             <pre className="overflow-x-auto p-4 font-mono text-sm">
//               <code>{code}</code>
//             </pre>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
