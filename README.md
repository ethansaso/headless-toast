# headless-toast

A tiny, headless toast state manager built on Zustand.

## Install

npm i https://github.com/ethansaso/headless-toast

## Usage

```typescript
import { createToastSystem } from "headless-toast";

const { toast, useToastStore } = createToastSystem({
  variants: ["default", "success", "error"] as const,
});

toast({ title: "Saved", variant: "success" });
```
