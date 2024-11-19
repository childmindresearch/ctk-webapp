<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte"
    import Vditor from "vditor"
    import LoadingBar from "./LoadingBar.svelte"

    export let value = ""

    let elem: HTMLElement

    const dispatch = createEventDispatcher()
    const uuid = Math.random().toString(36).substring(2, 15)
    let mounted = false

    onMount(() => {
        new Vditor(elem.id, {
            theme: "classic",
            minHeight: 300,
            height: 500,
            lang: "en_US",
            mode: "wysiwyg",
            input: text => {
                dispatch("input", text)
            },
            value: value,
            toolbar: ["headings", "bold", "italic", "strike", "|", "line", "quote", "list", "ordered-list", "table"],
            cache: {
                enable: false
            }
        })
    })

    function isMounted(elem: HTMLDivElement) {
        // Vditor is instantly initalized, but rendering takes a while.
        while (elem.children.length == 0) {
            setTimeout(() => {
                isMounted(elem)
            }, 10)
            return
        }
        mounted = true
    }
</script>

{#if !mounted}
    <LoadingBar label="Loading editor..." />
{/if}
<div bind:this={elem} id={`vditor-div-${uuid}`} data-testid="vditor-div" use:isMounted></div>
