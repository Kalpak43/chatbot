import { useAppSelector } from "@/app/hooks";
import { Progress } from "./ui/progress";
function UserInfo() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <section id="user-info" className="space-y-8">
      <div className="space-y-4">
        <div className="w-full max-w-[10rem] aspect-square rounded-full mx-auto border border-primary overflow-hidden">
          <img
            src={user.photoURL!}
            alt={user.displayName!}
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{user.displayName}</p>
          <p className="text-center text-sm">{user.email}</p>
        </div>
      </div>

      <div className="bg-card rounded-md border border-secondary/10 shadow px-4 py-8 space-y-4">
        <p className="text-sm leading-none text-muted-foreground">
          <span className="font-semibold">Messages Used:</span>
          <span> 3 / 10</span>
        </p>
        <Progress value={30} />

        <p className="text-xs leading-none text-muted-foreground">
          <span className="font-semibold">Limit Resets on:</span>
          <span> 5:31 AM</span>
        </p>
      </div>
    </section>
  );
}

export default UserInfo;
