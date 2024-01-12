<!--
  @component
  @prop {Diagnosis[]} diagnoses - The diagnoses that the user has selected.
  @prop {boolean} open - Whether the modal is open or not.

  This component is used to display the diagnoses that the user has selected.
  It also allows the user to change the order of the diagnoses and to copy the
  diagnoses to the clipboard.
-->

<script lang="ts">
  import { Button, Input, Label, Listgroup, ListgroupItem, Modal } from "flowbite-svelte"
  import { ArrowDownSolid, ArrowUpSolid, CopySolid, TrashBinSolid } from "flowbite-svelte-icons"
  import Toast from "../Toast.svelte"
  import type { DiagnosisNode } from "./utils"

  export let diagnoses: DiagnosisNode[]
  export let open = false

  let templateNames: string[]
  let templateValues: string[] = []

  let toastCopyDiagnosis = false
  let toastTemplatesNotFilled = false

  const iconClass =
    "cursor-pointer hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-primary-700 dark:text-gray-400 md:dark:text-white md:dark:hover:text-primary-700 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"

  function removeDiagnosis(diagnosis: DiagnosisNode): void {
    diagnoses = diagnoses.filter(d => d.text !== diagnosis.text)
  }

  function getDiagnosisPath(diagnosis: DiagnosisNode): string {
    return diagnosis.pathString().replace(/^root > /, "")
  }

  function shiftDiagnosis(diagnosis: DiagnosisNode, shift: number): void {
    const index = diagnoses.findIndex(d => d.text === diagnosis.text)
    if (index === -1) return
    const newIndex = index + shift
    if (newIndex < 0 || newIndex >= diagnoses.length) return
    const result = [...diagnoses]
    const [removed] = result.splice(index, 1)
    result.splice(newIndex, 0, removed)
    diagnoses = result
  }

  function allUpperCaseUnderscoreToCapitalizedSpace(input: string): string {
    return input
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  function getTemplateText(): string[] {
    let templates = new Set<string>()
    diagnoses.forEach(diagnosis => {
      const matches = diagnosis.text.match(/{{(.*?)}}/g)
      if (!matches) return
      matches.forEach(match => {
        const template = match.replace(/{{|}}/g, "").trim()
        templates.add(template)
      })
    })
    return Array.from(templates)
  }

  function copyDiagnosesToClipboard(diagnoses: DiagnosisNode[]): void {
    if (templateValues.some(value => value === "")) {
      toastTemplatesNotFilled = true
      return
    }

    const text = diagnoses
      .map(diagnosis => {
        let template = diagnosis.text
        templateValues.forEach((value, index) => {
          const templateName = templateNames[index]
          template = template.replace(new RegExp(`{{${templateName}}}`, "g"), value)
        })
        return template
      })
      .join("\n\n")
    toastCopyDiagnosis = true
    navigator.clipboard.writeText(text)
  }

  function handleInput(index: number, event: Event): void {
    const target = event.target as HTMLInputElement
    templateValues[index] = target.value
  }

  $: diagnoses, (templateNames = getTemplateText())
  $: templateValues = templateNames.map(() => "")
</script>

<Modal title="Diagnoses" bind:open size="xl">
  {#if diagnoses.length === 0}
    <p>No diagnoses selected.</p>
  {:else}
    <Listgroup title="Selections" items={diagnoses} let:item on:click()>
      <ListgroupItem>
        <div class="flex gap-3 items-center">
          <TrashBinSolid on:click={() => removeDiagnosis(item)} class={iconClass} />
          <ArrowDownSolid on:click={() => shiftDiagnosis(item, 1)} class={iconClass} />
          <ArrowUpSolid on:click={() => shiftDiagnosis(item, -1)} class={iconClass} />
          <span>{getDiagnosisPath(item)}</span>
        </div>
      </ListgroupItem>
    </Listgroup>

    {#each templateNames as name, index}
      <div>
        <Label>{allUpperCaseUnderscoreToCapitalizedSpace(name)}</Label>
        <Input type="text" on:input={e => handleInput(index, e)} />
      </div>
    {/each}

    <Button class="mt-5" on:click={() => copyDiagnosesToClipboard(diagnoses)}>
      <CopySolid class="mr-2" />
      Copy to clipboard
    </Button>
  {/if}
</Modal>

<Toast type="success" bind:open={toastCopyDiagnosis} message="Templates copied to clipboard." />
<Toast type="error" bind:open={toastTemplatesNotFilled} message="Please fill in all text boxes." />
