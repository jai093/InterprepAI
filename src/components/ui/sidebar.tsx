
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------------------------------
 * Provider
 * -----------------------------------------------------------------------------------------------*/

interface SidebarProviderProps {
  children: React.ReactNode
}

interface SidebarContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [open, setOpen] = React.useState(true)

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebarContext = () => {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider")
  }
  return context
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * -----------------------------------------------------------------------------------------------*/

interface SidebarTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { open, setOpen } = useSidebarContext()
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn("p-2 rounded-md", className)}
      {...props}
    >
      {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      <span className="sr-only">{open ? "Close" : "Open"} sidebar</span>
    </button>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Sidebar
 * -----------------------------------------------------------------------------------------------*/

const sidebarVariants = cva(
  "h-full flex flex-col shrink-0 border-r border-border transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-card",
        transparent: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

export function Sidebar({ className, variant, ...props }: SidebarProps) {
  const { open } = useSidebarContext()
  return (
    <div
      className={cn(
        sidebarVariants({ variant }),
        open ? "w-64" : "w-0",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Content
 * -----------------------------------------------------------------------------------------------*/

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return <div className={cn("flex-1 overflow-auto", className)} {...props} />
}

/* -------------------------------------------------------------------------------------------------
 * Group
 * -----------------------------------------------------------------------------------------------*/

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroup({ className, ...props }: SidebarGroupProps) {
  return <div className={cn("py-2", className)} {...props} />
}

/* -------------------------------------------------------------------------------------------------
 * Group Label
 * -----------------------------------------------------------------------------------------------*/

interface SidebarGroupLabelProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function SidebarGroupLabel({
  className,
  ...props
}: SidebarGroupLabelProps) {
  return (
    <p
      className={cn("px-4 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Group Content
 * -----------------------------------------------------------------------------------------------*/

interface SidebarGroupContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupContent({
  className,
  ...props
}: SidebarGroupContentProps) {
  return <div className={cn("mt-1", className)} {...props} />
}

/* -------------------------------------------------------------------------------------------------
 * Menu
 * -----------------------------------------------------------------------------------------------*/

interface SidebarMenuProps extends React.HTMLAttributes<HTMLUListElement> {}

export function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return <ul className={cn("space-y-1", className)} {...props} />
}

/* -------------------------------------------------------------------------------------------------
 * Menu Item
 * -----------------------------------------------------------------------------------------------*/

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {}

export function SidebarMenuItem({
  className,
  ...props
}: SidebarMenuItemProps) {
  return <li className={cn("", className)} {...props} />
}

/* -------------------------------------------------------------------------------------------------
 * Menu Button
 * -----------------------------------------------------------------------------------------------*/

const menuButtonVariants = cva(
  "flex px-4 h-8 w-full cursor-pointer items-center space-x-3 text-sm rounded-md text-muted-foreground transition-all hover:text-foreground",
  {
    variants: {
      variant: {
        default: "hover:bg-secondary",
        ghost: "",
      },
      isActive: {
        true: "bg-secondary font-medium text-foreground",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      isActive: false,
    },
  }
)

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof menuButtonVariants> {
  asChild?: boolean
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    { className, variant, isActive, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? React.Fragment : 'button'
    const componentProps = asChild ? {} : { className: cn(menuButtonVariants({ variant, isActive, className })), ref, ...props }

    return (
      <Comp {...componentProps} />
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

/* -------------------------------------------------------------------------------------------------
 * Header
 * -----------------------------------------------------------------------------------------------*/

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn("h-14 flex items-center px-4 border-b border-border shrink-0", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Footer
 * -----------------------------------------------------------------------------------------------*/

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn("h-14 flex items-center px-4 border-t border-border shrink-0", className)}
      {...props}
    />
  )
}
