/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { type JSX, useEffect, useMemo } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type ZodTypeAny, z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { colSpanMap } from "@/lib/utils";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export type FieldType = "text" | "number" | "dropdown" | "radio" | "checkbox" | "textarea";

export interface FormFieldSchema {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: any }[];
  validation?: {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
  };
  constraint?: "emoji" | "lettersOnly" | "numericOnly";
  wrapperClass?: string;
  labelClass?: string;
  inputClass?: string;
  className?: string;
  layout?: {
    colSpan?: number;
  };
  render?: (form: any) => JSX.Element;
}

export interface DynamicFormProps {
  schema: FormFieldSchema[];
  onSubmit: (data: any) => void;
  loading?: boolean;
  editItem?: Partial<any>;
  defaultValues?: Partial<any>;
  formClass?: string;
  gridClass?: string;
}

export default function DynamicForm({
  schema,
  onSubmit,
  loading,
  editItem,
  defaultValues,
  formClass,
  gridClass,
}: DynamicFormProps) {
  const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)+$/u;
  const lettersRegex = /^[A-Za-z ]+$/;
  const numericRegex = /^[0-9]+$/;

  const formSchema = useMemo(() => {
    const zodSchemaObject: Record<string, ZodTypeAny> = {};

    schema.forEach((field) => {
      let validator = z.string();

      if (field.constraint === "emoji")
        validator = validator.regex(emojiRegex, "Only emojis allowed");
      if (field.constraint === "lettersOnly")
        validator = validator.regex(lettersRegex, "Only letters allowed");
      if (field.constraint === "numericOnly")
        validator = validator.regex(numericRegex, "Only numbers allowed");

      if (field.validation?.required) validator = validator.min(1, `${field.label} is required`);
      if (field.validation?.maxLength) validator = validator.max(field.validation.maxLength);

      zodSchemaObject[field.name] = validator;
    });

    return z.object(zodSchemaObject);
  }, [schema]);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (editItem) form.reset(editItem);
    else form.reset(defaultValues);
  }, [editItem]);

  const handleSubmit: SubmitHandler<any> = (data) => {
    if (editItem?.id) data.id = editItem.id;
    onSubmit(data);
  };

  const applyConstraint = (value: string, constraint?: string) => {
    if (!constraint) return value;
    if (constraint === "emoji") return [...value].filter((v) => emojiRegex.test(v)).join("");
    if (constraint === "lettersOnly") return value.replace(/[^A-Za-z ]/g, "");
    if (constraint === "numericOnly") return value.replace(/[^0-9]/g, "");
    return value;
  };

  const renderField = (field: FormFieldSchema) => {
    const v = form.watch(field.name);

    if (field.render) return field.render(form);

    if (["text", "number"].includes(field.type)) {
      return (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          className={field.inputClass}
          value={v || ""}
          onChange={(e) =>
            form.setValue(field.name, applyConstraint(e.target.value, field.constraint))
          }
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          placeholder={field.placeholder}
          className={field.inputClass}
          value={v || ""}
          onChange={(e) =>
            form.setValue(field.name, applyConstraint(e.target.value, field.constraint))
          }
        />
      );
    }

    if (field.type === "dropdown") {
      return (
        <Select value={v} onValueChange={(val) => form.setValue(field.name, val)}>
          <SelectTrigger className={field.inputClass}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "radio") {
      return (
        <RadioGroup
          value={v}
          onValueChange={(val) => form.setValue(field.name, val)}
          className={field.inputClass}
        >
          {field.options?.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} />
              <label>{opt.label}</label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    if (field.type === "checkbox") {
      return (
        <Checkbox
          checked={!!v}
          className={field.inputClass}
          onCheckedChange={(val) => form.setValue(field.name, val)}
        />
      );
    }

    return null;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={formClass}>
        <div className={gridClass || "grid grid-cols-12 gap-4"}>
          {schema.map((field) => (
            <div
              key={field.name}
              className={`${colSpanMap[field.layout?.colSpan || 12]} ${field.className}`}
            >
              <FormField
                control={form.control}
                name={field.name}
                render={() => (
                  <FormItem className={field.wrapperClass}>
                    <FormLabel className={field.labelClass}>{field.label}</FormLabel>
                    <FormControl>{renderField(field)}</FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
