import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  useFormContext,
} from "react-hook-form";

const Form = ({ ...props }) => {
  return <form {...props} />;
};

const FormField = ({ name, render }) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={render}
    />
  );
};

const FormItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`space-y-2 ${className || ""}`} {...props} />
));
FormItem.displayName = "FormItem";

const FormLabel = ({ className, ...props }) => (
  <label className={`text-sm font-medium ${className || ""}`} {...props} />
);

const FormControl = React.forwardRef(({ ...props }, ref) => {
  return <Slot ref={ref} {...props} />;
});
FormControl.displayName = "FormControl";

const FormMessage = ({ children, className }) => {
  if (!children) return null;
  return <p className={`text-sm text-red-600 ${className || ""}`}>{children}</p>;
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
};
