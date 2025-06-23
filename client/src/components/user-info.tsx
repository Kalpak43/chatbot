import { useAppSelector } from "@/app/hooks";
import { Progress } from "./ui/progress";
import { getTime } from "@/lib/utils";
function UserInfo() {
  const user = useAppSelector((state) => state.auth.user);
  const rateLimit = useAppSelector((state) => state.prompt.rateLimit);

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
        <p className="text-xs leading-none text-muted-foreground">
          <span className="font-semibold">Messages Used:</span>
          <span>
            {" "}
            {Number(rateLimit?.limit ?? 0) -
              Number(rateLimit?.remaining ?? 0)}{" "}
            / {rateLimit?.limit ?? 0}
          </span>
        </p>
        <Progress
          value={
            rateLimit && rateLimit.limit
              ? ((Number(rateLimit.limit) - Number(rateLimit.remaining)) /
                  Number(rateLimit.limit)) *
                100
              : 0
          }
        />
        <div className="space-y-2">
          <p className="text-sm leading-none text-muted-foreground">
            <span className="font-semibold">Messages Remaining:</span>
            <span> {rateLimit?.remaining}</span>
          </p>

          <p className="text-xs leading-none text-muted-foreground">
            <span className="font-semibold">Limit Resets on:</span>
            <span> {getTime(Number(rateLimit?.reset ?? 0))}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default UserInfo;
