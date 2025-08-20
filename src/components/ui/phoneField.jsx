"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { label: "United States", code: "US", dial: "+1", flag: "🇺🇸" },
  { label: "United Kingdom", code: "GB", dial: "+44", flag: "🇬🇧" },
  { label: "Canada", code: "CA", dial: "+1", flag: "🇨🇦" },
  { label: "Nigeria", code: "NG", dial: "+234", flag: "🇳🇬" },
  { label: "Ghana", code: "GH", dial: "+233", flag: "🇬🇭" },
  { label: "Kenya", code: "KE", dial: "+254", flag: "🇰🇪" },
  { label: "South Africa", code: "ZA", dial: "+27", flag: "🇿🇦" },
  { label: "Germany", code: "DE", dial: "+49", flag: "🇩🇪" },
  { label: "France", code: "FR", dial: "+33", flag: "🇫🇷" },
  { label: "India", code: "IN", dial: "+91", flag: "🇮🇳" },
];

export default function PhoneField({
  onDotNotationChange,
  countryCode,
  number,
  errorCountryCode,
  errorNumber,
  numberPlaceholder = "8012345678",
  className,
}) {
  const [open, setOpen] = React.useState(false);

  // Find the selected country entry by dial code
  const selected =
    COUNTRIES.find((c) => c.dial === countryCode) ??
    // fallback if user typed a custom code not in list
    { label: "Custom", code: "XX", dial: countryCode || "", flag: "🏳️" };

  // Utility to fire a synthetic event your handler understands
  const fireChange = (name, value) =>
    onDotNotationChange({ target: { name, value } });

  // Keep only digits for number input; you can relax this if needed
  const handleNumberChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    fireChange("phone.number", digitsOnly);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Country code combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-36 justify-between",
              errorCountryCode && "border-destructive"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <span className="text-lg">{selected.flag}</span>
              <span className="truncate">{selected.dial || "+––"}</span>
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country or code…" />
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {COUNTRIES.map((c) => {
                const isSelected = c.dial === countryCode;
                return (
                  <CommandItem
                    key={c.code}
                    value={`${c.label} ${c.dial}`}
                    onSelect={() => {
                      fireChange("phone.countryCode", c.dial);
                      setOpen(false);
                    }}
                    className="gap-2"
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="flex-1 truncate">{c.label}</span>
                    <span className="opacity-70">{c.dial}</span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Local number input */}
      <div className="flex-1">
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={numberPlaceholder}
          name="phone.number"
          value={number}
          onChange={handleNumberChange}
          className={cn(errorNumber && "border-destructive")}
        />
        {/* subtle helper/validation text (optional) */}
        <div className="mt-1 text-xs text-muted-foreground">
          Enter digits only. We’ll format it later.
        </div>
      </div>
    </div>
  );
}
