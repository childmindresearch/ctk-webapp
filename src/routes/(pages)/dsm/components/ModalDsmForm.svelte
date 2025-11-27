<script lang="ts">
    import { Button } from "$lib/shadcn/components/ui/button"
    import { Input } from "$lib/shadcn/components/ui/input"
    import { Label } from "$lib/shadcn/components/ui/label"

    type Props = {
        code: string
        label: string
        instructions: string
        onSubmit: (code: string, label: string) => void
    }

    let { code, label, onSubmit, instructions }: Props = $props()

    function localOnSubmit(event: Event) {
        event.preventDefault()
        onSubmit(code, label)
    }
</script>

<div class="p-4 space-y-4 w-[80%]">
    <p class="text-sm text-muted-foreground">{instructions}</p>
    <form class="space-y-4" onsubmit={localOnSubmit}>
        <div class="space-y-2">
            <Label for="dsm-code">DSM Code</Label>
            <Input id="dsm-code" bind:value={code} />
        </div>
        <div class="space-y-2">
            <Label for="dsm-label">DSM Label</Label>
            <Input id="dsm-label" bind:value={label} />
        </div>
        <Button type="submit">Submit</Button>
    </form>
</div>
