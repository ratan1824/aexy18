import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TypingIndicator({ avatar }: { avatar: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={avatar} alt="AI Avatar" />
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="flex items-center space-x-1 rounded-full bg-secondary p-3">
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
      </div>
    </div>
  );
}
