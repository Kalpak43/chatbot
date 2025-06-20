import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "./code-block";

interface MarkdownProps {
  content: string;
  highlightCode: boolean;
  className?: string;
}

function MarkdownRenderer({
  content,
  highlightCode,
  className,
}: MarkdownProps) {
  return (
    <div className={cn("markdown", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-4"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="scroll-m-20 text-xl font-semibold tracking-tight mb-4"
              {...props}
            />
          ),
          h5: ({ node, ...props }) => (
            <h5
              className="scroll-m-20 text-lg font-semibold tracking-tight mb-4"
              {...props}
            />
          ),
          h6: ({ node, ...props }) => (
            <h6
              className="scroll-m-20 text-base font-semibold tracking-tight mb-4"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="leading-7 [&:not(:first-child)]:my-6" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold" {...props} />
          ),
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          blockquote: ({ node, ...props }) => (
            <Card className="my-6 border-l-4 border-primary">
              <CardContent className="pt-6">
                <blockquote
                  className="italic text-muted-foreground"
                  {...props}
                />
              </CardContent>
            </Card>
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
          ),
          li: ({ node, ...props }) => <li {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="my-6 w-full overflow-y-auto">
              <Table {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <TableHeader {...props} />,
          tbody: ({ node, ...props }) => <TableBody {...props} />,
          tr: ({ node, ...props }) => <TableRow {...props} />,
          th: ({ node, ...props }) => <TableHead {...props} />,
          td: ({ node, ...props }) => <TableCell {...props} />,
          img: ({ node, ...props }) => (
            <img
              className="rounded-md border my-6 max-w-full h-auto"
              {...props}
              alt={props.alt || "Image"}
            />
          ),
          hr: () => <Separator className="my-6" />,
          code: ({ className, children, ...props }) => {
            // Check if className contains language-xyz (multi-line code block)
            const match = /language-(\w+)/.exec(className || "");

            if (match) {
              const language = match[1];
              const codeString = String(children).trim();

              return (
                <CodeBlock
                  title={language}
                  language={language}
                  code={codeString}
                  highlightCode={highlightCode}
                />
              );
            }

            // Inline code (single word/phrase inside backticks)
            return (
              <code
                className="relative rounded bg-muted px-[0.3rem] -mb-1 font-mono text-sm inline-block max-w-full overflow-x-auto"
                {...props}
              >
                <pre className="m-0 p-0">{children}</pre>
              </code>
            );
          },
          pre: ({ node, ...props }) => <>{props.children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
