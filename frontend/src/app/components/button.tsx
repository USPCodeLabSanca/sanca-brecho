import Link from "next/link"
import { ComponentProps } from "react"
import { Loader2 } from "lucide-react"

type ButtonBaseProps = {
  variant?: "primary" | "secondary" | "green" | "outline" | "icon" | "danger"
  isLoading?: boolean
  href?: string
}

type ButtonProps = ButtonBaseProps & (
  | (ComponentProps<"button"> & { href?: undefined })
  | (ComponentProps<typeof Link> & { href: string })
)

export function Button({ 
  children, 
  variant = "primary", 
  isLoading, 
  className, 
  href,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanca focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    primary: "bg-sanca text-white hover:bg-sanca/90 shadow-sm",
    secondary: "text-sanca bg-white hover:bg-gray-100",
    green: "bg-green-500 text-white hover:bg-green-600",
    outline: "border border-gray-200 hover:bg-gray-100 hover:text-gray-900",
    icon: "!p-0 text-gray-500 hover:text-sanca",
    danger: "bg-red-600 text-white hover:bg-red-700"
  }

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className || ""}`

  if (href) {
    return (
      <Link href={href} className={combinedClassName} {...(props as any)}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={combinedClassName}
      disabled={(props as ComponentProps<"button">).disabled || isLoading}
      type="button"
      {...(props as ComponentProps<"button">)}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}