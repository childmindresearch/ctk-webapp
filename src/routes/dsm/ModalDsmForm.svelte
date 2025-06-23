<script lang="ts">
    type Props = {
        code: string
        label: string
        instructions: string
        onSubmit: (code: string, label: string) => void
    }
    let { code, label, onSubmit, instructions }: Props = $props()

    function localOnSubmit() {
        onSubmit(code, label)
    }
</script>

<div class="p-4 space-y-4 w-[80%]">
    <p>{instructions}</p>
    <form class="space-y-4" onsubmit={localOnSubmit}>
        <label>
            DSM Code
            <input class="input" bind:value={code} />
        </label>
        <label>
            DSM Label
            <input class="input" bind:value={label} />
        </label>
        <button class="btn preset-filled-primary-500" type="submit"> Submit </button>
    </form>
</div>
