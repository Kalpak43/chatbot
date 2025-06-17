import { Download } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

function ExportOptions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="[&_svg:not([class*='size-'])]:size-6 size-10"
        >
          <Download />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>Export as .md</DropdownMenuItem>
          <DropdownMenuItem>Export as .docx</DropdownMenuItem>
          <DropdownMenuItem>Export as .pdf</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportOptions;
