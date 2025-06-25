import { X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Attachment {
  url: string;
  type: "image" | "file";
  name: string;
  size: number;
}

interface AttachmentCardProps {
  attachment: Attachment;
  onRemove?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  );
}

export default function AttachmentCard({
  attachment,
  onRemove,
}: AttachmentCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-sm transition-shadow p-4 border-primary/10">
      {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 z-10 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      <CardContent className="px-0!">
        <div className="flex items-center gap-3">
          {/* Small Preview Section */}
          <div className="h-10 w-10 bg-muted/30 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
            {attachment.type === "image" ? (
              <img
                src={attachment.url || "/placeholder.svg"}
                alt={attachment.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <File className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Info Section */}
          <div className="min-w-0 flex-1 pr-6">
            <p
              className="text-xs font-medium leading-tight truncate"
              title={attachment.name}
            >
              {attachment.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.size)}
              </p>
              {attachment.type === "file" && (
                <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                  {attachment.url
                    .split(".")
                    .pop()
                    ?.split("?")[0]
                    ?.toUpperCase() || "FILE"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
