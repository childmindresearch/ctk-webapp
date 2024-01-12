<script lang="ts">
  import Toast from "$lib/components/Toast.svelte"
  import { Textarea, Toolbar, ToolbarButton, ToolbarGroup } from "flowbite-svelte"
  import { CopySolid, FileCheckSolid, FileEditSolid, TrashBinSolid } from "flowbite-svelte-icons"
  import { createEventDispatcher } from "svelte"

  export let text = ""

  const dispatch = createEventDispatcher()

  let toastTriggerCopy = false
  let toastTriggerSave = false

  function onCopyButtonClick(text: string) {
    toastTriggerCopy = true
    return () => {
      navigator.clipboard.writeText(text)
    }
  }

  function onEditButtonClick() {
    dispatch("edit")
  }

  function onDeleteButtonClick() {
    dispatch("delete")
  }

  function onSaveButtonClick() {
    toastTriggerSave = true
    dispatch("save")
  }
</script>

<Textarea disabled rows="10" value={text}>
  <Toolbar slot="header" embedded color="gray">
    <b>Template Text</b>
    <ToolbarGroup name="controls" slot="end">
      <ToolbarButton name="save" on:click={onSaveButtonClick}>
        <div class="flex align-middle"><FileCheckSolid disabled class="pointer-events-none" />Save</div>
      </ToolbarButton>
      <ToolbarButton name="copy" on:click={onCopyButtonClick(text)}
        ><div class="flex align-middle"><CopySolid disabled class="pointer-events-none" />Copy</div></ToolbarButton
      >
      <ToolbarButton name="edit" on:click={onEditButtonClick}>
        <div class="flex align-middle"><FileEditSolid disabled class="pointer-events-none" />Edit</div>
      </ToolbarButton>
      <ToolbarButton name="delete" on:click={onDeleteButtonClick}>
        <div class="flex align-middle"><TrashBinSolid disabled class="pointer-events-none" />Delete</div>
      </ToolbarButton>
    </ToolbarGroup>
  </Toolbar>
</Textarea>

<Toast bind:open={toastTriggerSave} message="Saved template" type="success" />
<Toast bind:open={toastTriggerCopy} message="Copied to clipboard" type="success" />
