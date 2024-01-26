<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"
  import Vditor from "vditor"

  export let value = ""

  let elem: HTMLElement
  let editor: Vditor

  const dispatch = createEventDispatcher()
  const uuid = Math.random().toString(36).substring(2, 15)

  onMount(() => {
    editor = new Vditor(elem.id, {
      theme: "classic",
      minHeight: 300,
      lang: "en_US",
      mode: "wysiwyg",
      input: text => {
        dispatch("input", text)
      },
      value: value,
      toolbar: ["headings", "bold", "italic", "strike", "|", "line", "quote", "list", "ordered-list"]
    })
  })
</script>

<div bind:this={elem} id={`vditor-div-${uuid}`} />
