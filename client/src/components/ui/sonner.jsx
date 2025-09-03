import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-center"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-2xl border bg-background shadow-lg p-4",
          title: "font-semibold text-base text-foreground",
          description: "text-sm text-muted-foreground opacity-80",
          actionButton:
            "bg-primary text-primary-foreground rounded-lg px-3 py-1 hover:opacity-90",
          cancelButton:
            "bg-muted text-muted-foreground rounded-lg px-3 py-1 hover:opacity-90",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
