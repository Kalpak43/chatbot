import { useSync } from "@/hooks/use-sync";
import { CloudCheck, RefreshCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function SyncIndicator() {
  const { isSyncing, lastSyncTime } = useSync();

  return (
    <>
      {isSyncing ? (
        <Tooltip>
          <TooltipTrigger>
            <RefreshCcw className="h-4 w-4 animate-spin text-secondary ml-2" />
          </TooltipTrigger>
          <TooltipContent>
            <span>Syncing...</span>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger>
            <CloudCheck className="h-4 w-4 ml-2" />
          </TooltipTrigger>
          <TooltipContent>
            <span>
              Last synced
              {lastSyncTime
                ? ` at ${new Date(lastSyncTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : " never"}
            </span>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}

export default SyncIndicator;
