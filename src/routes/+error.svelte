<script>
  import { page } from "$app/state";

  import { Button } from "$lib/components/ui/button";

  import { AlertTriangle } from "lucide-svelte";
</script>

<div class="min-h-screen bg-background flex items-center justify-center p-4">
  <div class="max-w-md w-full space-y-8 text-center">
      <div class="space-y-2">
          <AlertTriangle
              class="mx-auto h-12 w-12 text-destructive"
              aria-hidden="true"
          />
          <h1 class="text-4xl font-bold tracking-tight">
              Oops! Something went wrong
          </h1>
          <p class="text-xl text-muted-foreground">
              Error {page.status}: {page.error.message}
          </p>
      </div>
      <div class="bg-muted p-6 rounded-lg space-y-4">
          <p class="text-lg">
              We're sorry, but it looks like we've encountered an unexpected
              issue. Our team has been notified and is working on resolving it
              as quickly as possible.
          </p>
          <p class="text-muted-foreground">
              In the meantime, you can try refreshing the page or come back
              later. If the problem persists, please don't hesitate to contact
              our support team.
          </p>
      </div>
      <div>
          <Button class="w-full sm:w-auto" href="/">
              Return to Home Page
          </Button>
      </div>
  </div>
</div>