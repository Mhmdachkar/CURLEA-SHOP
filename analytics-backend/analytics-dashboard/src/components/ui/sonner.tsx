import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      duration={3000}
      theme="dark"
      expand
      visibleToasts={3}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'data-[type=success]:animate-in',
          description: 'text-white/80',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
        }
      }}
      className="toaster-black"
      {...props}
    />
  );
};

export { Toaster, toast };
