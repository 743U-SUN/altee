"use client"

import React from "react"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/**
 * 再利用可能なセキュアフォームフィールドコンポーネント
 */

interface SecureFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  placeholder?: string
  type?: "text" | "email" | "password" | "url" | "tel"
  maxLength?: number
  required?: boolean
}

interface SecureTextareaProps<T extends FieldValues> extends SecureFieldProps<T> {
  rows?: number
}

// セキュアテキストフィールド
export function SecureTextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
  maxLength = 50,
  required = false,
}: SecureFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              maxLength={maxLength}
              autoComplete="off"
              {...field}
              value={field.value || ""} // undefinedを避ける
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// セキュアテキストエリア
export function SecureTextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  maxLength = 1000,
  rows = 4,
  required = false,
}: SecureTextareaProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              maxLength={maxLength}
              rows={rows}
              className="resize-none"
              {...field}
              value={field.value || ""} // undefinedを避ける
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// 文字数カウンター付きテキストフィールド
export function SecureTextFieldWithCounter<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
  maxLength = 50,
  required = false,
}: SecureFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={type}
                placeholder={placeholder}
                maxLength={maxLength}
                autoComplete="off"
                {...field}
                value={field.value || ""} // undefinedを避ける
              />
              <div className="absolute right-2 top-2 text-xs text-gray-400">
                {(field.value || "").length}/{maxLength}
              </div>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// メールフィールド（専用）
export function SecureEmailField<T extends FieldValues>({
  control,
  name,
  label = "メールアドレス",
  description = "有効なメールアドレスを入力してください",
  placeholder = "example@domain.com",
  required = true,
}: Omit<SecureFieldProps<T>, 'type' | 'maxLength'>) {
  return (
    <SecureTextField
      control={control}
      name={name}
      label={label}
      description={description}
      placeholder={placeholder}
      type="email"
      maxLength={255}
      required={required}
    />
  )
}

// パスワードフィールド（専用）
export function SecurePasswordField<T extends FieldValues>({
  control,
  name,
  label = "パスワード",
  description = "8文字以上で、英大文字・小文字・数字を含む必要があります",
  placeholder = "安全なパスワードを入力",
  required = true,
}: Omit<SecureFieldProps<T>, 'type' | 'maxLength'>) {
  return (
    <SecureTextField
      control={control}
      name={name}
      label={label}
      description={description}
      placeholder={placeholder}
      type="password"
      maxLength={128}
      required={required}
    />
  )
}

// URLフィールド（専用）
export function SecureUrlField<T extends FieldValues>({
  control,
  name,
  label = "URL",
  description = "https://で始まる有効なURLを入力してください",
  placeholder = "https://example.com",
  required = false,
}: Omit<SecureFieldProps<T>, 'type' | 'maxLength'>) {
  return (
    <SecureTextField
      control={control}
      name={name}
      label={label}
      description={description}
      placeholder={placeholder}
      type="url"
      maxLength={2000}
      required={required}
    />
  )
}
