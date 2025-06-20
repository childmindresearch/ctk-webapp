<script lang="ts">
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

<div class="card p-4 w-modal-wide shadow-xl space-y-4">
    <p>{instructions}</p>
    <form onsubmit={localOnSubmit}>
        <label>
            DSM Code
            <input class="input" bind:value={code} />
        </label>
        <label>
            DSM Label
            <input class="input" bind:value={label} />
        </label>
        <button class="btn variant-filled-primary" type="submit"> Submit </button>
    </form>
</div>
