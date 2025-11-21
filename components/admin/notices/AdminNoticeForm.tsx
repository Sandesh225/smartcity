// components/admin/notices/AdminNoticeForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Save,
  X,
  AlertCircle,
  FileText,
  Settings,
  Link2,
  Eye,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useSmartBack } from "../../../hooks/useSmartBack";

import type {
  NoticeType,
  NoticeStatus,
  WardOption,
  DepartmentOption,
} from "./types";

const NONE_DEPARTMENT_VALUE = "none";

const noticeFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  title_nepali: z.string().max(200, "Title is too long").nullable(),
  content: z.string().min(1, "Content is required"),
  content_nepali: z.string().nullable(),
  notice_type: z.enum([
    "general",
    "tender",
    "public_hearing",
    "emergency",
    "event",
  ]),
  status: z.enum(["draft", "published", "archived"]),
  published_date: z.date().nullable(),
  expiry_date: z.date().nullable(),
  is_featured: z.boolean(),
  is_urgent: z.boolean(),
  tags: z.string(),
  related_ward_ids: z.array(z.string()),
  related_department_id: z.string().nullable(),
});

type NoticeFormValues = z.infer<typeof noticeFormSchema>;

type AdminNoticeFormProps = {
  mode: "create" | "edit";
  initialValues?: any; // raw DB row; normalized below
  wards: WardOption[];
  departments: DepartmentOption[];
  onSubmit: (formData: FormData) => Promise<void>;
};

const noticeTypeLabels: Record<NoticeType, string> = {
  general: "General",
  tender: "Tender",
  public_hearing: "Public Hearing",
  emergency: "Emergency",
  event: "Event",
};

const statusLabels: Record<NoticeStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function AdminNoticeForm({
  mode,
  initialValues,
  wards,
  departments,
  onSubmit,
}: AdminNoticeFormProps) {
  const router = useRouter();
  const smartBack = useSmartBack("/admin/notices");

  const defaultValues: NoticeFormValues = {
    id: initialValues?.id,
    title: initialValues?.title ?? "",
    title_nepali: initialValues?.title_nepali ?? null,
    content: initialValues?.content ?? "",
    content_nepali: initialValues?.content_nepali ?? null,
    notice_type: (initialValues?.notice_type as NoticeType) ?? "general",
    status: (initialValues?.status as NoticeStatus) ?? "draft",
    published_date: initialValues?.published_date
      ? new Date(initialValues.published_date)
      : null,
    expiry_date: initialValues?.expiry_date
      ? new Date(initialValues.expiry_date)
      : null,
    is_featured: initialValues?.is_featured ?? false,
    is_urgent: initialValues?.is_urgent ?? false,
    tags:
      initialValues?.tags && Array.isArray(initialValues.tags)
        ? initialValues.tags.join(", ")
        : "",
    related_ward_ids:
      (initialValues?.related_ward_ids as (string | number)[] | undefined)?.map(
        (id) => String(id)
      ) ?? [],
    related_department_id:
      initialValues?.related_department_id != null
        ? String(initialValues.related_department_id)
        : null,
  };

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues,
  });

  // “Applies to all wards” toggle
  const [appliesToAllWards, setAppliesToAllWards] = useState(
    defaultValues.related_ward_ids.length === 0
  );

  useEffect(() => {
    if (appliesToAllWards) {
      form.setValue("related_ward_ids", [], { shouldValidate: true });
    }
  }, [appliesToAllWards, form]);

  const handleFormSubmit = async (values: NoticeFormValues) => {
    const fd = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        fd.append(key, "");
      } else if (value instanceof Date) {
        fd.append(key, value.toISOString());
      } else if (Array.isArray(value)) {
        value.forEach((item) => fd.append(key, item));
      } else if (typeof value === "boolean") {
        fd.append(key, value.toString());
      } else {
        fd.append(key, value.toString());
      }
    });

    try {
      await onSubmit(fd);
    } catch (err) {
      console.error("Notice form submit failed", err);
      // TODO: integrate with toast system
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold tracking-tight text-slate-100">
                  {mode === "create" ? "Create Notice" : "Edit Notice"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Publish and manage city notices that appear in the Citizen
                  Portal.
                </CardDescription>
              </div>
              <Badge
                variant={mode === "create" ? "default" : "secondary"}
                className="ml-auto"
              >
                {mode === "create" ? "New" : "Editing"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Basic Information
                </h3>
              </div>
              <Separator className="bg-slate-800" />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Scheduled Water Supply Maintenance"
                          className="border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title_nepali"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Title (Nepali)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="शीर्षक (नेपालीमा)"
                          className="border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-500">
                        Optional localized title for Nepali speakers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Content
                </h3>
              </div>
              <Separator className="bg-slate-800" />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Content <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed notice content in English..."
                          className="min-h-[140px] resize-y border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content_nepali"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Content (Nepali)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="नेपाली सामग्री यहाँ लेख्नुहोस्..."
                          className="min-h-[140px] resize-y border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-500">
                        Localized content for better accessibility.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Publishing Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Publishing Settings
                </h3>
              </div>
              <Separator className="bg-slate-800" />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Notice Type */}
                <FormField
                  control={form.control}
                  name="notice_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Notice Type
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-700 bg-slate-950/70 text-slate-100">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-slate-700 bg-slate-900">
                          {Object.entries(noticeTypeLabels).map(
                            ([value, label]) => (
                              <SelectItem
                                key={value}
                                value={value}
                                className="text-slate-100"
                              >
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-700 bg-slate-950/70 text-slate-100">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-slate-700 bg-slate-900">
                          {Object.entries(statusLabels).map(
                            ([value, label]) => (
                              <SelectItem
                                key={value}
                                value={value}
                                className="text-slate-100"
                              >
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Published Date */}
                <FormField
                  control={form.control}
                  name="published_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-200">
                        Published Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "border-slate-700 bg-slate-950/70 pl-3 text-left font-normal text-slate-100 hover:bg-slate-900 hover:text-slate-100",
                                !field.value && "text-slate-500"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto border-slate-700 bg-slate-900 p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={field.onChange}
                            initialFocus
                            className="text-slate-100"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-xs text-slate-500">
                        If left empty and status is published, it will default
                        to now.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expiry Date */}
                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-200">
                        Expiry Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "border-slate-700 bg-slate-950/70 pl-3 text-left font-normal text-slate-100 hover:bg-slate-900 hover:text-slate-100",
                                !field.value && "text-slate-500"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto border-slate-700 bg-slate-900 p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={field.onChange}
                            initialFocus
                            className="text-slate-100"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-xs text-slate-500">
                        Optional date after which the notice is treated as
                        expired.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="road, water, public-hearing"
                          className="border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-500">
                        Comma-separated tags for better categorization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Associations */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Associations
                </h3>
              </div>
              <Separator className="bg-slate-800" />

              <div className="space-y-4">
                {/* All wards vs specific wards */}
                <div className="flex items-center justify-between gap-4 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Applies to all wards
                    </p>
                    <p className="text-xs text-slate-500">
                      Turn off to target specific wards only.
                    </p>
                  </div>
                  <Switch
                    checked={appliesToAllWards}
                    onCheckedChange={setAppliesToAllWards}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Related Wards (multi-select) */}
                  <FormField
                    control={form.control}
                    name="related_ward_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">
                          Related Wards
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                disabled={appliesToAllWards}
                                className={cn(
                                  "h-auto min-h-[40px] w-full justify-between border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900 hover:text-slate-100",
                                  !field.value.length && "text-slate-500",
                                  appliesToAllWards &&
                                    "cursor-not-allowed opacity-60"
                                )}
                              >
                                <div className="flex flex-wrap gap-1">
                                  {appliesToAllWards ? (
                                    <span>All wards</span>
                                  ) : field.value.length > 0 ? (
                                    field.value.map((wardId) => {
                                      const ward = wards.find(
                                        (w) => String(w.id) === wardId
                                      );
                                      return ward ? (
                                        <Badge
                                          key={wardId}
                                          variant="secondary"
                                          className="mr-1"
                                        >
                                          Ward {ward.ward_number}
                                        </Badge>
                                      ) : null;
                                    })
                                  ) : (
                                    <span>Select wards...</span>
                                  )}
                                </div>
                                <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          {!appliesToAllWards && (
                            <PopoverContent
                              className="w-[400px] border-slate-700 bg-slate-900 p-0"
                              align="start"
                            >
                              <Command className="bg-slate-900">
                                <CommandInput
                                  placeholder="Search wards..."
                                  className="text-slate-100"
                                />
                                <CommandList>
                                  <CommandEmpty className="py-6 text-center text-sm text-slate-400">
                                    No wards found
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {wards.map((ward) => {
                                      const wardId = String(ward.id);
                                      const isSelected =
                                        field.value.includes(wardId);
                                      return (
                                        <CommandItem
                                          key={wardId}
                                          value={wardId}
                                          className="cursor-pointer text-slate-100"
                                          onSelect={(value) => {
                                            const normalized = String(value);
                                            const exists =
                                              field.value.includes(normalized);
                                            const newValue = exists
                                              ? field.value.filter(
                                                  (v) => v !== normalized
                                                )
                                              : [...field.value, normalized];
                                            field.onChange(newValue);
                                          }}
                                        >
                                          <div
                                            className={cn(
                                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-700",
                                              isSelected
                                                ? "bg-emerald-600 text-slate-950"
                                                : "opacity-50"
                                            )}
                                          >
                                            {isSelected && (
                                              <span className="text-xs">✓</span>
                                            )}
                                          </div>
                                          Ward {ward.ward_number}:{" "}
                                          {ward.ward_name}
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          )}
                        </Popover>
                        <FormDescription className="text-xs text-slate-500">
                          Leave empty (or enable &quot;All wards&quot;) for
                          citywide notices.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Related Department */}
                  <FormField
                    control={form.control}
                    name="related_department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">
                          Related Department
                        </FormLabel>
                        <Select
                          value={field.value ?? NONE_DEPARTMENT_VALUE}
                          onValueChange={(val) =>
                            field.onChange(
                              val === NONE_DEPARTMENT_VALUE ? null : val
                            )
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="border-slate-700 bg-slate-950/70 text-slate-100">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-slate-700 bg-slate-900">
                            <SelectItem
                              value={NONE_DEPARTMENT_VALUE}
                              className="text-slate-100"
                            >
                              None
                            </SelectItem>
                            {departments.map((dept) => (
                              <SelectItem
                                key={String(dept.id)}
                                value={String(dept.id)}
                                className="text-slate-100"
                              >
                                {dept.department_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs text-slate-500">
                          Optionally assign a responsible department.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Display Options
                </h3>
              </div>
              <Separator className="bg-slate-800" />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
                      <div>
                        <FormLabel className="text-slate-200">
                          Featured notice
                        </FormLabel>
                        <FormDescription className="text-xs text-slate-500">
                          Featured notices appear prominently in citizen view.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_urgent"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
                      <div>
                        <FormLabel className="text-slate-200">
                          Mark as urgent
                        </FormLabel>
                        <FormDescription className="text-xs text-slate-500">
                          Urgent notices are highlighted for quick attention.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <Button
              type="button"
              variant="ghost"
              onClick={smartBack}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 text-slate-950 hover:bg-emerald-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {mode === "create" ? "Create Notice" : "Save Changes"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
