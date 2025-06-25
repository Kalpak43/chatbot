import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserInfo from "@/components/user-info";
import { signout } from "@/features/auth/authThunk";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/static/themes";
import { ArrowLeft, Check, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("personalization");

  const tabs = [
    {
      name: "Personalization",
      value: "personalization",
    },
    {
      name: "Contact Us",
      value: "contact-us",
    },
  ];

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    setActiveTab(path || "personalization");
  }, [location.pathname]);

  return (
    <main className="max-w-7xl mx-auto p-8 space-y-8">
      <header className="flex items-center justify-between">
        <Button variant={"ghost"} asChild>
          <Link to={"/chat"}>
            <ArrowLeft />
            Go Back
          </Link>
        </Button>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} size={"icon"}>
                <Palette className="h-4 w-4 hover:text-accent-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <DropdownMenuItem
                    key={themeOption.value}
                    onClick={() => setTheme(themeOption.value as Theme)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{themeOption.name}</span>
                    {theme === themeOption.value && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant={"ghost"}
            onClick={() => {
              dispatch(signout());
            }}
          >
            Sign Out
          </Button>
        </div>
      </header>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
        <UserInfo />
        <Tabs
          value={activeTab}
          className="space-y-8 md:col-span-2 lg:col-span-3 w-full"
        >
          <TabsList className="w-full">
            {tabs.map((tab) => (
              <TabsTrigger
                value={tab.value}
                onClick={() => navigate(`/settings/${tab.value}`)}
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab} className="md:px-4">
            <Outlet />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default SettingsLayout;
