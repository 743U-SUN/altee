import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Avatar: React.FC<AvatarProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  )
);
Avatar.displayName = "Avatar";

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

const AvatarImage: React.FC<AvatarImageProps & React.RefAttributes<HTMLImageElement>> = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt, ...props }, ref) => (
    <img
      ref={ref}
      alt={alt}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  )
);
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const AvatarFallback: React.FC<AvatarFallbackProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
      {...props}
    />
  )
);
AvatarFallback.displayName = "AvatarFallback";

function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const UserAvatar: React.FC<UserAvatarProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ src, name, size = "md", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };
    
    const initials = name ? getInitials(name) : "";
    const [imgError, setImgError] = React.useState(false);
    
    return (
      <div
        ref={ref}
        className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizeClasses[size], className)}
        {...props}
      >
        {src && !imgError && (
          <img
            src={src}
            alt={name || "ユーザーアバター"}
            className="aspect-square h-full w-full"
            onError={() => setImgError(true)}
          />
        )}
        {(!src || imgError) && (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            {initials || "?"}
          </div>
        )}
      </div>
    );
  }
);
UserAvatar.displayName = "UserAvatar";

export { Avatar, AvatarImage, AvatarFallback, UserAvatar };