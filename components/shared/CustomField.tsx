import React from "react";
import { Control, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "../ui/form";

import { formSchema } from "./TransformationForm";

type FormValues = z.infer<typeof formSchema>;

type CustomFieldProps = {
  control: Control<FormValues>;
  render: (props: {
    field: ControllerRenderProps<FormValues, keyof FormValues>;
  }) => React.ReactNode;
  name: keyof FormValues;
  formLabel?: string;
  className?: string;
};

export const CustomField = ({
  control,
  render,
  name,
  formLabel,
  className,
}: CustomFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {formLabel && <FormLabel>{formLabel}</FormLabel>}
          <FormControl>{render({ field })}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
