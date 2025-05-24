import { Rocket } from "lucide-react";
import type { SVGProps } from "react";

// Placeholder for a more specific Yura Connect logo
// For now, using a generic icon and text
const YuraConnectIcon = (props: SVGProps<SVGSVGElement>) => (
  // Replace with actual Yura Connect logo SVG or component
  <Rocket {...props} />
);


interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  iconSize?: number;
  textSize?: string;
}

export function Logo({ className, iconOnly = false, iconSize = 24, textSize = "text-xl" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <YuraConnectIcon width={iconSize} height={iconSize} className="text-primary" />
      {!iconOnly && (
        <span className={`font-bold ${textSize} text-primary whitespace-nowrap`}>
          Yura Connect
        </span>
      )}
    </div>
  );
}
